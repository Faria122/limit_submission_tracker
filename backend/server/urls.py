from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from submissions.views import BrokerViewSet, SubmissionViewSet

router = DefaultRouter()
router.register("submissions", SubmissionViewSet, basename="submission")
router.register("brokers", BrokerViewSet, basename="broker")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]