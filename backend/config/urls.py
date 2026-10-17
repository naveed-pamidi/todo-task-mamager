from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def home(request):
    return JsonResponse({"app": "Daybook API", "tasks": "/api/tasks/", "stats": "/api/tasks/stats/"})


urlpatterns = [
    path("", home),
    path("api/", include("tasks.urls")),
    path("admin/", admin.site.urls),
]
