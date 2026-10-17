from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    title = serializers.CharField(
        max_length=200,
        error_messages={
            "required": "Task title is required.",
            "blank": "Task title cannot be empty.",
            "null": "Task title cannot be empty.",
            "max_length": "Task title must be 200 characters or fewer.",
        },
    )
    description = serializers.CharField(required=False, allow_blank=True, default="")
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "deadline",
            "status",
            "priority",
            "is_overdue",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "completed_at", "created_at", "updated_at"]
        extra_kwargs = {
            "deadline": {"error_messages": {"invalid": "Enter a valid date in YYYY-MM-DD format."}},
            "status": {"error_messages": {"invalid_choice": "Status must be 'pending' or 'completed'."}},
            "priority": {"error_messages": {"invalid_choice": "Priority must be 'low', 'medium' or 'high'."}},
        }

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Task title cannot be empty.")
        return value
