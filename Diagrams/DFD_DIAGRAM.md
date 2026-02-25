# TourSync - Data Flow Diagram (DFD)

This document contains the Data Flow Diagrams (Level 0 and Level 1) for the Tour Management System.

---

## DFD Level 0 (Context Diagram)

The Context Diagram shows the entire system as a single process and identifies external entities and data flows.

```
mermaid
flowchart TB
    subgraph "TourSync System"
        SYSTEM["TourSync\nTour Management\nSystem"]
    end

    subgraph "External Entities"
        ADMIN["Admin"]
        GUIDE["Guide"]
        TOURIST["Tourist"]
        EMAIL["Email\nService"]
        DATABASE["PostgreSQL\nDatabase"]
    end

    ADMIN -->|"Manage Tours, Users,\nBudgets, Reports"| SYSTEM
    GUIDE -->|"Lead Tours, Manage\nAttendance, Incidents"| SYSTEM
    TOURIST -->|"Join Tours, Check-in,\nReport Issues"| SYSTEM

    SYSTEM -->|"Tour Details,\nAnnouncements,\nReports"| ADMIN
    SYSTEM -->|"Tour Info,\nAttendance Status,\nIncidents"| GUIDE
    SYSTEM -->|"Tour Access,\nCheck-in Confirmation,\nAlerts"| TOURIST

    SYSTEM <-->|"CRUD Operations\nData Storage"| DATABASE
    SYSTEM -->|"Notifications,\nVerification Emails"| EMAIL
```

---

## DFD Level 0 - Detailed Data Flows

```
mermaid
flowchart TB
    subgraph "External Entities"
        E1["Admin"]
        E2["Guide"]
        E3["Tourist"]
        E4["Email Service"]
        E5["Database"]
    end

    subgraph "TourSync System"
        SYSTEM["TourSync\nTour Management\nPlatform"]
    end

    %% Admin Flows
    E1 -->|"1. User Credentials"| SYSTEM
    E1 -->|"2. Tour Data\n(Name, Dates, Price)"| SYSTEM
    E1 -->|"3. Budget Data\n(Amount, Expenses)"| SYSTEM
    E1 -->|"4. Leader Assignment"| SYSTEM

    SYSTEM -->|"5. Tour List\nConfirmation"| E1
    SYSTEM -->|"6. Reports\nAnalytics"| E1
    SYSTEM -->|"7. Audit Logs"| E1

    %% Guide Flows
    E2 -->|"8. Login Credentials"| SYSTEM
    E2 -->|"9. Attendance Records"| SYSTEM
    E2 -->|"10. Incident Reports"| SYSTEM
    E2 -->|"11. Announcements"| SYSTEM

    SYSTEM -->|"12. Assigned Tours\nItineraries"| E2
    SYSTEM -->|"13. Participant List"| E2
    SYSTEM -->|"14. Emergency Alerts"| E2

    %% Tourist Flows
    E3 -->|"15. Registration Data"| SYSTEM
    E3 -->|"16. Login Credentials"| SYSTEM
    E3 -->|"17. Tour Selection"| SYSTEM
    E3 -->|"18. Check-in Data\n(Location)"| SYSTEM
    E3 -->|"19. Incident Reports\n(SOS, Health)"| SYSTEM

    SYSTEM -->|"20. Available Tours"| E3
    SYSTEM -->|"21. Tour Details\nItinerary"| E3
    SYSTEM -->|"22. Check-in\nConfirmation"| E3
    SYSTEM -->|"23. Announcements"| E3

    %% System to External
    SYSTEM -->|"24. Verification Email"| E4
    SYSTEM -->|"25. Notifications\nAlerts"| E4

    SYSTEM <-->|"26. Data Storage\nRetrieval"| E5
```

---

## DFD Level 1 (Process Decomposition)

DFD Level 1 shows the main processes within the system.

```
mermaid
flowchart TB
    subgraph "External Entities"
        ADMIN["Admin"]
        GUIDE["Guide"]
        TOURIST["Tourist"]
        EMAIL["Email Service"]
        DB["Database"]
    end

    subgraph "TourSync System"
        P1["P1\nAuthentication"]
        P2["P2\nUser Management"]
        P3["P3\nTour Management"]
        P4["P4\nAttendance\nTracking"]
        P5["P5\nSafety &\nIncidents"]
        P6["P6\nBudget\nManagement"]
        P7["P7\nAnnouncement\nSystem"]
        P8["P8\nAccommodation\nManagement"]
        P9["P9\nItinerary\nPlanning"]
        P10["P10\nPhoto\nGallery"]
        P11["P11\nAudit\nLogging"]
    end

    D1["User Data"]
    D2["Tour Data"]
    D3["Attendance Data"]
    D4["Incident Data"]
    D5["Budget Data"]
    D6["Announcement Data"]

    ADMIN --> P1
    GUIDE --> P1
    TOURIST --> P1

    P1 -->|"User Session"| ADMIN
    P1 -->|"User Session"| GUIDE
    P1 -->|"User Session"| TOURIST

    P1 --> P2
    P2 --> D1
    D1 <--> DB

    P2 --> P3
    P3 --> D2
    D2 <--> DB

    P3 --> P4
    P4 --> D3
    D3 <--> DB

    P3 --> P5
    P5 --> D4
    D4 <--> DB

    P3 --> P6
    P6 --> D5
    D5 <--> DB

    P3 --> P7
    P7 --> D6
    D6 <--> DB

    P3 --> P8
    P8 <--> DB

    P3 --> P9
    P9 <--> DB

    P3 --> P10
    P10 <--> DB

    P2 --> P11
    P11 <--> DB

    P5 -->|"Emergency Alert"| EMAIL
    P7 -->|"Notifications"| EMAIL
    P1 -->|"Verification"| EMAIL
```

---

## DFD Level 1 - Process Descriptions

### Process 1: Authentication

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PROCESS 1: AUTHENTICATION                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Input:        User Credentials (email, password)                       │
│                Registration Data                                         │
│                                                                          │
│  Processing:   1. Validate credentials                                   │
│                2. Hash/Verify password                                   │
│                3. Generate JWT tokens                                   │
│                4. Manage session                                         │
│                                                                          │
│  Output:       User Session Token                                        │
│                Refresh Token                                             │
│                Profile Data                                              │
│                                                                          │
│  Entities:    - User Data (Database)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Data Flows:
• User → P1: Login Request {email, password}
• User → P1: Registration Request {email, password, name, role}
• P1 → User: Session Token
• P1 → User: Profile Data
• P1 → Email: Verification Email
• P1 ↔ DB: User Authentication Data
```

---

### Process 2: User Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PROCESS 2: USER MANAGEMENT                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Input:        Admin Commands                                            │
│                User Profile Updates                                      │
│                Role Assignments                                          │
│                                                                          │
│  Processing:   1. Create/Update/Delete users                            │
│                2. Manage roles (admin/guide/tourist)                   │
│                3. Update profile information                           │
│                4. Change passwords                                      │
│                                                                          │
│  Output:       User List                                                 │
│                Role Permissions                                          │
│                Confirmation Messages                                     │
│                                                                          │
│  Entities:    - User Data (Database)                                    │
│              - Audit Logs (Database)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Data Flows:
• Admin → P2: Create User {email, name, role}
• Admin → P2: Update User {id, data}
• Admin → P2: Delete User {id}
• User → P2: Update Profile {id, data}
• User → P2: Change Password {id, old_pwd, new_pwd}
• P2 → Admin: User List
• P2 → User: Confirmation
• P2 ↔ DB: User Records
• P2 → P11: Audit Log Entry
```

---

### Process 3: Tour Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PROCESS 3: TOUR MANAGEMENT                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Input:        Tour Creation Data                                        │
│                Tour Update Requests                                      │
│                Tour Search Filters                                       │
│                                                                          │
│  Processing:   1. Create new tour                                       │
│                2. Update tour details                                   │
│                3. Delete tour                                           │
│                4. Assign/unassign leader                                │
│                5. Manage tour status                                    │
│                6. Join/leave tours                                      │
│                                                                          │
│  Output:       Tour Details                                             │
│                Tour List                                                │
│                Participant List                                          │
│                Tour Status Updates                                      │
│                                                                          │
│  Entities:    - Tour Data (Database)                                    │
│              - Tour Users (Database)                                   │
│              - Itinerary (Database)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Data Flows:
• Admin → P3: Create Tour {name, dates, destination, price}
• Admin → P3: Update Tour {id, data}
• Admin → P3: Delete Tour {id}
• Admin → P3: Assign Leader {tour_id, leader_id}
• Tourist → P3: Join Tour {tour_id}
• Tourist → P3: Leave Tour {tour_id}
• Guide → P3: View Tours {}
• Tourist → P3: View Tours {filters}
• P3 → All Users: Tour Details
• P3 → Admin: Participant List
• P3 ↔ DB: Tour Records
• P3 → P4: Participant Data
• P3 → P5: Tour Safety Data
• P3 → P6: Tour Budget
• P3 → P7: Tour Announcements
• P3 → P8: Tour Accommodations
• P3 → P9: Tour Itinerary
• P3 → P10: Tour Photos
• P3 → P11: Audit Log Entry
```

---

### Process 4: Attendance Tracking

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   PROCESS 4: ATTENDANCE TRACKING                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Input:        Check-in Request (with location)                         │
│                Verification Request                                      │
│                Attendance Query                                          │
│                                                                          │
│  Processing:   1. Validate check-in location (geofencing)               │
│                2. Record attendance                                     │
│                3. Verify attendance (guide/admin)                      │
│                4. Enforce 24-hour immutability                         │
│                5. Calculate attendance statistics                      │
│                                                                          │
│  Output:       Check-in Confirmation                                    │
│                Attendance Records                                        │
│                Attendance Reports                                       │
│                                                                          │
│  Entities:    - Attendance Data (Database)                             │
│              - Checkpoint Data (Database)                              │
│              - Tour Data (Database)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Data Flows:
• Tourist → P4: Check-in {tour_id, user_id, location}
• Guide → P4: Verify Attendance {attendance_id}
• Admin → P4: View Attendance {tour_id}
• P4 → Tourist: Check-in Confirmation
• P4 → Guide: Attendance Records
• P4 → Admin: Attendance Reports
• P4 ↔ DB: Attendance Records
• P4 → P11: Audit Log Entry
```

---

### Process 5: Safety & Incidents

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROCESS 5: SAFETY & INCIDENTS                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Input:        SOS Alert (one-click)                                     │
│                Health Issue Report                                       │
│                General Incident Report                                   │
│                Incident Response                                         │
│                                                                          │
│  Processing:   1. Create SOS emergency alert                            │
│                2. Record health issues                                  │
│                3. Log general incidents                                 │
│                4. Assign response personnel                             │
│                5. Track incident status                                 │
│                6. Notify relevant parties                               │
│                                                                          │
│  Output:       Incident Confirmation                                     │
│                Emergency Alerts                                          │
│                Response Status                                           │
│                Resolution Reports                                        │
│                                                                          │
│  Entities:    - Incident Data (Database)                                │
│              - Safety Protocols (Database)                             │
│              - User Data (Database)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Data Flows:
• Tourist → P5: Trigger SOS {tour_id, location}
• Tourist → P5: Report Health Issue {tour_id, category, description}
• Tourist → P5: Report Incident {tour_id, description}
• Guide → P5: Respond to Incident {incident_id}
• Guide → P5: Resolve Incident {incident_id, resolution}
• Admin → P5: View Incidents {tour_id}
• P5 → All Users: Emergency Alert
• P5 → Guide/Admin: Incident Details
• P5 → Tourist: Incident Confirmation
• P5 → Email: Notification
• P5 ↔ DB: Incident Records
• P5 ↔ DB: Safety Protocols
• P5 → P11: Audit Log Entry
```

---

### Process 6: Budget Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROCESS 6: BUDGET MANAGEMENT                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Input:        Budget Creation Data                                      │
│                Expense Records                                           │
│                Budget Update Request                                     │
│                                                                          │
│  Processing:   1. Create budget for tour                               │
│                2. Track expenses                                         │
│                3. Calculate spent vs budget                             │
│                4. Update budget amounts                                  │
│                5. Calculate per-participant fees                        │
│                                                                          │
│  Output:       Budget Details                                           │
│                Expense Reports                                          │
│                Budget Status                                             │
│                                                                          │
│  Entities:    - Budget Data (Database)                                 │
│              - Expense Data (Database)                                 │
│              - Tour Data (Database)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Data Flows:
• Admin → P6: Create Budget {tour_id, total_amount, currency}
• Admin → P6: Add Expense {tour_id, amount, category, description}
• Admin → P6: Update Budget {id, data}
• Admin → P6: Delete Budget {id}
• Guide → P6: View Budget {tour_id}
• P6 → Admin: Budget Details
• P6 → Guide: Budget Summary
• P6 ↔ DB: Budget Records
• P6 ↔ DB: Expense Records
• P6 → P11: Audit Log Entry
```

---

### Process 7: Announcement System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   PROCESS 7: ANNOUNCEMENT SYSTEM                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Input:        Announcement Content                                      │
│                Attachment Files                                          │
│                Announcement Updates                                      │
│                                                                          │
│  Processing:   1. Create announcement                                   │
│                2. Upload attachments                                     │
│                3. Edit announcement                                      │
│                4. Delete announcement                                    │
│                5. Notify participants                                    │
│                                                                          │
│  Output:       Announcement Details                                      │
│                Announcement List                                         │
│                Notification                                              │
│                                                                          │
│  Entities:    - Announcement Data (Database)                          │
│              - Report Files (Database)                                 │
│              - Tour Data (Database)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Data Flows:
• Admin → P7: Create Announcement {tour_id, title, content}
• Admin → P7: Upload File {announcement_id, file}
• Admin → P7: Update Announcement {id, data}
• Admin → P7: Delete Announcement {id}
• Guide → P7: Create Announcement {tour_id, title, content}
• Tourist → P7: View Announcements {tour_id}
• P7 → All Users: Announcement List
• P7 → Email: Notification
• P7 ↔ DB: Announcement Records
• P7 ↔ DB: Report Files
• P7 → P11: Audit Log Entry
```

---

### Process 8: Accommodation Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  PROCESS 8: ACCOMMODATION MANAGEMENT                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Input:        Accommodation Data                                        │
│                Room Assignment                                           │
│                                                                          │
│  Processing:   1. Add accommodation                                      │
│                2. Update accommodation details                          │
│                3. Delete accommodation                                  │
│                4. Assign rooms to participants                         │
│                5. Manage room assignments                                │
│                                                                          │
│  Output:       Accommodation Details                                     │
│                Room Assignment List                                      │
│                                                                          │
│  Entities:    - Accommodation Data (Database)                          │
│              - Room Assignments (Database)                            │
│              - User Data (Database)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Data Flows:
• Admin → P8: Add Accommodation {tour_id, name, address, dates}
• Admin → P8: Update Accommodation {id, data}
• Admin → P8: Delete Accommodation {id}
• Admin → P8: Assign Room {accommodation_id, user_id, room_number}
• Tourist → P8: View Accommodations {tour_id}
• P8 → Admin: Accommodation List
• P8 → Tourist: Accommodation Details
• P8 ↔ DB: Accommodation Records
• P8 ↔ DB: Room Assignments
• P8 → P11: Audit Log Entry
```

---

### Process 9: Itinerary Planning

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROCESS 9: ITINERARY PLANNING                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Input:        Itinerary Items                                           │
│                Route Data                                                 │
│                Checkpoint Data                                            │
│                                                                          │
│  Processing:   1. Create itinerary                                       │
│                2. Add/edit daily activities                             │
│                3. Manage routes and checkpoints                         │
│                4. Track progress                                          │
│                5. Update status                                          │
│                                                                          │
│  Output:       Itinerary Details                                         │
│                Route Map                                                  │
│                Daily Schedule                                             │
│                                                                          │
│  Entities:    - Itinerary Data (Database)                             │
│              - Route Data (Database)                                    │
│              - Checkpoint Data (Database)                              │
│              - Place Data (Database)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Data Flows:
• Admin → P9: Create Itinerary {tour_id, date, activities}
• Admin → P9: Create Route {tour_id, checkpoints}
• Admin → P9: Update Itinerary {id, data}
• Tourist → P9: View Itinerary {tour_id}
• Guide → P9: View Itinerary {tour_id}
• P9 → Tourist: Daily Schedule
• P9 → Guide: Full Itinerary
• P9 ↔ DB: Itinerary Records
• P9 ↔ DB: Route Records
• P9 ↔ DB: Checkpoint Records
• P9 → P11: Audit Log Entry
```

---

### Process 10: Photo Gallery

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PROCESS 10: PHOTO GALLERY                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Input:        Photo Upload                                              │
│                Photo Caption                                             │
│                                                                          │
│  Processing:   1. Upload photo                                           │
│                2. Store photo metadata                                   │
│                3. Add/edit caption                                       │
│                4. Delete photo                                            │
│                5. Display gallery                                        │
│                                                                          │
│  Output:       Photo Gallery                                             │
│                Photo Details                                              │
│                                                                          │
│  Entities:    - Tour Photos (Database)                                 │
│              - User Data (Database)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Data Flows:
• Tourist → P10: Upload Photo {tour_id, photo, caption}
• Tourist → P10: Delete Photo {id}
• Admin → P10: Delete Photo {id}
• Tourist → P10: View Photos {tour_id}
• P10 → All Users: Photo Gallery
• P10 ↔ DB: Photo Records
• P10 → P11: Audit Log Entry
```

---

### Process 11: Audit Logging

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       PROCESS 11: AUDIT LOGGING                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Input:        System Events                                             │
│                User Actions                                               │
│                Entity Changes                                             │
│                                                                          │
│  Processing:   1. Capture user actions                                  │
│                2. Store old and new values                               │
│                3. Record IP address and user agent                       │
│                4. Timestamp events                                       │
│                5. Generate audit reports                                │
│                                                                          │
│  Output:       Audit Log Entries                                         │
│                Audit Reports                                             │
│                                                                          │
│  Entities:    - Audit Logs (Database)                                  │
│              - User Data (Database)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Data Flows:
• All Processes → P11: Log Event {user_id, action, entity, old/new}
• Admin → P11: View Audit Logs {filters}
• P11 → Admin: Audit Log Report
• P11 ↔ DB: Audit Records
```

---

## DFD Level 1 - Complete Process Map

```
mermaid
flowchart LR
    subgraph External
        ADMIN[Admin]
        GUIDE[Guide]
        TOURIST[Tourist]
        EMAIL[Email Service]
    end

    subgraph Processes
        P1[Auth]
        P2[User Mgmt]
        P3[Tour Mgmt]
        P4[Attendance]
        P5[Safety]
        P6[Budget]
        P7[Announce]
        P8[Accommodation]
        P9[Itinerary]
        P10[Photos]
        P11[Audit]
    end

    subgraph DataStores
        USERS[(Users)]
        TOURS[(Tours)]
        ATTEND[(Attendance)]
        INCIDENTS[(Incidents)]
        BUDGET[(Budget)]
        ANNOUNCE[(Announce- ments)]
        ACCOM[(Accommo- dations)]
        ITIN[(Itinerary)]
        PHOTOS[(Photos)]
        AUDIT[(Audit Logs)]
    end

    ADMIN --> P1
    GUIDE --> P1
    TOURIST --> P1

    P1 --> P2
    P2 --> USERS
    P2 --> P11

    P2 --> P3
    P3 --> TOURS
    P3 --> P4
    P3 --> P5
    P3 --> P6
    P3 --> P7
    P3 --> P8
    P3 --> P9
    P3 --> P10

    P4 --> ATTEND
    P5 --> INCIDENTS
    P6 --> BUDGET
    P7 --> ANNOUNCE
    P8 --> ACCOM
    P9 --> ITIN
    P10 --> PHOTOS

    P11 --> AUDIT

    P5 --> EMAIL
    P7 --> EMAIL
    P1 --> EMAIL
```

---

## Data Flow Summary Table

| From Process        | To Process/Data Store | Data Flow Name        |
| ------------------- | --------------------- | --------------------- |
| Admin/Guide/Tourist | P1: Authentication    | User Credentials      |
| P1: Authentication  | User Session          | Session Token         |
| P1: Authentication  | P2: User Mgmt         | User Authentication   |
| P2: User Mgmt       | USERS Data Store      | User Records          |
| P2: User Mgmt       | P11: Audit            | Audit Entry           |
| P2: User Mgmt       | P3: Tour Mgmt         | User Permissions      |
| P3: Tour Mgmt       | TOURS Data Store      | Tour Records          |
| P3: Tour Mgmt       | P4: Attendance        | Tour Participants     |
| P3: Tour Mgmt       | P5: Safety            | Tour Safety Info      |
| P3: Tour Mgmt       | P6: Budget            | Tour Budget Info      |
| P3: Tour Mgmt       | P7: Announcements     | Tour Context          |
| P3: Tour Mgmt       | P8: Accommodation     | Tour Accommodations   |
| P3: Tour Mgmt       | P9: Itinerary         | Tour Schedule         |
| P3: Tour Mgmt       | P10: Photos           | Tour Photos           |
| P4: Attendance      | ATTEND Data Store     | Attendance Records    |
| P5: Safety          | INCIDENTS Data Store  | Incident Reports      |
| P5: Safety          | Email Service         | Emergency Alert       |
| P6: Budget          | BUDGET Data Store     | Budget Records        |
| P7: Announcements   | ANNOUNCE Data Store   | Announcements         |
| P7: Announcements   | Email Service         | Notifications         |
| P8: Accommodation   | ACCOM Data Store      | Accommodation Records |
| P9: Itinerary       | ITIN Data Store       | Itinerary Records     |
| P10: Photos         | PHOTOS Data Store     | Photo Records         |
| All Processes       | P11: Audit            | System Events         |
| P11: Audit          | AUDIT Data Store      | Audit Logs            |

---

## Key Data Stores

| Data Store         | Description                    | Related Processes               |
| ------------------ | ------------------------------ | ------------------------------- |
| **Users**          | User accounts, roles, profiles | P1, P2, P11                     |
| **Tours**          | Tour information, status       | P3, P4, P5, P6, P7, P8, P9, P10 |
| **Attendance**     | Check-in records               | P4                              |
| **Incidents**      | Safety incidents, SOS          | P5                              |
| **Budget**         | Budgets and expenses           | P6                              |
| **Announcements**  | Tour announcements             | P7                              |
| **Accommodations** | Hotels and room assignments    | P8                              |
| **Itinerary**      | Daily schedules, routes        | P9                              |
| **Photos**         | Tour photo gallery             | P10                             |
| **Audit Logs**     | System activity logs           | P11                             |

---

_Generated for TourSync - Tour Management System_
