from django.db.models import Count, OuterRef, Subquery
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters as drf_filters
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from submissions import models, serializers
from submissions.filters.submission import SubmissionFilterSet


class SubmissionPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "pageSize"
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            "count": self.page.paginator.count,
            "page_size": self.get_page_size(self.request),
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data,
        })
class SubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    pagination_class = SubmissionPagination
    filterset_class = SubmissionFilterSet
    filter_backends = [DjangoFilterBackend, drf_filters.OrderingFilter]
    ordering_fields = ["created_at", "updated_at", "priority", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = (
            models.Submission.objects
            .select_related("company", "broker", "owner")
            .prefetch_related("contacts", "documents", "notes")
        )

        if self.action == "list":
            latest_note = (
                models.Note.objects
                .filter(submission_id=OuterRef("pk"))
                .order_by("-created_at")
            )
            queryset = queryset.annotate(
                document_count=Count("documents", distinct=True),
                note_count=Count("notes", distinct=True),
                latest_note_author=Subquery(latest_note.values("author_name")[:1]),
                latest_note_body=Subquery(latest_note.values("body")[:1]),
                latest_note_created_at=Subquery(latest_note.values("created_at")[:1]),
            )

        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return serializers.SubmissionListSerializer
        return serializers.SubmissionDetailSerializer


class BrokerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.Broker.objects.all()
    serializer_class = serializers.BrokerSerializer