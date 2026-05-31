# HydroFarm — Hydroponic Farm Management System (MVP Frontend)

A React frontend for digitizing greenhouse daily operations: crop tracking,
worker tasks, inventory usage, and manual sensor records. Built to the ERD in
`Copy of CBM&ERD_Greenhouse.drawio.html`.

> **Mock-data mode:** all data lives in memory. Records you add appear
> immediately for the current session and **reset on page refresh** (shown
> once). No backend or database is required to run the frontend.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
```

Other commands: `npm run build` (production bundle), `npm run preview`.

## Demo accounts (role-based access)

| Username  | Password  | Role         | Can access                                            |
|-----------|-----------|--------------|-------------------------------------------------------|
| `admin`   | `admin`   | Admin        | Everything                                            |
| `manager` | `manager` | Farm Manager | Everything                                            |
| `worker`  | `worker`  | Worker       | Dashboard, My Tasks, Work Hours, Crop Stages, Sensors |

On the login screen you can click a role button to sign in instantly.

## Features

1. Login + JWT-style auth + role-based route guards
2. Dashboard (greenhouses, active batches, today's tasks, low stock, upcoming harvests, latest sensors)
3. Greenhouse CRUD (list + add)
4. Crop batch CRUD (list + add)
5. Crop stage tracking (germination → transplanting → growing → harvest; logging advances the batch)
6. Worker profile CRUD
7. Worker task assignment (workers see only their own tasks)
8. Work hour tracking (with estimated pay)
9. Inventory CRUD
10. Stock in / stock out (auto-adjusts item quantity)
11. Manual sensor data entry
12. Basic reports (production, labor, inventory valuation)

## Where things are

```
src/
  context/   AuthContext (login/roles), DataContext (in-memory store + add actions)
  data/      mockData.js  — seed data mirroring the ERD tables
  components/ Layout, ProtectedRoute, ui.jsx (Table, FormModal, StatCard, Badge)
  pages/     one file per feature screen
```

See `DOCS.md` for full deliverables: system requirements, ERD, database schema,
API endpoints, frontend pages, backend folder structure, development plan, and
sample backend (Django REST Framework) + frontend code.
