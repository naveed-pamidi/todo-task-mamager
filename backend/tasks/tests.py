from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Task


class TaskApiTests(APITestCase):
    def setUp(self):
        self.list_url = reverse("task-list")
        self.today = timezone.localdate()

    def make(self, **kw):
        data = {"title": "Sample", "deadline": self.today + timedelta(days=2)}
        data.update(kw)
        return Task.objects.create(**data)

    # ---- Create -------------------------------------------------------
    def test_create_task(self):
        payload = {"title": "Write report", "description": "Q3 numbers", "deadline": "2030-01-15", "priority": "high"}
        res = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["status"], "pending")
        self.assertEqual(res.data["priority"], "high")
        self.assertEqual(Task.objects.count(), 1)

    def test_create_defaults(self):
        res = self.client.post(self.list_url, {"title": "Minimal"}, format="json")
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["priority"], "medium")
        self.assertIsNone(res.data["deadline"])

    def test_empty_title_rejected(self):
        for bad in ["", "   "]:
            res = self.client.post(self.list_url, {"title": bad}, format="json")
            self.assertEqual(res.status_code, 400)
            self.assertEqual(res.data["title"][0], "Task title cannot be empty.")
        self.assertEqual(Task.objects.count(), 0)

    def test_missing_title_rejected(self):
        res = self.client.post(self.list_url, {"description": "x"}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("title", res.data)

    def test_invalid_choices_and_date_rejected(self):
        res = self.client.post(
            self.list_url,
            {"title": "x", "priority": "urgent", "status": "done", "deadline": "tomorrow"},
            format="json",
        )
        self.assertEqual(res.status_code, 400)
        self.assertEqual(set(res.data), {"priority", "status", "deadline"})

    def test_title_is_trimmed(self):
        res = self.client.post(self.list_url, {"title": "  Hello  "}, format="json")
        self.assertEqual(res.data["title"], "Hello")

    # ---- Read ---------------------------------------------------------
    def test_list_and_retrieve(self):
        t = self.make(title="A")
        self.make(title="B")
        self.assertEqual(len(self.client.get(self.list_url).data), 2)
        res = self.client.get(reverse("task-detail", args=[t.id]))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["title"], "A")

    def test_retrieve_missing_returns_404(self):
        self.assertEqual(self.client.get(reverse("task-detail", args=[999])).status_code, 404)

    # ---- Update -------------------------------------------------------
    def test_put_updates_task(self):
        t = self.make()
        res = self.client.put(
            reverse("task-detail", args=[t.id]),
            {"title": "New", "description": "d", "deadline": "2031-02-02", "priority": "low", "status": "pending"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        t.refresh_from_db()
        self.assertEqual((t.title, t.priority), ("New", "low"))

    def test_put_with_empty_title_rejected(self):
        t = self.make(title="Keep")
        res = self.client.put(reverse("task-detail", args=[t.id]), {"title": ""}, format="json")
        self.assertEqual(res.status_code, 400)
        t.refresh_from_db()
        self.assertEqual(t.title, "Keep")

    def test_patch_toggles_status_and_sets_completed_at(self):
        t = self.make()
        url = reverse("task-detail", args=[t.id])
        res = self.client.patch(url, {"status": "completed"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertIsNotNone(res.data["completed_at"])
        res = self.client.patch(url, {"status": "pending"}, format="json")
        self.assertIsNone(res.data["completed_at"])

    def test_patch_empty_title_rejected(self):
        t = self.make()
        res = self.client.patch(reverse("task-detail", args=[t.id]), {"title": " "}, format="json")
        self.assertEqual(res.status_code, 400)

    # ---- Delete -------------------------------------------------------
    def test_delete(self):
        t = self.make()
        res = self.client.delete(reverse("task-detail", args=[t.id]))
        self.assertEqual(res.status_code, 204)
        self.assertEqual(Task.objects.count(), 0)

    # ---- Filters / search / overdue ----------------------------------
    def test_status_filter(self):
        self.make(title="p")
        self.make(title="c", status="completed")
        self.assertEqual([t["title"] for t in self.client.get(self.list_url, {"status": "pending"}).data], ["p"])
        self.assertEqual([t["title"] for t in self.client.get(self.list_url, {"status": "completed"}).data], ["c"])
        self.assertEqual(self.client.get(self.list_url, {"status": "nope"}).status_code, 400)

    def test_priority_filter(self):
        self.make(title="h", priority="high")
        self.make(title="l", priority="low")
        res = self.client.get(self.list_url, {"priority": "high"})
        self.assertEqual([t["title"] for t in res.data], ["h"])

    def test_deadline_filter(self):
        self.make(title="a", deadline=self.today)
        self.make(title="b", deadline=self.today + timedelta(days=1))
        res = self.client.get(self.list_url, {"deadline": self.today.isoformat()})
        self.assertEqual([t["title"] for t in res.data], ["a"])
        self.assertEqual(self.client.get(self.list_url, {"deadline": "xx"}).status_code, 400)

    def test_search_title_and_description(self):
        self.make(title="Buy milk")
        self.make(title="Call mum", description="about the MILK delivery")
        self.make(title="Other")
        res = self.client.get(self.list_url, {"search": "milk"})
        self.assertEqual(len(res.data), 2)

    def test_overdue(self):
        past = self.today - timedelta(days=3)
        self.make(title="late", deadline=past)
        self.make(title="late but done", deadline=past, status="completed")
        self.make(title="future")
        res = self.client.get(self.list_url, {"overdue": "1"})
        self.assertEqual([t["title"] for t in res.data], ["late"])
        self.assertTrue(res.data[0]["is_overdue"])
        done = Task.objects.get(title="late but done")
        self.assertFalse(self.client.get(reverse("task-detail", args=[done.id])).data["is_overdue"])

    def test_default_ordering_open_first_then_deadline(self):
        self.make(title="done", status="completed", deadline=self.today)
        self.make(title="later", deadline=self.today + timedelta(days=9))
        self.make(title="soon", deadline=self.today + timedelta(days=1))
        self.make(title="nodate", deadline=None)
        titles = [t["title"] for t in self.client.get(self.list_url).data]
        self.assertEqual(titles, ["soon", "later", "nodate", "done"])

    def test_stats(self):
        past = self.today - timedelta(days=1)
        self.make(deadline=past)
        self.make(status="completed")
        self.make()
        res = self.client.get(reverse("task-stats"))
        self.assertEqual(res.data, {"all": 3, "pending": 2, "completed": 1, "overdue": 1})
