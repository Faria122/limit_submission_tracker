# Candidate Solution Notes

## How to Run

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_submissions
python manage.py runserver 0.0.0.0:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend Tests
```bash
cd backend
source .venv/bin/activate
python manage.py test submissions -v 2   # 13 tests, all passing
```



Visit `http://localhost:3000/submissions`.

---

## Approach

### Backend

The backend is a Django REST Framework API with three read-only endpoints:

- `GET /api/submissions/` - paginated list with annotations
- `GET /api/submissions/<id>/` - full detail with all relations
- `GET /api/brokers/` - broker list for the filter dropdown

**Query performance** was the primary focus. The list endpoint uses:
- `select_related(company, broker, owner)` - resolves all FK joins in a single SQL JOIN, preventing the N+1 problem
- `prefetch_related(contacts, documents, notes)` - batch-loads reverse relations in 3 additional queries regardless of result size
- `Count(..., distinct=True)` and `Subquery` - `document_count`, `note_count`, and `latest_note_preview` are computed entirely in the database, never in Python

The entire list endpoint runs in approximately 5 SQL queries whether returning 10 or 100 submissions.

**Serializer design** uses two tiers: a lean `SubmissionListSerializer` for the list (annotation-powered counts, nested company/broker names so the frontend makes zero extra calls) and a rich `SubmissionDetailSerializer` for the detail page (full nested contacts, documents, and notes in a single response).

**Filters implemented:**

| Param | Type | Description |
|---|---|---|
| `status` | exact (case-insensitive) | new, in_review, closed, lost |
| `brokerId` | exact FK | filter by broker |
| `companySearch` | `icontains` | partial company name search |
| `priority` | exact | high, medium, low |
| `createdFrom` | date `>=` | ISO 8601 |
| `createdTo` | date `<=` | ISO 8601 |
| `hasDocuments` | boolean | submissions with/without attachments |
| `hasNotes` | boolean | submissions with/without notes |

`companySearch` uses `icontains` rather than `istartswith` so that searching "tech" also matches "FinTech Solutions" mid-word - more natural for an ops manager who may only remember part of a name.

The custom pagination class adds `pageSize` to the standard DRF envelope so the frontend can build pagination controls without any extra API calls.

### Frontend

The Next.js app is built around a single principle: **the URL is the source of truth**. Every filter, such as company search, broker, and status, is reflected in the URL query string the moment it changes. This means:
- Browser back/forward navigation works correctly
- Sharing a filtered URL gives the recipient the exact same view
- Page refresh preserves filter state

**Key implementation decisions:**

- **Debounced search** - company search fires after 500ms of inactivity, not on every keystroke, to avoid hammering the API
- **MUI Skeletons** instead of spinners - the list and detail pages both show skeleton shapes matching the real content layout while loading, making the app feel significantly faster
- **`placeholderData`** on the TanStack Query hook - keeps the previous page's data visible while the next page loads, eliminating flicker between pages
- **Responsive layout** - table view on desktop, card stack on mobile, using MUI `useMediaQuery`
- **Empty and error states** - distinct UI for "no results" (with a helpful message) and "API failure" (with a retry button)
- **Owner avatars** - deterministic colour generation from the owner's name so the same person always gets the same colour

---

## Tradeoffs

- **Read-only API** - the spec defines only GET endpoints and uses `ReadOnlyModelViewSet`. A production tool would add `PATCH /api/submissions/<id>/` for status updates and `POST /api/submissions/<id>/notes/` for adding notes. I stayed within the spec rather than inventing endpoints that weren't asked for.

- **No authentication** - added as a stretch goal note below. The ops dashboard would normally be behind auth.

- **`icontains` vs full-text search** - `icontains` is sufficient for the dataset size described. At scale, this would be replaced with PostgreSQL full-text search (`SearchVector`) or a dedicated search index.

- **Client-side pagination controls** - pagination state lives in the URL and is read by the list page on every render. This is intentional: it means the back button correctly returns to the same page of results.

---

## Stretch Goals Implemented

- All optional filters: `createdFrom`, `createdTo`, `hasDocuments`, `hasNotes`, `priority`
- URL-synced filters - every filter change updates the browser URL
- Responsive design - table on desktop, card stack on mobile
- MUI Skeleton loading states (not spinners)
- `placeholderData` for seamless pagination transitions
- 13 targeted backend tests, all passing - including the golden-path `companySearch` + `document_count` test
- Deterministic owner avatars with colour generation
- Debounced company search (500ms)
- Empty state and error state with retry on the list page
- Custom pagination envelope with `pageSize` field

## Stretch Goals Not Implemented (but noted)
- Authentication (JWT or session-based)
- Deployment
- Frontend tests
