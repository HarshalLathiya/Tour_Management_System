# TourSync - Super Admin Module (Phase 1)

## Step 1 — Repo understanding (done)

- Confirmed current role checks are string-based (`authorizeRoles`) and sidebar uses role strings.
- Confirmed incidents/tours/audit logs endpoints exist and already log actions to `audit_logs`.

- Reviewed auth middleware, users/tour_users role modeling inconsistencies, audit log utilities and routes.

## Step 2 — Role normalization plan (to implement)

- Standardize roles to: `super_admin`, `admin`, `leader`, `participant`.
- Update DB constraints for `users.role` and `tour_users.role`.

## Step 3 — Add Super Admin authorization

- Add `super_admin` support in middleware authorization.
- Implement `authorizeSuperAdmin` middleware.

## Step 4 — REST API endpoints (`/api/super-admin/*`)

- Create `server/routes/superAdmin.ts` and `server/controllers/superAdmin.controller.ts`.
- Endpoints:
  - GET `/overview`
  - GET `/users`
  - PUT `/users/:id/status`
  - PUT `/users/:id/role`
  - GET `/tours`
  - GET `/incidents`
  - GET `/audit-logs`
  - GET `/analytics`

## Step 5 — Database support for user suspend/activate

- Add `users.status` (active/suspended) or equivalent minimal field required by UI.
- Update user controller/model accordingly.

## Step 6 — React Next.js UI (`/dashboard/super-admin/*`)

- Add route group: `src/app/dashboard/super-admin/`.
- Add modules/widgets as requested:
  - Platform Overview
  - User Monitoring (search/filter/suspend+role)
  - Tour Monitoring
  - SOS Command Center
  - Audit Logs viewer
  - Analytics widgets

## Step 7 — Navigation integration

- Update `src/components/Sidebar.tsx` and any auth-based layout logic so Super Admin sees the new menu.

## Step 8 — API client + types

- Add typed API calls in `src/lib/api.ts`.
- Add/adjust shared types in `src/types`.

## Step 9 — Audit logging enforcement

- Ensure every Super Admin write action generates audit logs.

## Step 10 — Testing & validation

- Run server tests/lint/build.
- Smoke-test key endpoints and dashboard rendering.
