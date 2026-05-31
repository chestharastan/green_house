# Hydroponic Farm Management System — MVP Documentation

Tech stack: **Django REST Framework** (backend) · **React** (frontend) ·
**PostgreSQL** (database) · **JWT** (auth). The frontend in this repo is fully
runnable now with mock data; the backend sections below are the blueprint for
the real API.

---

## 1. System Requirements

### Roles & permissions

| Capability                  | Admin | Farm Manager | Worker |
|-----------------------------|:-----:|:------------:|:------:|
| Manage users & roles        |  ✅   |      —       |   —    |
| Greenhouse CRUD             |  ✅   |      ✅      |   —    |
| Crop batch CRUD             |  ✅   |      ✅      |   —    |
| Log crop stages             |  ✅   |      ✅      |   ✅   |
| Worker profile CRUD         |  ✅   |      ✅      |   —    |
| Assign tasks                |  ✅   |      ✅      |   —    |
| View own tasks              |  ✅   |      ✅      |   ✅   |
| Log work hours              |  ✅   |      ✅      |   ✅   |
| Inventory CRUD              |  ✅   |      ✅      |   —    |
| Stock in/out                |  ✅   |      ✅      |   —    |
| Manual sensor entry         |  ✅   |      ✅      |   ✅   |
| View reports                |  ✅   |      ✅      |   —    |

### Functional requirements
- JWT authentication; role-based access enforced on both API and UI.
- CRUD for greenhouses, crop batches, workers, inventory items.
- Crop lifecycle: germination → transplanting → growing → harvest, with stage logs.
- Task assignment to workers; work-hour logging with cost estimation.
- Inventory stock-in/stock-out transactions that adjust item quantities.
- Manual sensor data entry and a dashboard summarizing daily operations.

### Non-functional requirements
- Stateless JWT auth (access + refresh tokens).
- PostgreSQL as system of record; indexed foreign keys.
- REST/JSON API, paginated list endpoints.
- Responsive single-page React UI.

---

## 2. ERD (entity relationships)

```
roles 1───* users 1───0..1 workers
                              │ 1
                              ├──────* worker_tasks *──────1 greenhouses
                              └──────* work_hours

greenhouses 1───* crop_batches 1───* crop_stage_logs
greenhouses 1───* sensor_records
greenhouses 1───* worker_tasks

inventory_items 1───* inventory_transactions
```

Cardinalities:
- A **role** has many **users**; a user has one role.
- A **user** may link to one **worker** profile (workers log in to see tasks).
- A **greenhouse** has many **crop_batches**, **sensor_records**, **worker_tasks**.
- A **crop_batch** has many **crop_stage_logs** (one per stage transition).
- A **worker** has many **worker_tasks** and **work_hours**.
- An **inventory_item** has many **inventory_transactions** (IN/OUT).

---

## 3. Database Schema (PostgreSQL DDL)

```sql
CREATE TABLE roles (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL          -- Admin, Farm Manager, Worker
);

CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,         -- hashed
  full_name  VARCHAR(120),
  role_id    INTEGER NOT NULL REFERENCES roles(id),
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE greenhouses (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  location        VARCHAR(200),
  type            VARCHAR(40),              -- Hydroponic | Soil-based
  area_size       NUMERIC(10,2),            -- m2
  number_of_beds  INTEGER DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'Active'
);

CREATE TABLE crop_batches (
  id            SERIAL PRIMARY KEY,
  code          VARCHAR(40) UNIQUE NOT NULL,
  greenhouse_id INTEGER NOT NULL REFERENCES greenhouses(id),
  crop_type     VARCHAR(120),
  planting_date DATE,
  harvest_date  DATE,
  quantity      INTEGER DEFAULT 0,
  stage         VARCHAR(20) DEFAULT 'Germination',
  status        VARCHAR(20) DEFAULT 'Active'
);

CREATE TABLE crop_stage_logs (
  id        SERIAL PRIMARY KEY,
  batch_id  INTEGER NOT NULL REFERENCES crop_batches(id) ON DELETE CASCADE,
  stage     VARCHAR(20) NOT NULL,           -- Germination|Transplanting|Growing|Harvest
  log_date  DATE NOT NULL,
  note      TEXT
);

CREATE TABLE workers (
  id          SERIAL PRIMARY KEY,
  full_name   VARCHAR(120) NOT NULL,
  phone       VARCHAR(30),
  position    VARCHAR(60),
  hourly_rate NUMERIC(8,2) DEFAULT 0,
  status      VARCHAR(20) DEFAULT 'Active',
  user_id     INTEGER UNIQUE REFERENCES users(id)
);

CREATE TABLE worker_tasks (
  id            SERIAL PRIMARY KEY,
  worker_id     INTEGER NOT NULL REFERENCES workers(id),
  greenhouse_id INTEGER REFERENCES greenhouses(id),
  task_type     VARCHAR(60),
  description   TEXT,
  due_date      DATE,
  status        VARCHAR(20) DEFAULT 'Pending'  -- Pending|In Progress|Done
);

CREATE TABLE work_hours (
  id        SERIAL PRIMARY KEY,
  worker_id INTEGER NOT NULL REFERENCES workers(id),
  date      DATE NOT NULL,
  hours     NUMERIC(5,2) NOT NULL,
  task_type VARCHAR(60)
);

CREATE TABLE inventory_items (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  category      VARCHAR(60),              -- Seeds|Nutrients|pH Solution|Growing Media|...
  unit          VARCHAR(20),             -- L|kg|pack|box|unit
  quantity      NUMERIC(12,2) DEFAULT 0,
  reorder_level NUMERIC(12,2) DEFAULT 0,
  cost_per_unit NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE inventory_transactions (
  id         SERIAL PRIMARY KEY,
  item_id    INTEGER NOT NULL REFERENCES inventory_items(id),
  type       VARCHAR(4) NOT NULL,        -- IN | OUT
  quantity   NUMERIC(12,2) NOT NULL,
  date       DATE NOT NULL,
  note       TEXT
);

CREATE TABLE sensor_records (
  id            SERIAL PRIMARY KEY,
  greenhouse_id INTEGER NOT NULL REFERENCES greenhouses(id),
  type          VARCHAR(60),             -- Air Temperature|pH Level|EC Level|...
  value         NUMERIC(12,3),
  unit          VARCHAR(20),
  recorded_at   TIMESTAMP NOT NULL
);
```

---

## 4. API Endpoints

Base URL: `/api/`. All endpoints except auth require `Authorization: Bearer <token>`.

| Method | Endpoint                          | Description                         | Roles |
|--------|-----------------------------------|-------------------------------------|-------|
| POST   | `/auth/login/`                    | Obtain access + refresh tokens      | all |
| POST   | `/auth/refresh/`                  | Refresh access token                | all |
| GET    | `/auth/me/`                       | Current user + role                 | all |
| GET/POST | `/greenhouses/`                 | List / create greenhouse            | Admin, Manager |
| GET/PUT/DELETE | `/greenhouses/{id}/`      | Retrieve / update / delete          | Admin, Manager |
| GET/POST | `/crop-batches/`                | List / create crop batch            | Admin, Manager |
| GET/PUT/DELETE | `/crop-batches/{id}/`     | Retrieve / update / delete          | Admin, Manager |
| GET/POST | `/crop-stage-logs/`             | List / add stage log (advances batch)| all |
| GET/POST | `/workers/`                     | List / create worker                | Admin, Manager |
| GET/PUT/DELETE | `/workers/{id}/`          | Retrieve / update / delete          | Admin, Manager |
| GET/POST | `/tasks/`                       | List (own for Worker) / assign task | all (POST: Manager) |
| PATCH  | `/tasks/{id}/`                    | Update task status                  | all |
| GET/POST | `/work-hours/`                  | List / log hours                    | all |
| GET/POST | `/inventory-items/`             | List / create item                  | Admin, Manager |
| GET/PUT/DELETE | `/inventory-items/{id}/`  | Retrieve / update / delete          | Admin, Manager |
| GET/POST | `/inventory-transactions/`      | List / stock in-out (adjusts qty)   | Admin, Manager |
| GET/POST | `/sensor-records/`              | List / manual reading entry         | all |
| GET    | `/dashboard/`                     | Aggregated dashboard payload        | all |
| GET    | `/reports/summary/`               | Production / labor / inventory stats| Admin, Manager |

**Example — login response**
```json
POST /api/auth/login/  { "username": "manager", "password": "manager" }
200 → { "access": "<jwt>", "refresh": "<jwt>", "user": { "id": 2, "role": "Farm Manager" } }
```

---

## 5. Frontend Pages (this repo)

| Route                      | Page                     | Notes |
|----------------------------|--------------------------|-------|
| `/login`                   | Login                    | role buttons for quick sign-in |
| `/`                        | Dashboard                | 6 KPI cards + 4 summary tables |
| `/greenhouses`             | Greenhouses              | list + add modal |
| `/crop-batches`            | Crop Batches             | list + add modal |
| `/crop-stages`             | Crop Stage Tracking      | stage flow, logging advances batch |
| `/workers`                 | Workers                  | list + add modal |
| `/tasks`                   | Tasks / My Tasks         | workers see only their own |
| `/work-hours`              | Work Hours               | list + add, estimated pay |
| `/inventory`               | Inventory                | list + add, low-stock badge |
| `/inventory/transactions`  | Stock In / Out           | adjusts item quantity |
| `/sensors`                 | Sensor Data              | manual entry, auto unit |
| `/reports`                 | Reports                  | production / labor / valuation |

---

## 6. Folder Structure

**Frontend (this repo)**
```
hydroponic-farm-frontend/
├─ index.html
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.jsx
   ├─ App.jsx                 # routes + role guards
   ├─ index.css
   ├─ context/
   │  ├─ AuthContext.jsx      # login, roles, mock JWT
   │  └─ DataContext.jsx      # in-memory store + add actions
   ├─ data/mockData.js        # seed data (ERD tables)
   ├─ components/
   │  ├─ Layout.jsx           # sidebar + topbar
   │  ├─ ProtectedRoute.jsx   # auth + role gate
   │  └─ ui.jsx               # Table, FormModal, StatCard, Badge, PageHeader
   └─ pages/                  # one file per feature screen
```

**Backend (recommended DRF layout)**
```
backend/
├─ manage.py
├─ requirements.txt
├─ config/                    # settings, urls, wsgi
└─ apps/
   ├─ accounts/               # User, Role, JWT views
   ├─ greenhouses/
   ├─ crops/                  # crop_batches, crop_stage_logs
   ├─ labor/                  # workers, worker_tasks, work_hours
   ├─ inventory/              # items, transactions
   ├─ sensors/
   └─ dashboard/              # aggregated + reports endpoints
```

---

## 7. Step-by-Step Development Plan

1. **Setup** — Vite React app (done) + Django project, PostgreSQL, `djangorestframework`, `djangorestframework-simplejwt`, `django-cors-headers`.
2. **Auth** — Custom user with role FK; JWT login/refresh; `/auth/me/`. Wire the React `AuthContext` to real endpoints.
3. **Core models & migrations** — implement the schema in §3 as Django models.
4. **Greenhouse + Crop modules** — serializers, viewsets, routers; replace frontend mock CRUD with API calls.
5. **Crop stage tracking** — stage-log endpoint that also updates `crop_batches.stage`.
6. **Labor module** — workers, task assignment, work hours; worker-scoped task queryset.
7. **Inventory module** — items + transactions; transaction save adjusts `quantity`.
8. **Sensors** — manual entry endpoint + list.
9. **Dashboard & reports** — aggregation endpoints feeding the existing UI.
10. **Permissions & polish** — DRF permission classes per role; pagination, validation, tests, deploy.

---

## 8. Sample Backend Code (Django REST Framework)

```python
# apps/inventory/models.py
from django.db import models

class InventoryItem(models.Model):
    name = models.CharField(max_length=120)
    category = models.CharField(max_length=60)
    unit = models.CharField(max_length=20)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    reorder_level = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)

class InventoryTransaction(models.Model):
    IN, OUT = 'IN', 'OUT'
    item = models.ForeignKey(InventoryItem, related_name='transactions', on_delete=models.CASCADE)
    type = models.CharField(max_length=4, choices=[(IN, 'IN'), (OUT, 'OUT')])
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    note = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        # Adjust stock on each transaction (mirrors the frontend behavior).
        if not self.pk:
            delta = self.quantity if self.type == self.IN else -self.quantity
            self.item.quantity = self.item.quantity + delta
            self.item.save(update_fields=['quantity'])
        super().save(*args, **kwargs)
```

```python
# apps/inventory/serializers.py
from rest_framework import serializers
from .models import InventoryItem, InventoryTransaction

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'

class InventoryTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryTransaction
        fields = '__all__'
```

```python
# apps/inventory/views.py
from rest_framework import viewsets, permissions
from .models import InventoryItem, InventoryTransaction
from .serializers import InventoryItemSerializer, InventoryTransactionSerializer

class IsManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
            request.user.role.name in ('Admin', 'Farm Manager')

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsManager]

class InventoryTransactionViewSet(viewsets.ModelViewSet):
    queryset = InventoryTransaction.objects.select_related('item').all()
    serializer_class = InventoryTransactionSerializer
    permission_classes = [IsManager]
```

```python
# config/urls.py
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path, include
from apps.inventory.views import InventoryItemViewSet, InventoryTransactionViewSet

router = DefaultRouter()
router.register('inventory-items', InventoryItemViewSet)
router.register('inventory-transactions', InventoryTransactionViewSet)

urlpatterns = [
    path('api/auth/login/', TokenObtainPairView.as_view()),
    path('api/auth/refresh/', TokenRefreshView.as_view()),
    path('api/', include(router.urls)),
]
```

---

## 9. Sample Frontend Code

The `DataContext` add-action used across the app (already in `src/context/DataContext.jsx`):

```jsx
function addInventoryTransaction(tx) {
  setInventoryTransactions((list) => [{ id: nextId(list), ...tx }, ...list])
  setInventoryItems((items) =>
    items.map((it) =>
      it.id === Number(tx.itemId)
        ? { ...it, quantity: tx.type === 'IN'
              ? it.quantity + Number(tx.quantity)
              : it.quantity - Number(tx.quantity) }
        : it
    )
  )
}
```

**Swapping mock for the real API** — replace the context setters with `fetch`:

```jsx
// Example: load + create greenhouses against the DRF backend.
const API = 'http://localhost:8000/api'
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('access')}` })

export async function listGreenhouses() {
  const res = await fetch(`${API}/greenhouses/`, { headers: authHeader() })
  return res.json()
}

export async function createGreenhouse(payload) {
  const res = await fetch(`${API}/greenhouses/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  })
  return res.json()
}
```

When you wire these in, the UI components (`Table`, `FormModal`, pages) stay the
same — only the data source in `DataContext` changes.
