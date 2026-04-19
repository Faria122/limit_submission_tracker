"""
Submission Tracker — Backend Tests

All assertions use camelCase keys to match the API's actual JSON output.
(The boilerplate uses djangorestframework-camel-case which converts
snake_case fields → camelCase in responses.)
"""

from rest_framework import status
from rest_framework.test import APITestCase

from submissions.models import (
    Broker, Company, Contact, Document, Note, Submission, TeamMember
)



def make_broker(name="Acme Brokers", email="acme@example.com"):
    return Broker.objects.create(name=name, primary_contact_email=email)


def make_company(name="TestCorp", industry="Tech", city="Boston"):
    return Company.objects.create(
        legal_name=name, industry=industry, headquarters_city=city
    )


def make_member(name="Alice", email="alice@ops.com"):
    return TeamMember.objects.create(full_name=name, email=email)


def make_submission(company, broker, owner, sub_status="new", priority="medium", summary=""):
    return Submission.objects.create(
        company=company, broker=broker, owner=owner,
        status=sub_status, priority=priority, summary=summary,
    )



class SubmissionListTests(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.broker_a = make_broker("Alpha Capital", "alpha@capital.com")
        cls.broker_b = make_broker("Beta Ventures", "beta@ventures.com")

        cls.company_fintech = make_company("FinTech Solutions", "Finance", "New York")
        cls.company_health  = make_company("HealthBridge Inc", "Healthcare", "Austin")
        cls.company_tech    = make_company("TechNova Corp", "Tech", "San Francisco")

        cls.owner = make_member("Alice", "alice@ops.com")

        # sub_1: 2 documents, 1 note — broker_a, status=new, priority=high
        cls.sub_1 = make_submission(
            cls.company_fintech, cls.broker_a, cls.owner,
            sub_status="new", priority="high", summary="High priority fintech deal"
        )
        Document.objects.create(submission=cls.sub_1, title="Pitch Deck", doc_type="deck", file_url="http://x.com/a.pdf")
        Document.objects.create(submission=cls.sub_1, title="Financials",  doc_type="financial", file_url="http://x.com/b.xlsx")
        Note.objects.create(submission=cls.sub_1, author_name="Alice", body="Looks promising.")

        # sub_2: 0 documents, 0 notes — broker_b, status=in_review
        cls.sub_2 = make_submission(
            cls.company_health, cls.broker_b, cls.owner,
            sub_status="in_review", summary="Healthcare platform"
        )

        # sub_3: 1 document, 2 notes — broker_a, status=closed
        cls.sub_3 = make_submission(
            cls.company_tech, cls.broker_a, cls.owner,
            sub_status="closed", summary="SaaS tool"
        )
        Document.objects.create(submission=cls.sub_3, title="Overview", doc_type="overview", file_url="http://x.com/c.pdf")
        Note.objects.create(submission=cls.sub_3, author_name="Bob",   body="First note.")
        Note.objects.create(submission=cls.sub_3, author_name="Alice", body="Latest note — this should be the preview.")

    def test_list_returns_paginated_envelope(self):
        """Response envelope must include count, pageSize, next, previous, results."""
        r = self.client.get("/api/submissions/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        data = r.json()
        for key in ("count", "pageSize", "next", "previous", "results"):
            self.assertIn(key, data, f"Missing key: {key}")
        self.assertEqual(data["count"], 3)

    def test_company_search_filter_golden_path(self):
        """
        GOLDEN PATH (spec requirement):
        companySearch='fintech' must return exactly FinTech Solutions
        and documentCount must equal 2.
        """
        r = self.client.get("/api/submissions/", {"companySearch": "fintech"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        results = r.json()["results"]
        self.assertEqual(len(results), 1, "Expected exactly 1 result for 'fintech'")
        self.assertEqual(results[0]["company"]["legalName"], "FinTech Solutions")
        self.assertEqual(
            results[0]["documentCount"], 2,
            "documentCount annotation must equal the number of attached documents"
        )

    def test_broker_id_filter(self):
        """brokerId must return only submissions from that broker."""
        r = self.client.get("/api/submissions/", {"brokerId": self.broker_b.id})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        results = r.json()["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["broker"]["name"], "Beta Ventures")

    def test_status_filter(self):
        """status filter must be case-insensitive and return only matching submissions."""
        r = self.client.get("/api/submissions/", {"status": "in_review"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        results = r.json()["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["status"], "in_review")

    def test_has_documents_filter_true(self):
        """hasDocuments=true must exclude submissions with zero documents."""
        r = self.client.get("/api/submissions/", {"hasDocuments": "true"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        ids = {item["id"] for item in r.json()["results"]}
        self.assertIn(self.sub_1.id, ids)
        self.assertIn(self.sub_3.id, ids)
        self.assertNotIn(self.sub_2.id, ids)

    def test_has_documents_filter_false(self):
        """hasDocuments=false must return only submissions with no documents."""
        r = self.client.get("/api/submissions/", {"hasDocuments": "false"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        results = r.json()["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], self.sub_2.id)

    def test_has_notes_filter_true(self):
        """hasNotes=true must return only submissions that have at least one note."""
        r = self.client.get("/api/submissions/", {"hasNotes": "true"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        ids = {item["id"] for item in r.json()["results"]}
        self.assertIn(self.sub_1.id, ids)
        self.assertIn(self.sub_3.id, ids)
        self.assertNotIn(self.sub_2.id, ids)

    def test_created_date_range_returns_empty_for_future(self):
        """A future date range must return zero results — proves date filter is wired."""
        r = self.client.get("/api/submissions/", {
            "createdFrom": "2099-01-01",
            "createdTo":   "2099-12-31",
        })
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.json()["count"], 0)

    def test_latest_note_preview_is_most_recent(self):
        """
        latestNote.bodyPreview must reflect the most recently created note,
        not the first one.
        """
        r = self.client.get("/api/submissions/", {"companySearch": "technova"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        results = r.json()["results"]
        self.assertEqual(len(results), 1)
        preview = results[0]["latestNote"]["bodyPreview"]
        self.assertEqual(preview, "Latest note — this should be the preview.")

    def test_multiple_filters_are_anded(self):
        """status + brokerId combined must return only submissions matching both."""
        r = self.client.get("/api/submissions/", {
            "status":   "new",
            "brokerId": self.broker_a.id,
        })
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        results = r.json()["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], self.sub_1.id)



class SubmissionDetailTests(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.broker  = make_broker()
        cls.company = make_company()
        cls.owner   = make_member("Bob", "bob@ops.com")
        cls.sub     = make_submission(cls.company, cls.broker, cls.owner)

        Contact.objects.create(submission=cls.sub, name="Jane Doe", email="jane@co.com", role="CFO")
        Document.objects.create(submission=cls.sub, title="Deck", doc_type="deck", file_url="http://x.com/d.pdf")
        Note.objects.create(submission=cls.sub, author_name="Bob", body="Initial review note.")

    def test_detail_nests_all_relations(self):
        """Detail must return nested company, broker, owner, contacts, documents, notes."""
        r = self.client.get(f"/api/submissions/{self.sub.id}/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        data = r.json()

        self.assertEqual(data["company"]["legalName"], "TestCorp")
        self.assertEqual(data["broker"]["name"], "Acme Brokers")
        self.assertEqual(data["owner"]["fullName"], "Bob")

        self.assertEqual(len(data["contacts"]), 1)
        self.assertEqual(data["contacts"][0]["name"], "Jane Doe")
        self.assertEqual(data["contacts"][0]["role"], "CFO")

        self.assertEqual(len(data["documents"]), 1)
        self.assertEqual(data["documents"][0]["title"], "Deck")

        self.assertEqual(len(data["notes"]), 1)
        self.assertEqual(data["notes"][0]["body"], "Initial review note.")

    def test_detail_returns_404_for_unknown_id(self):
        """Non-existent submission must return 404, not 500."""
        r = self.client.get("/api/submissions/99999/")
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)



class BrokerEndpointTests(APITestCase):

    @classmethod
    def setUpTestData(cls):
        Broker.objects.create(name="First Capital",   primary_contact_email="fc@x.com")
        Broker.objects.create(name="Second Ventures", primary_contact_email="sv@x.com")

    def test_brokers_returns_list_with_correct_fields(self):
        """Must return broker list with id, name, primaryContactEmail (camelCase)."""
        r = self.client.get("/api/brokers/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        data = r.json()
        results = data if isinstance(data, list) else data.get("results", [])
        self.assertGreaterEqual(len(results), 2)
        for broker in results:
            self.assertIn("id", broker)
            self.assertIn("name", broker)
            self.assertIn("primaryContactEmail", broker)   # camelCase — not snake_case