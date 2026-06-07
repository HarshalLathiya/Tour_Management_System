# TODO - Analytics Redesign (TourSync Super Admin)

## Plan (to be approved)

1. Repo reconnaissance (completed/needed)
   - Identify existing Analytics route/page and API shape.
   - Identify how Super Admin sidebar routes map to pages.

2. UX/UI design & component architecture
   - Create new `Analytics` page for Super Admin with:
     - Header + Date Range filter + Export PDF/Excel
     - KPI cards (users/tours/revenue/attendance)
     - Recharts charts (line/pie/bar)
     - Tables (Top Tours, Top Leaders, Recent Reports)
     - Loading/empty/error states

3. Feature separation
   - Keep Dashboard operational-only.
   - Ensure Analytics is accessible from Sidebar with its own URL.

4. Data model + API requirements
   - Extend backend analytics endpoint (`/api/super-admin/analytics`) to return:
     - User analytics (growth, registrations monthly, role distribution, active vs inactive)
     - Tour analytics (created per month, status distribution, most popular tours, occupancy)
     - Attendance analytics (attendance trends, present vs absent, attendance by tour)
     - SOS & Safety analytics (incidents per month, severity breakdown, avg resolution time, incident types)
     - Financial analytics (revenue trends, budget utilization, expense breakdown, revenue vs expenses, top tours)
     - System analytics (DAU/WAU, login activity, platform usage)
   - Add optional `start_date/end_date` query params for date range filter.

5. Frontend implementation
   - Create typed API client method for analytics.
   - Build reusable chart/table components under `src/components/analytics/*`.
   - Implement data normalization helpers (date buckets, percentages).

6. Exports
   - Implement client-side export stubs (or server endpoints if preferred) for PDF/Excel.

7. Testing & verification
   - Run Next.js build/lint.
   - Validate API responses and chart rendering.

## Completion tracking

- [ ] Step 1: Confirm existing Analytics page/route + API limitations
- [ ] Step 2: Approve UX/component plan
- [ ] Step 3: Backend API expansion (analytics payload)
- [ ] Step 4: Frontend Analytics page + components
- [ ] Step 5: Sidebar route separation (Dashboard vs Analytics)
- [ ] Step 6: Exports + polish
