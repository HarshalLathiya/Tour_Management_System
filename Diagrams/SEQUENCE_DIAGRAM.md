# Sequence Diagram - Tour Management System

This document provides detailed sequence diagrams showing the interaction flow between components in the Tour Management System.

---

## 1. User Authentication Flow

### 1.1 User Login Sequence

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────────┐
│   User      │     │  Frontend    │     │  API Client │     │   Backend       │
│             │     │  (React)     │     │  (api.ts)   │     │   (Express)     │
└──────┬──────┘     └──────┬───────┘     └──────┬──────┘     └────────┬────────┘
       │                  │                     │                     │
       │ 1.Enter creds   │                      │                     │
       │────────────────>│                      │                     │
       │                  │                      │                     │
       │                  │ 2. POST /api/auth/login                   │
       │                  │────────────────────>│                     │
       │                  │                      │                     │
       │                  │                      │ 3. Validate creds  │
       │                  │                      │───────────────────>│
       │                  │                      │                     │
       │                  │                      │         4. Verify  │
       │                  │                      │         user in DB │
       │                  │                      │───────────────────>│
       │                  │                      │                     │
       │                  │                      │    5. Generate    │
       │                  │                      │    JWT Token       │
       │                  │                      │<──────────────────│
       │                  │                      │                     │
       │                  │  6. Return {token, user}                  │
       │                  │<────────────────────│                     │
       │                  │                      │                     │
       │ 7. Show Dashboard│                      │                     │
       │<─────────────────│                      │                     │
       │                  │                      │                     │
       │                  │  8. Store token in localStorage          │
       │                  │─────────────────────>                     │
       │                  │                      │                     │
       │                  │  9. Store user in localStorage           │
       │                  │─────────────────────>                     │
       │                  │                      │                     │
```

### 1.2 Token Management Sequence

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Component  │     │ TokenManager │     │  localStorage   │
│             │     │  (api.ts)    │     │  / Cookies      │
└──────┬──────┘     └──────┬───────┘     └────────┬────────┘
       │                  │                      │
       │ getToken()       │                      │
       │────────────────>│                      │
       │                  │                      │
       │                  │ 1. Check window      │
       │                  │    !== undefined    │
       │                  │───────┐              │
       │                  │       │              │
       │                  │<──────┘              │
       │                  │                      │
       │                  │ 2. localStorage.get  │
       │                  │─────────────────────>│
       │                  │                      │
       │                  │ 3. Return token      │
       │                  │<─────────────────────│
       │                  │                      │
       │ 4. Return token │                      │
       │<────────────────│                      │
       │                  │                      │
```

---

## 2. Tour Management Flow

### 2.1 View Tours List Sequence

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────────┐
│   User      │     │  ToursPage  │     │  tourApi    │     │   Backend       │
│             │     │  (React)     │     │  (api.ts)   │     │   (Express)     │
└──────┬──────┘     └──────┬───────┘     └──────┬──────┘     └────────┬────────┘
       │                  │                     │                     │
       │ 1.Navigate to    │                      │                     │
       │ /dashboard/tours│                      │                     │
       │────────────────>│                      │                     │
       │                  │                      │                     │
       │                  │ 2. GET /api/tours    │
       │                  │────────────────────>│                     │
       │                  │                      │                     │
       │                  │                      │ 3. Query Tours     │
       │                  │                      │───────────────────>│
       │                  │                      │                     │
       │                  │                      │  4. SELECT * FROM  │
       │                  │                      │     tours          │
       │                  │                      │───────────────────>│
       │                  │                      │                     │
       │                  │                      │  5. Return tour[]  │
       │                  │                      │<──────────────────│
       │                  │                      │                     │
       │                  │ 6. Return tours[]   │
       │                  │<────────────────────│                     │
       │                  │                      │                     │
       │ 7. Render list  │                      │                     │
       │<─────────────────│                      │                     │
       │                  │                      │                     │
```

### 2.2 Create New Tour Sequence (Admin)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Admin     │     │ NewTourPage  │     │  tourApi    │     │   Backend       │
│             │     │  (React)     │     │  (api.ts)   │     │   (Express)     │
└──────┬──────┘     └──────┬───────┘     └──────┬──────┘     └────────┬────────┘
       │                  │                     │                     │
       │ 1.Fill tour form│                      │                     │
       │────────────────>│                      │                     │
       │                  │                      │                     │
       │ 2.Click Create  │                      │                     │
       │────────────────>│                      │                     │
       │                  │                      │                     │
       │                  │ 3. POST /api/tours   │
       │                  │  {tour data}         │
       │                  │────────────────────>│                     │
       │                  │                      │                     │
       │                  │                      │ 4. authenticate   │
       │                  │                      │    Token           │
       │                  │                      │───────────────────>│
       │                  │                      │                     │
       │                  │                      │ 5. authorizeRoles  │
       │                  │                      │    ('admin')       │
       │                  │                      │───────────────────>│
       │                  │                      │                     │
       │                  │                      │ 6. validate()      │
       │                  │                      │    schema          │
       │                  │                      │───────────────────>│
       │                  │                      │                     │
       │                  │                      │ 7. tourController  │
       │                  │                      │    .createTour()   │
       │                  │                      │───────────────────>│
       │                  │                      │                     │
       │                  │                      │  8. INSERT INTO   │
       │                  │                      │     tours          │
       │                  │                      │───────────────────>│
       │                  │                      │                     │
       │                  │                      │  9. Return new tour│
       │                  │                      │<──────────────────│
       │                  │                      │                     │
       │                  │ 10. Return {success}│                     │
       │                  │<────────────────────│                     │
       │                  │                      │                     │
       │ 11.Redirect to  │                      │                     │
       │    tours list   │                      │                     │
       │<─────────────────│                      │                     │
       │                  │                      │                     │
```

### 2.3 Assign Leader to Tour Sequence

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Admin     │     │ TourDetail  │     │  tourApi    │     │   Backend       │
│             │     │  (React)     │     │  (api.ts)   │     │   (Express)     │
└──────┬──────┘     └──────┬───────┘     └──────┬──────┘     └────────┬────────┘
       │                  │                     │                     │
       │ 1.Select leader  │                      │                     │
       │    from dropdown │                      │                     │
       │────────────────>│                      │                     │
       │                  │                      │                     │
       │ 2.Click Assign   │                      │                     │
       │────────────────>│                      │                     │
       │                  │                      │                     │
       │                  │ 3. PUT /api/tours/   │
       │                  │    {id}/assign-leader│
       │                  │    {leader_id}       │
       │                  │────────────────────>│                     │
       │                  │                      │                     │
       │                  │                      │ 4. authenticate   │
       │                  │                      │    Token           │
       │                  │                      │───────────────────>│
       │                  │                      │                     │
       │                  │                      │ 5. authorizeRoles  │
       │                  │                      │    ('admin')       │
       │                  │                      │───────────────────>│
       │                  │                      │                     │
       │                  │                      │ 6. tourController  │
       │                  │                      │    .assignLeader() │
       │                  │                      │───────────────────>│
       │                  │                      │                     │
       │                  │                      │  7. UPDATE tours   │
       │                  │                      │     SET leader_id  │
       │                  │                      │     WHERE id=?     │
       │                  │                      │───────────────────>│
       │                  │                      │                     │
       │                  │                      │ 8. Return updated │
       │                  │                      │    tour            │
       │                  │                      │<──────────────────│
       │                  │                      │                     │
       │                  │ 9. Return {success} │                     │
       │                  │<────────────────────│                     │
       │                  │                      │                     │
       │ 10.Show success │                      │                     │
       │    message      │                      │                     │
       │<─────────────────│                      │                     │
       │                  │                      │                     │
```

---

## 3. Attendance Check-in Flow

### 3.1 Self Check-in Sequence

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Tourist   │     │ CheckInPage  │     │ attendanceApi   │     │   Backend       │
│             │     │  (React)     │     │  (api.ts)       │     │   (Express)     │
└──────┬──────┘     └──────┬───────┘     └────────┬────────┘     └────────┬────────┘
       │                  │                      │                      │
       │ 1.Enable GPS    │                      │                      │
       │────────────────>│                      │                      │
       │                  │                      │                      │
       │ 2.Get location │                      │                      │
       │    (lat, lng)   │                      │                      │
       │<────────────────│                      │                      │
       │                  │                      │                      │
       │ 3.Click Check-in│                      │                      │
       │────────────────>│                      │                      │
       │                  │                      │                      │
       │                  │ 4. POST /api/attendance/checkin           │
       │                  │ {tour_id, lat, lng, date}                 │
       │                  │────────────────────>│                      │
       │                  │                      │                      │
       │                  │                      │ 5. authenticate    │
       │                  │                      │    Token           │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 6. validate()     │
       │                  │                      │    schema          │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 7. attendanceCtrl │
       │                  │                      │    .create()       │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 8. Geofencing     │
       │                  │                      │    check          │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 9. Check if user  │
       │                  │                      │    within bounds  │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 10. INSERT INTO   │
       │                  │                      │    attendance     │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 11. Return record │
       │                  │                      │<──────────────────│
       │                  │                      │                      │
       │                  │ 12. Return {success, data}                │
       │                  │<────────────────────│                      │
       │                  │                      │                      │
       │ 13.Show success │                      │                      │
       │    message      │                      │                      │
       │<─────────────────│                      │                      │
       │                  │                      │                      │
```

### 3.2 Verify Attendance Sequence (Leader)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Leader    │     │ Attendance   │     │ attendanceApi   │     │   Backend       │
│             │     │ Page         │     │  (api.ts)       │     │   (Express)     │
└──────┬──────┘     └──────┬───────┘     └────────┬────────┘     └────────┬────────┘
       │                  │                      │                      │
       │ 1.View pending  │                      │                      │
       │    check-ins     │                      │                      │
       │────────────────>│                      │                      │
       │                  │                      │                      │
       │                  │ 2. GET /api/attendance?status=pending    │
       │                  │────────────────────>│                      │
       │                  │                      │                      │
       │                  │                      │ 3. Query pending   │
       │                  │                      │    records         │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 4. Return records  │
       │                  │                      │<──────────────────│
       │                  │                      │                      │
       │                  │ 5. Display list     │                      │
       │                  │<────────────────────│                      │
       │                  │                      │                      │
       │ 6.Click Verify   │                      │                      │
       │────────────────>│                      │                      │
       │                  │                      │                      │
       │                  │ 7. PUT /api/attendance/{id}/verify        │
       │                  │────────────────────>│                      │
       │                  │                      │                      │
       │                  │                      │ 8. authenticate   │
       │                  │                      │    Token           │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 9. attendanceCtrl  │
       │                  │                      │    .verify()       │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 10. UPDATE attend. │
       │                  │                      │    SET verified    │
       │                  │                      │    verification_tim│
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 11. Return updated │
       │                  │                      │<──────────────────│
       │                  │                      │                      │
       │                  │ 12. Return {success} │                     │
       │                  │<────────────────────│                      │
       │                  │                      │                      │
       │ 13.Show verified │                      │                     │
       │    status        │                      │                     │
       │<─────────────────│                      │                      │
       │                  │                      │                      │
```

---

## 4. Incident & SOS Reporting Flow

### 4.1 Trigger SOS Emergency Sequence

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Tourist   │     │ SOSButton    │     │ incidentApi     │     │   Backend       │
│             │     │  (Component) │     │  (api.ts)       │     │   (Express)     │
└──────┬──────┘     └──────┬───────┘     └────────┬────────┘     └────────┬────────┘
       │                  │                      │                      │
       │ 1.Click SOS     │                      │                      │
       │    button       │                      │                      │
       │────────────────>│                      │                      │
       │                  │                      │                      │
       │                  │ 2. Get current      │                      │
       │                  │    location         │                      │
       │                  │────────────────────>│                      │
       │                  │                      │                      │
       │                  │ 3. (lat, lng)       │                      │
       │                  │<────────────────────│                      │
       │                  │                      │                      │
       │                  │ 4. POST /api/incidents/sos                │
       │                  │ {tour_id, location, description}         │
       │                  │────────────────────>│                      │
       │                  │                      │                      │
       │                  │                      │ 5. authenticate    │
       │                  │                      │    Token           │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 6. incidentController│
       │                  │                      │    .triggerSOS()   │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 7. INSERT INTO     │
       │                  │                      │    incidents       │
       │                  │                      │    (severity=CRIT) │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 8. Create NOTIF   │
       │                  │                      │    for admins     │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 9. Send real-time │
       │                  │                      │    notification   │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 10. Return incident│
       │                  │                      │<──────────────────│
       │                  │                      │                      │
       │                  │ 11. Return {success, incident}           │
       │                  │<────────────────────│                      │
       │                  │                      │                      │
       │ 12.Show confirm │                      │                      │
       │    message      │                      │                     │
       │<─────────────────│                      │                      │
       │                  │                      │                      │
       │                  │ 13. Alert admins    │                     │
       │                  │     via notif       │                     │
       │                  │────────────────────>│                      │
       │                  │                      │                      │
```

### 4.2 Incident Response Sequence

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Leader    │     │ SafetyPage   │     │ incidentApi     │     │   Backend       │
│             │     │  (React)     │     │  (api.ts)       │     │   (Express)     │
└──────┬──────┘     └──────┬───────┘     └────────┬────────┘     └────────┬────────┘
       │                  │                      │                      │
       │ 1.Receive SOS   │                      │                      │
       │    notification │                      │                      │
       │<────────────────│                      │                      │
       │                  │                      │                      │
       │ 2.View incident │                      │                      │
       │    details      │                      │                      │
       │────────────────>│                      │                      │
       │                  │                      │                      │
       │                  │ 3. GET /api/incidents/{id}                │
       │                  │────────────────────>│                      │
       │                  │                      │                      │
       │                  │                      │ 4. Query incident  │
       │                  │                      │    from DB         │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 5. Return incident │
       │                  │                      │<──────────────────│
       │                  │                      │                      │
       │                  │ 6. Display details  │                      │
       │                  │<────────────────────│                      │
       │                  │                      │                      │
       │ 7.Click Respond  │                      │                      │
       │────────────────>│                      │                      │
       │                  │                      │                      │
       │                  │ 8. PUT /api/incidents/{id}/respond        │
       │                  │────────────────────>│                      │
       │                  │                      │                      │
       │                  │                      │ 9. authenticate   │
       │                  │                      │    Token           │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 10. authorizeRoles │
       │                  │                      │    (admin/guide)   │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 11. incidentCtrl  │
       │                  │                      │    .respond()      │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 12. UPDATE inc.   │
       │                  │                      │    SET status=     │
       │                  │                      │    IN_PROGRESS     │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 13. Notify reporter│
       │                  │                      │<──────────────────│
       │                  │                      │                      │
       │                  │ 14. Return {success}│                     │
       │                  │<────────────────────│                     │
       │                  │                      │                      │
       │ 15.Show "Under   │                      │                     │
       │    response"     │                      │                     │
       │<─────────────────│                      │                     │
       │                  │                      │                     │
```

---

## 5. API Request/Response Flow

### 5.1 Generic API Client Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Component  │     │ ApiClient    │     │    Fetch API    │     │   Express       │
│  (React)    │     │  (api.ts)    │     │                 │     │   Server        │
└──────┬──────┘     └──────┬───────┘     └────────┬────────┘     └────────┬────────┘
       │                  │                      │                      │
       │ 1. Call API     │                      │                      │
       │    method       │                      │                      │
       │    e.g.         │                      │                      │
       │    tourApi.getAll│                     │                      │
       │────────────────>│                      │                      │
       │                  │                      │                      │
       │                  │ 2. request<T>       │                      │
       │                  │    (endpoint,       │                      │
       │                  │     options)       │                      │
       │                  │───────┐            │                      │
       │                  │       │            │                      │
       │                  │<──────┘            │                      │
       │                  │                      │                      │
       │                  │ 3. getToken()      │                      │
       │                  │────────────────────>│                      │
       │                  │                      │                      │
       │                  │ 4. token           │                      │
       │                  │<────────────────────│                      │
       │                  │                      │                      │
       │                  │ 5. fetch(url,      │                      │
       │                  │    {method,        │                      │
       │                  │     headers,       │                      │
       │                  │     body})         │                      │
       │                  │────────────────────>│                     │
       │                  │                      │                      │
       │                  │                      │ 6. Route handler  │
       │                  │                      │    matches        │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 7. Middleware     │
       │                  │                      │    (auth, validate)│
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 8. Controller     │
       │                  │                      │    processes      │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 9. Database       │
       │                  │                      │    operation      │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 10. Response      │
       │                  │                      │<──────────────────│
       │                  │                      │                      │
       │                  │ 11. Response JSON  │                     │
       │                  │<────────────────────│                      │
       │                  │                      │                      │
       │                  │ 12. Check response  │
       │                  │    .ok              │
       │                  │───────┐            │                      │
       │                  │       │            │                      │
       │                  │<──────┘            │                      │
       │                  │                      │                      │
       │                  │ 13. Handle 401     │                      │
       │                  │    (if unauthorized)                     │
       │                  │───────┐            │                      │
       │                  │       │            │                      │
       │                  │<──────┘            │                      │
       │                  │                      │                      │
       │                  │ 14. Return         │                      │
       │                  │    ApiResponse<T>  │                      │
       │                  │───────┐            │                      │
       │                  │       │            │                      │
       │                  │<──────┘            │                      │
       │                  │                      │                      │
       │ 15. Use data    │                      │                      │
       │<────────────────│                      │                      │
       │                  │                      │                      │
```

---

## 6. Database Interaction Flow

### 6.1 Tour CRUD Operations

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Controller  │     │   Model     │     │   Database     │     │   SQLite DB    │
│             │     │             │     │   (Better-     │     │   (wal mode)   │
│             │     │             │     │   SQLite3)     │     │                 │
└──────┬──────┘     └──────┬───────┘     └────────┬────────┘     └────────┬────────┘
       │                  │                      │                      │
       │ 1. createTour() │                      │                      │
       │    (tourData)   │                      │                      │
       │────────────────>│                      │                      │
       │                  │                      │                      │
       │                  │ 2. new Tour(tourData)                     │
       │                  │───────┐            │                      │
       │                  │       │            │                      │
       │                  │<──────┘            │                      │
       │                  │                      │                      │
       │                  │ 3. INSERT INTO tours│                    │
       │                  │    (name, desc,     │                    │
       │                  │     start_date,    │                    │
       │                  │     end_date, ...)│                    │
       │                  │────────────────────>│                     │
       │                  │                      │                      │
       │                  │                      │ 4. Execute SQL     │
       │                  │                      │───────────────────>│
       │                  │                      │                      │
       │                  │                      │ 5. Return result   │
       │                  │                      │<──────────────────│
       │                  │                      │                      │
       │                  │ 6. Set id from      │                      │
       │                  │    result.lastID    │
       │                  │───────┐            │                      │
       │                  │       │            │                      │
       │                  │<──────┘            │                      │
       │                  │                      │                      │
       │ 7. Return tour  │                      │                     │
       │<────────────────│                      │                      │
       │                  │                      │                      │
```

---

## 7. Summary of Key Interactions

| Flow              | Frontend → API                 | Backend Processing                       | Database               |
| ----------------- | ------------------------------ | ---------------------------------------- | ---------------------- |
| Login             | POST /api/auth/login           | validate → authenticate → generate token | SELECT user            |
| Get Tours         | GET /api/tours                 | query tours                              | SELECT \* FROM tours   |
| Create Tour       | POST /api/tours                | validate → authorize → insert            | INSERT INTO tours      |
| Check-in          | POST /api/attendance/checkin   | validate → geofence check → insert       | INSERT INTO attendance |
| SOS Alert         | POST /api/incidents/sos        | insert critical incident → notify        | INSERT INTO incidents  |
| Verify Attendance | PUT /api/attendance/:id/verify | authorize → update                       | UPDATE attendance      |

---

_Generated for Tour Management System - Next.js + Express Application_
