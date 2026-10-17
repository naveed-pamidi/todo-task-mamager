from datetime import date

from django.db.models import Case, F, IntegerField, Q, Value, When
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """
    CRUD API for tasks.

    GET    /api/tasks/            list (supports ?status=&priority=&deadline=&search=&overdue=&ordering=)
    POST   /api/tasks/            create
    GET    /api/tasks/{id}/       retrieve
    PUT    /api/tasks/{id}/       full update
    PATCH  /api/tasks/{id}/       partial update (e.g. toggle status)
    DELETE /api/tasks/{id}/       delete
    GET    /api/tasks/stats/      counts for all / pending / completed / overdue
    """

    serializer_class = TaskSerializer
    pagination_class = None

    def get_queryset(self):
        qs = Task.objects.all()
        if self.action != "list":
            return qs

        params = self.request.query_params

        status = params.get("status")
        if status:
            if status not in Task.Status.values:
                raise ValidationError({"status": "Use 'pending' or 'completed'."})
            qs = qs.filter(status=status)

        priority = params.get("priority")
        if priority:
            if priority not in Task.Priority.values:
                raise ValidationError({"priority": "Use 'low', 'medium' or 'high'."})
            qs = qs.filter(priority=priority)

        deadline = params.get("deadline")
        if deadline:
            try:
                qs = qs.filter(deadline=date.fromisoformat(deadline))
            except ValueError:
                raise ValidationError({"deadline": "Use YYYY-MM-DD."})

        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))

        if params.get("overdue", "").lower() in ("1", "true"):
            qs = qs.filter(status=Task.Status.PENDING, deadline__lt=timezone.localdate())

        return self._order(qs, params.get("ordering", ""))

    @staticmethod
    def _order(qs, ordering):
        done_last = Case(
            When(status=Task.Status.COMPLETED, then=Value(1)),
            default=Value(0),
            output_field=IntegerField(),
        )
        priority_rank = Case(
            When(priority=Task.Priority.HIGH, then=Value(0)),
            When(priority=Task.Priority.MEDIUM, then=Value(1)),
            default=Value(2),
            output_field=IntegerField(),
        )
        if ordering == "priority":
            return qs.annotate(_done=done_last, _rank=priority_rank).order_by(
                "_done", "_rank", F("deadline").asc(nulls_last=True)
            )
        if ordering == "newest":
            return qs.order_by("-created_at")
        # Default: open tasks first, soonest deadline first, tasks without deadline last.
        return qs.annotate(_done=done_last).order_by(
            "_done", F("deadline").asc(nulls_last=True), "-created_at"
        )

    @action(detail=False, methods=["get"])
    def stats(self, request):
        today = timezone.localdate()
        return Response(
            {
                "all": Task.objects.count(),
                "pending": Task.objects.filter(status=Task.Status.PENDING).count(),
                "completed": Task.objects.filter(status=Task.Status.COMPLETED).count(),
                "overdue": Task.objects.filter(status=Task.Status.PENDING, deadline__lt=today).count(),
            }
        )
