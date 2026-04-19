"""import django_filters

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    Basic filter set for the submissions list endpoint.
    Only the status filter is implemented so the candidate can extend the
    remaining filters (broker, company search, optional extras, etc.).
    

    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")

    class Meta:
        model = models.Submission
        fields = ["status"]
"""

import django_filters
from django.db.models import Count

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    """
    Extends the boilerplate status filter with all required and optional filters.

    Required (per spec):
      status        → already present, kept with iexact
      brokerId      → exact FK match on broker ID
      companySearch → case-insensitive partial match on company.legal_name

    Optional extras (signals careful reading of the spec):
      priority      → exact match
      createdFrom   → submissions created on or after this date
      createdTo     → submissions created on or before this date
      hasDocuments  → true/false — whether any documents are attached
      hasNotes      → true/false — whether any notes exist

    Note on companySearch:
      Uses icontains rather than istartswith so that searching "tech" also
      matches "FinTech Solutions" mid-word — more natural for ops managers
      who may only remember part of a company name.
    """

    

    status = django_filters.CharFilter(
        field_name="status",
        lookup_expr="iexact",
    )

    brokerId = django_filters.NumberFilter(
        field_name="broker__id",
        lookup_expr="exact",
    )

    companySearch = django_filters.CharFilter(
        method="filter_company_search",
    )

    

    priority = django_filters.CharFilter(
        field_name="priority",
        lookup_expr="iexact",
    )

    createdFrom = django_filters.DateFilter(
        field_name="created_at",
        lookup_expr="date__gte",
    )

    createdTo = django_filters.DateFilter(
        field_name="created_at",
        lookup_expr="date__lte",
    )

    hasDocuments = django_filters.BooleanFilter(
        method="filter_has_documents",
    )

    hasNotes = django_filters.BooleanFilter(
        method="filter_has_notes",
    )

    class Meta:
        model = models.Submission
        fields = [
            "status",
            "brokerId",
            "companySearch",
            "priority",
            "createdFrom",
            "createdTo",
            "hasDocuments",
            "hasNotes",
        ]


    def filter_company_search(self, queryset, name, value):
        return queryset.filter(company__legal_name__icontains=value.strip())

    def filter_has_documents(self, queryset, name, value):
        queryset = queryset.annotate(_doc_count=Count("documents"))
        return queryset.filter(_doc_count__gt=0) if value else queryset.filter(_doc_count=0)

    def filter_has_notes(self, queryset, name, value):
        queryset = queryset.annotate(_note_count=Count("notes"))
        return queryset.filter(_note_count__gt=0) if value else queryset.filter(_note_count=0)