# TourSync - ER Diagram

This document contains the Entity-Relationship (ER) Diagram for the Tour Management System database.

---

## Database Schema Overview

The database consists of **20 tables** organized into the following categories:

| Category               | Tables                                              |
| ---------------------- | --------------------------------------------------- |
| **Core**               | users                                               |
| **Tour Management**    | tours, tour_users, itineraries, routes, checkpoints |
| **Location**           | states, cities, places                              |
| **Attendance**         | attendance                                          |
| **Financial**          | budgets, expenses                                   |
| **Safety & Incidents** | incidents, safety_protocols                         |
| **Communication**      | announcements, report_files                         |
| **Accommodation**      | accommodations, room_assignments                    |
| **Media**              | tour_photos                                         |
| **Audit**              | audit_logs                                          |

---

## Entity-Relationship Diagram

```
mermaid
erDiagram
    USERS ||--o{ TOURS : "creates"
    USERS ||--o{ TOURS : "assigned_leader"
    USERS ||--o{ TOUR_USERS : "joins"
    USERS ||--o{ ATTENDANCE : "marks"
    USERS ||--o{ INCIDENTS : "reports"
    USERS ||--o{ INCIDENTS : "responds"
    USERS ||--o{ ANNOUNCEMENTS : "creates"
    USERS ||--o{ REPORT_FILES : "uploads"
    USERS ||--o{ AUDIT_LOGS : "generates"
    USERS ||--o{ ACCOMMODATIONS : "assigned_to"
    USERS ||--o{ TOUR_PHOTOS : "uploads"
    USERS ||--o{ BUDGETS : "manages"

    TOURS ||--o{ ANNOUNCEMENTS : "has"
    TOURS ||--o{ ITINERARIES : "contains"
    TOURS ||--o{ ROUTES : "has"
    TOURS ||--o{ BUDGETS : "has"
    TOURS ||--o{ EXPENSES : "has"
    TOURS ||--o{ INCIDENTS : "has"
    TOURS ||--o{ SAFETY_PROTOCOLS : "has"
    TOURS ||--o{ ACCOMMODATIONS : "uses"
    TOURS ||--o{ TOUR_PHOTOS : "contains"
    TOURS ||--o{ TOUR_USERS : "includes"
    TOURS ||--o{ ATTENDANCE : "tracks"

    ITINERARIES }o--|| ROUTES : "follows"
    ROUTES ||--o{ CHECKPOINTS : "contains"
    CHECKPOINTS }o--|| PLACES : "located_at"

    PLACES ||--o{ CITIES : "in"
    CITIES ||--o{ STATES : "in"

    BUDGETS ||--o{ EXPENSES : "tracks"
    ACCOMMODATIONS ||--o{ ROOM_ASSIGNMENTS : "has"
    ROOM_ASSIGNMENTS }o--|| USERS : "assigned_to"

    ANNOUNCEMENTS ||--o{ REPORT_FILES : "contains"
```

---

## Detailed Entity Definitions

### 1. USERS

| Column        | Type         | Constraints      | Description           |
| ------------- | ------------ | ---------------- | --------------------- |
| id            | SERIAL       | PRIMARY KEY      | Unique user ID        |
| email         | VARCHAR(255) | UNIQUE, NOT NULL | User email address    |
| password_hash | VARCHAR(255) | NOT NULL         | Hashed password       |
| name          | VARCHAR(255) | -                | User's full name      |
| role          | VARCHAR(20)  | NOT NULL, CHECK  | admin/guide/tourist   |
| created_at    | TIMESTAMP    | DEFAULT NOW()    | Account creation time |

**Relationships:**

- Creates tours (created_by in TOURS)
- Assigned as leader to tours (assigned_leader_id in TOURS)
- Joins tours as participant (tour_users)
- Marks attendance
- Reports and responds to incidents
- Creates announcements
- Uploads photos and files

---

### 2. TOURS

| Column             | Type          | Constraints          | Description                         |
| ------------------ | ------------- | -------------------- | ----------------------------------- |
| id                 | SERIAL        | PRIMARY KEY          | Unique tour ID                      |
| name               | VARCHAR(255)  | NOT NULL             | Tour name                           |
| description        | TEXT          | -                    | Tour description                    |
| start_date         | DATE          | -                    | Tour start date                     |
| end_date           | DATE          | -                    | Tour end date                       |
| destination        | VARCHAR(255)  | -                    | Tour destination                    |
| price              | NUMERIC(10,2) | -                    | Tour price                          |
| status             | VARCHAR(20)   | CHECK                | planned/ongoing/completed/cancelled |
| content            | TEXT          | -                    | Tour content/details                |
| created_by         | INT           | REFERENCES users(id) | Admin who created tour              |
| assigned_leader_id | INT           | REFERENCES users(id) | Guide leading the tour              |
| leader_assigned_at | TIMESTAMP     | -                    | When leader was assigned            |
| participant_count  | INT           | DEFAULT 0            | Number of participants              |
| created_at         | TIMESTAMP     | DEFAULT NOW()        | Creation time                       |

**Relationships:**

- Has many announcements
- Has many itineraries
- Has many routes
- Has one budget
- Has many expenses
- Has many incidents
- Has many safety protocols
- Has many accommodations
- Has many photos
- Has many tour_users

---

### 3. TOUR_USERS (Junction Table)

| Column    | Type        | Constraints                    | Description              |
| --------- | ----------- | ------------------------------ | ------------------------ |
| id        | SERIAL      | PRIMARY KEY                    | Unique ID                |
| tour_id   | INT         | NOT NULL, REFERENCES tours(id) | Tour reference           |
| user_id   | INT         | NOT NULL, REFERENCES users(id) | User reference           |
| role      | VARCHAR(20) | NOT NULL, CHECK                | participant/guide/leader |
| joined_at | TIMESTAMP   | DEFAULT NOW()                  | When user joined         |

**Unique Constraint:** (tour_id, user_id)

---

### 4. ANNOUNCEMENTS

| Column     | Type         | Constraints          | Description            |
| ---------- | ------------ | -------------------- | ---------------------- |
| id         | SERIAL       | PRIMARY KEY          | Unique announcement ID |
| title      | VARCHAR(255) | NOT NULL             | Announcement title     |
| content    | TEXT         | NOT NULL             | Announcement content   |
| tour_id    | INT          | REFERENCES tours(id) | Associated tour        |
| created_at | TIMESTAMP    | DEFAULT NOW()        | Creation time          |

**Relationships:**

- Belongs to one tour
- Has many report_files

---

### 5. REPORT_FILES

| Column          | Type         | Constraints                    | Description         |
| --------------- | ------------ | ------------------------------ | ------------------- |
| id              | SERIAL       | PRIMARY KEY                    | Unique file ID      |
| announcement_id | INT          | REFERENCES announcements(id)   | Parent announcement |
| filename        | VARCHAR(255) | NOT NULL                       | Stored filename     |
| original_name   | VARCHAR(255) | NOT NULL                       | Original filename   |
| file_path       | VARCHAR(500) | NOT NULL                       | File storage path   |
| file_size       | INT          | NOT NULL                       | File size in bytes  |
| mime_type       | VARCHAR(100) | NOT NULL                       | MIME type           |
| uploaded_by     | INT          | NOT NULL, REFERENCES users(id) | Uploader            |
| created_at      | TIMESTAMP    | DEFAULT NOW()                  | Upload time         |

---

### 6. STATES

| Column     | Type         | Constraints      | Description     |
| ---------- | ------------ | ---------------- | --------------- |
| id         | SERIAL       | PRIMARY KEY      | Unique state ID |
| name       | VARCHAR(100) | NOT NULL, UNIQUE | State name      |
| code       | VARCHAR(10)  | UNIQUE           | State code      |
| created_at | TIMESTAMP    | DEFAULT NOW()    | Creation time   |

**Relationships:**

- Has many cities

---

### 7. CITIES

| Column     | Type         | Constraints                     | Description    |
| ---------- | ------------ | ------------------------------- | -------------- |
| id         | SERIAL       | PRIMARY KEY                     | Unique city ID |
| name       | VARCHAR(100) | NOT NULL                        | City name      |
| state_id   | INT          | NOT NULL, REFERENCES states(id) | Parent state   |
| created_at | TIMESTAMP    | DEFAULT NOW()                   | Creation time  |

**Unique Constraint:** (name, state_id)

**Relationships:**

- Belongs to one state
- Has many places

---

### 8. PLACES

| Column      | Type          | Constraints                     | Description                      |
| ----------- | ------------- | ------------------------------- | -------------------------------- |
| id          | SERIAL        | PRIMARY KEY                     | Unique place ID                  |
| name        | VARCHAR(255)  | NOT NULL                        | Place name                       |
| city_id     | INT           | NOT NULL, REFERENCES cities(id) | Parent city                      |
| latitude    | NUMERIC(10,8) | -                               | GPS latitude                     |
| longitude   | NUMERIC(11,8) | -                               | GPS longitude                    |
| description | TEXT          | -                               | Place description                |
| category    | VARCHAR(20)   | CHECK                           | HISTORICAL/NATURAL/CULTURAL/etc. |
| created_at  | TIMESTAMP     | DEFAULT NOW()                   | Creation time                    |

**Relationships:**

- Belongs to one city
- Referenced by checkpoints

---

### 9. ROUTES

| Column             | Type         | Constraints                    | Description                        |
| ------------------ | ------------ | ------------------------------ | ---------------------------------- |
| id                 | SERIAL       | PRIMARY KEY                    | Unique route ID                    |
| tour_id            | INT          | NOT NULL, REFERENCES tours(id) | Parent tour                        |
| name               | VARCHAR(255) | NOT NULL                       | Route name                         |
| description        | TEXT         | -                              | Route description                  |
| total_distance     | NUMERIC(8,2) | -                              | Total distance                     |
| estimated_duration | INT          | -                              | Estimated time in minutes          |
| status             | VARCHAR(20)  | CHECK                          | PLANNED/ACTIVE/COMPLETED/CANCELLED |
| created_at         | TIMESTAMP    | DEFAULT NOW()                  | Creation time                      |

**Relationships:**

- Belongs to one tour
- Has many checkpoints
- Referenced by itineraries

---

### 10. CHECKPOINTS

| Column                   | Type          | Constraints                     | Description                      |
| ------------------------ | ------------- | ------------------------------- | -------------------------------- |
| id                       | SERIAL        | PRIMARY KEY                     | Unique checkpoint ID             |
| route_id                 | INT           | NOT NULL, REFERENCES routes(id) | Parent route                     |
| place_id                 | INT           | REFERENCES places(id)           | Associated place                 |
| name                     | VARCHAR(255)  | NOT NULL                        | Checkpoint name                  |
| description              | TEXT          | -                               | Checkpoint description           |
| sequence_order           | INT           | NOT NULL                        | Order in route                   |
| latitude                 | NUMERIC(10,8) | -                               | GPS latitude                     |
| longitude                | NUMERIC(11,8) | -                               | GPS longitude                    |
| estimated_arrival_time   | TIME          | -                               | Expected arrival                 |
| estimated_departure_time | TIME          | -                               | Expected departure               |
| actual_arrival_time      | TIMESTAMP     | -                               | Actual arrival                   |
| actual_departure_time    | TIMESTAMP     | -                               | Actual departure                 |
| status                   | VARCHAR(10)   | CHECK                           | PENDING/ARRIVED/DEPARTED/SKIPPED |
| created_at               | TIMESTAMP     | DEFAULT NOW()                   | Creation time                    |

**Relationships:**

- Belongs to one route
- Can reference one place
- Referenced by attendance records

---

### 11. ATTENDANCE

| Column            | Type          | Constraints                | Description                |
| ----------------- | ------------- | -------------------------- | -------------------------- |
| id                | SERIAL        | PRIMARY KEY                | Unique attendance ID       |
| user_id           | INT           | REFERENCES users(id)       | User who marked attendance |
| tour_id           | INT           | REFERENCES tours(id)       | Tour for attendance        |
| date              | DATE          | -                          | Attendance date            |
| status            | VARCHAR(10)   | CHECK                      | present/absent/late        |
| checkpoint_id     | INT           | REFERENCES checkpoints(id) | Checkpoint where marked    |
| verified_by       | INT           | REFERENCES users(id)       | Verifier (leader/guide)    |
| verification_time | TIMESTAMP     | -                          | When verified              |
| location_lat      | NUMERIC(10,8) | -                          | Location latitude          |
| location_lng      | NUMERIC(11,8) | -                          | Location longitude         |
| created_at        | TIMESTAMP     | DEFAULT NOW()              | Creation time              |

**Note:** Attendance records cannot be modified after 24 hours (enforced by database trigger).

**Relationships:**

- References one user
- References one tour
- Can reference one checkpoint
- Can be verified by a user

---

### 12. BUDGETS

| Column              | Type          | Constraints          | Description         |
| ------------------- | ------------- | -------------------- | ------------------- |
| id                  | SERIAL        | PRIMARY KEY          | Unique budget ID    |
| tour_id             | INT           | REFERENCES tours(id) | Associated tour     |
| total_amount        | NUMERIC(10,2) | NOT NULL             | Total budget        |
| spent_amount        | NUMERIC(10,2) | DEFAULT 0            | Amount spent        |
| per_participant_fee | NUMERIC(10,2) | DEFAULT 0            | Fee per participant |
| currency            | VARCHAR(3)    | DEFAULT 'USD'        | Currency code       |
| description         | TEXT          | -                    | Budget description  |
| created_at          | TIMESTAMP     | DEFAULT NOW()        | Creation time       |

**Relationships:**

- Belongs to one tour
- Has many expenses

---

### 13. EXPENSES

| Column      | Type          | Constraints          | Description                       |
| ----------- | ------------- | -------------------- | --------------------------------- |
| id          | SERIAL        | PRIMARY KEY          | Unique expense ID                 |
| tour_id     | INT           | REFERENCES tours(id) | Associated tour                   |
| amount      | NUMERIC(10,2) | NOT NULL             | Expense amount                    |
| category    | VARCHAR(20)   | CHECK                | TRANSPORT/ACCOMMODATION/FOOD/MISC |
| description | TEXT          | -                    | Expense description               |
| created_at  | TIMESTAMP     | DEFAULT NOW()        | Creation time                     |

**Relationships:**

- Belongs to one tour

---

### 14. SAFETY_PROTOCOLS

| Column      | Type         | Constraints          | Description              |
| ----------- | ------------ | -------------------- | ------------------------ |
| id          | SERIAL       | PRIMARY KEY          | Unique protocol ID       |
| tour_id     | INT          | REFERENCES tours(id) | Associated tour          |
| title       | VARCHAR(255) | NOT NULL             | Protocol title           |
| description | TEXT         | NOT NULL             | Protocol details         |
| severity    | VARCHAR(10)  | CHECK                | low/medium/high/critical |
| created_at  | TIMESTAMP    | DEFAULT NOW()        | Creation time            |

**Relationships:**

- Belongs to one tour

---

### 15. INCIDENTS

| Column           | Type         | Constraints          | Description                         |
| ---------------- | ------------ | -------------------- | ----------------------------------- |
| id               | SERIAL       | PRIMARY KEY          | Unique incident ID                  |
| tour_id          | INT          | REFERENCES tours(id) | Associated tour                     |
| reported_by      | INT          | REFERENCES users(id) | User who reported                   |
| title            | VARCHAR(255) | NOT NULL             | Incident title                      |
| description      | TEXT         | NOT NULL             | Incident details                    |
| location         | VARCHAR(255) | -                    | Incident location                   |
| severity         | VARCHAR(10)  | CHECK                | LOW/MEDIUM/HIGH/CRITICAL            |
| status           | VARCHAR(10)  | CHECK                | OPEN/IN_PROGRESS/RESOLVED           |
| incident_type    | VARCHAR(20)  | DEFAULT 'GENERAL'    | SOS/HEALTH/GENERAL                  |
| health_category  | VARCHAR(20)  | -                    | INJURY/ILLNESS/LOST/EMERGENCY/OTHER |
| responded_by     | INT          | REFERENCES users(id) | User who responded                  |
| response_time    | TIMESTAMP    | -                    | When response started               |
| resolution_notes | TEXT         | -                    | Resolution details                  |
| created_at       | TIMESTAMP    | DEFAULT NOW()        | Creation time                       |
| updated_at       | TIMESTAMP    | DEFAULT NOW()        | Last update time                    |

**Relationships:**

- Belongs to one tour
- Reported by one user
- Can be responded by one user

---

### 16. ITINERARIES

| Column      | Type         | Constraints                    | Description                               |
| ----------- | ------------ | ------------------------------ | ----------------------------------------- |
| id          | SERIAL       | PRIMARY KEY                    | Unique itinerary ID                       |
| tour_id     | INT          | NOT NULL, REFERENCES tours(id) | Parent tour                               |
| route_id    | INT          | REFERENCES routes(id)          | Associated route                          |
| date        | DATE         | NOT NULL                       | Itinerary date                            |
| title       | VARCHAR(255) | NOT NULL                       | Activity title                            |
| description | TEXT         | -                              | Activity description                      |
| start_time  | TIME         | -                              | Start time                                |
| end_time    | TIME         | -                              | End time                                  |
| status      | VARCHAR(20)  | CHECK                          | SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED |
| created_at  | TIMESTAMP    | DEFAULT NOW()                  | Creation time                             |
| updated_at  | TIMESTAMP    | DEFAULT NOW()                  | Last update time                          |

**Relationships:**

- Belongs to one tour
- Can follow one route

---

### 17. ACCOMMODATIONS

| Column         | Type         | Constraints                    | Description             |
| -------------- | ------------ | ------------------------------ | ----------------------- |
| id             | SERIAL       | PRIMARY KEY                    | Unique accommodation ID |
| tour_id        | INT          | NOT NULL, REFERENCES tours(id) | Parent tour             |
| name           | VARCHAR(255) | NOT NULL                       | Accommodation name      |
| address        | TEXT         | -                              | Full address            |
| check_in_date  | DATE         | -                              | Check-in date           |
| check_out_date | DATE         | -                              | Check-out date          |
| contact_number | VARCHAR(50)  | -                              | Contact phone           |
| created_at     | TIMESTAMP    | DEFAULT NOW()                  | Creation time           |
| updated_at     | TIMESTAMP    | DEFAULT NOW()                  | Last update time        |

**Relationships:**

- Belongs to one tour
- Has many room_assignments

---

### 18. ROOM_ASSIGNMENTS

| Column           | Type        | Constraints                             | Description          |
| ---------------- | ----------- | --------------------------------------- | -------------------- |
| id               | SERIAL      | PRIMARY KEY                             | Unique assignment ID |
| accommodation_id | INT         | NOT NULL, REFERENCES accommodations(id) | Parent accommodation |
| user_id          | INT         | NOT NULL, REFERENCES users(id)          | Assigned user        |
| room_number      | VARCHAR(50) | -                                       | Room number          |
| room_type        | VARCHAR(50) | -                                       | Room type            |
| notes            | TEXT        | -                                       | Additional notes     |
| created_at       | TIMESTAMP   | DEFAULT NOW()                           | Creation time        |
| updated_at       | TIMESTAMP   | DEFAULT NOW()                           | Last update time     |

**Unique Constraint:** (accommodation_id, user_id)

**Relationships:**

- Belongs to one accommodation
- Assigned to one user

---

### 19. TOUR_PHOTOS

| Column     | Type      | Constraints                    | Description      |
| ---------- | --------- | ------------------------------ | ---------------- |
| id         | SERIAL    | PRIMARY KEY                    | Unique photo ID  |
| tour_id    | INT       | NOT NULL, REFERENCES tours(id) | Parent tour      |
| user_id    | INT       | NOT NULL, REFERENCES users(id) | Uploader         |
| photo_url  | TEXT      | NOT NULL                       | Photo URL/path   |
| caption    | TEXT      | -                              | Photo caption    |
| created_at | TIMESTAMP | DEFAULT NOW()                  | Creation time    |
| updated_at | TIMESTAMP | DEFAULT NOW()                  | Last update time |

**Relationships:**

- Belongs to one tour
- Uploaded by one user

---

### 20. AUDIT_LOGS

| Column      | Type         | Constraints          | Description               |
| ----------- | ------------ | -------------------- | ------------------------- |
| id          | SERIAL       | PRIMARY KEY          | Unique log ID             |
| user_id     | INT          | REFERENCES users(id) | User who performed action |
| action      | VARCHAR(100) | NOT NULL             | Action performed          |
| entity_type | VARCHAR(50)  | NOT NULL             | Entity type (table name)  |
| entity_id   | INT          | NOT NULL             | Entity ID                 |
| old_values  | JSONB        | -                    | Previous values           |
| new_values  | JSONB        | -                    | New values                |
| ip_address  | VARCHAR(45)  | -                    | Client IP address         |
| user_agent  | TEXT         | -                    | Browser/User agent        |
| created_at  | TIMESTAMP    | DEFAULT NOW()        | Log creation time         |

**Relationships:**

- References one user (optional - some actions may be system-generated)

---

## Database Schema Diagram (Visual)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                TOUR MANAGEMENT SYSTEM                               │
│                                   DATABASE SCHEMA                                    │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌──────────────────┐
│      USERS       │       │      TOURS       │
├──────────────────┤       ├──────────────────┤
│ * id (PK)        │──┐    │ * id (PK)        │
│   email          │  │    │   name           │──┐
│   password_hash  │  │    │   description    │  │
│   name           │  │    │   start_date     │  │
│   role           │──┼◄───│   end_date       │  │
│   created_at     │  │    │   destination     │  │
└──────────────────┘  │    │   price          │  │
                      │    │   status         │  │
┌──────────────────┐  │    │ * created_by (FK)│  │
│   TOUR_USERS     │  │    │ * assigned_leader│◄─┤
├──────────────────┤  │    │   participant_cnt│  │
│ * id (PK)        │──┘    │   created_at     │  │
│ * tour_id (FK)   │       └──────────────────┘  │
│ * user_id (FK)   │              ▲               │
│   role           │              │               │
│   joined_at      │    ┌─────────┼─────────┐     │
└──────────────────┘    │         │         │     │
                        ▼         ▼         ▼     │
                  ┌──────────┐ ┌──────────┐ ┌──────────┐
                  │ANNOUNCE- │ │ BUDGETS  │ │INCIDENTS │
                  │MENTS     │ ├──────────┤ ├──────────┤
                  ├──────────┤ │ * id(PK) │ │ * id(PK) │
                  │ * id(PK) │ │ * tour_id│ │ * tour_id│
                  │   title  │ │ total_amt│ │ reported_│
                  │   content│ │ spent_amt│ │   by(FK) │
                  │ * tour_id│ │ currency │ │ title    │
                  │ created_ │ └──────────┘ │ desc     │
                  │   at     │      │       │ location │
                  └──────────┘      │       │ severity │
                        │          │       │ status   │
                        ▼          ▼       │ incident_│
                  ┌──────────┐ ┌────────┐   │   type   │
                  │ REPORT_  │ │EXPENSES│   │ health_  │
                  │FILES     │ ├────────┤   │ category │
                  ├──────────┤ │ * id   │   │ responded│
                  │ * id(PK) │ │ tour_id│   │_by(FK)   │
                  │announce_ │ │ amount │   │ response_│
                  │  id(FK)  │ │category│   │ time     │
                  │ filename │ │ desc   │   │ resolut_ │
                  │file_path │ └────────┘   │ notes    │
                  │ *uploaded│               └──────────┘
                  │_by(FK)   │                    │
                  └──────────┘                    ▼
                                         ┌──────────────┐
                                         │SAFETY_       │
                                         │PROTOCOLS     │
                                         ├──────────────┤
                                         │ * id (PK)    │
                                         │ * tour_id    │
                                         │   title      │
                                         │   desc       │
                                         │   severity   │
                                         └──────────────┘

┌────────────────────────────────────────────────────────────────────────────────────┐
│                           GEOGRAPHIC HIERARCHY                                      │
└────────────────────────────────────────────────────────────────────────────────────┘

       ┌──────────┐           ┌──────────┐           ┌──────────┐
       │  STATES  │           │  CITIES  │           │  PLACES  │
       ├──────────┤ 1      * ├──────────┤ 1      * ├──────────┤
       │ * id(PK) │──────────│ * id(PK) │──────────│ * id(PK) │
       │   name   │          │   name   │          │   name   │
       │   code   │          │* state_id│          │* city_id │
       └──────────┘          └──────────┘          │ latitude │
                                                    │ longitude│
                                                    │ category │
                                                    └──────────┘

┌────────────────────────────────────────────────────────────────────────────────────┐
│                           TOUR ITINERARY                                            │
└────────────────────────────────────────────────────────────────────────────────────┘

       ┌──────────┐ 1      * ┌──────────┐ 1      * ┌──────────┐
       │  TOURS   │─────────│ ITINERARIES│────────│  ROUTES  │
       └──────────┘          └──────────┘         ├──────────┤
                          │                        │ * id(PK) │
                          │                        │ * tour_id│
                          │                        │   name   │
                          │                        │   status │
                          │                        └──────────┘
                          │                              │
                          │                        * routes │
                          │                              │
                          ▼                        ┌──────────┐
                  ┌──────────┐                   │CHECKPOINTS│
                  │ ACCOMMOD │                   ├──────────┤
                  │ ATIONS   │                   │ * id(PK) │
                  ├──────────┤                   │* route_id│
                  │ * id(PK) │                   │* place_id│
                  │ * tour_id│                   │ sequence_│
                  │   name   │                   │   order  │
                  │  address │                   │ latitude │
                  │check_in │                   │ longitude│
                  │check_out│                   │ status   │
                  └─────────┬┘                   └──────────┘
                            │                         ▲
                      *     │                         │
                   ┌───────┴───────┐                  │
                   │ROOM_ASSIGNMTS │                  │
                   ├───────────────┤                  │
                   │ * id (PK)     │                  │
                   │* accommodation│                  │
                   │ * user_id (FK)│──────────────────┘
                   │ room_number   │
                   │ room_type     │
                   └───────────────┘

┌────────────────────────────────────────────────────────────────────────────────────┐
│                           ATTENDANCE & PHOTOS                                       │
└────────────────────────────────────────────────────────────────────────────────────┘

       ┌──────────┐ 1      * ┌──────────┐       ┌──────────┐
       │  TOURS   │─────────│ATTENDANCE│       │  ROUTES  │
       └──────────┘          ├──────────┤       └──────────┘
                            │ * id(PK) │             ▲
                            │* user_id │             │
                            │* tour_id │       * routes
                            │  date    │
                            │  status  │       ┌──────────┐
                            │* checkpoint│─────│CHECKPOINTS│
                            │ * verified│      └──────────┘
                            │_by(FK)   │
                            └──────────┘

       ┌──────────┐ 1      * ┌──────────┐
       │  TOURS   │─────────│  TOUR_   │
       └──────────┘          │  PHOTOS  │
                             ├──────────┤
                             │ * id(PK) │
                             │* tour_id │
                             │* user_id │
                             │ photo_url│
                             │ caption  │
                             └──────────┘

┌────────────────────────────────────────────────────────────────────────────────────┐
│                           AUDIT LOGGING                                             │
└────────────────────────────────────────────────────────────────────────────────────┘

       ┌──────────┐       ┌──────────┐
       │  USERS   │       │ AUDIT_   │
       │          │       │  LOGS    │
       └────┬─────┘       ├──────────┤
            │              │ * id(PK) │
      *     │             │* user_id │
      └─────┴─────────────│ action   │
                          │entity_type│
                          │ entity_id │
                          │ old_values│
                          │ new_values│
                          │ ip_address│
                          │user_agent │
                          │ created_at│
                          └──────────┘
```

---

## Key Relationships Summary

| Relationship                      | Type         | Description                          |
| --------------------------------- | ------------ | ------------------------------------ |
| USERS → TOURS                     | One-to-Many  | Users can create multiple tours      |
| USERS → TOUR_USERS                | Many-to-Many | Users can join multiple tours        |
| TOURS → TOUR_USERS                | One-to-Many  | Tours have multiple participants     |
| TOURS → ANNOUNCEMENTS             | One-to-Many  | Tours have multiple announcements    |
| TOURS → BUDGETS                   | One-to-One   | Each tour has one budget             |
| TOURS → EXPENSES                  | One-to-Many  | Tours have multiple expenses         |
| TOURS → INCIDENTS                 | One-to-Many  | Tours can have multiple incidents    |
| TOURS → ACCOMMODATIONS            | One-to-Many  | Tours use multiple accommodations    |
| STATES → CITIES                   | One-to-Many  | States contain multiple cities       |
| CITIES → PLACES                   | One-to-Many  | Cities contain multiple places       |
| ROUTES → CHECKPOINTS              | One-to-Many  | Routes have ordered checkpoints      |
| ACCOMMODATIONS → ROOM_ASSIGNMENTS | One-to-Many  | Accommodations have room assignments |
| USERS → AUDIT_LOGS                | One-to-Many  | Users generate audit logs            |

---

## Indexes Summary

| Table            | Index                              | Purpose                       |
| ---------------- | ---------------------------------- | ----------------------------- |
| tours            | idx_tours_status                   | Filter by status              |
| tours            | idx_tours_dates                    | Filter by date range          |
| attendance       | idx_attendance_tour_user           | Composite index for tour+user |
| attendance       | idx_attendance_checkpoint          | Filter by checkpoint          |
| budgets          | idx_budgets_tour                   | Filter by tour                |
| expenses         | idx_expenses_tour                  | Filter by tour                |
| incidents        | idx_incidents_tour                 | Filter by tour                |
| incidents        | idx_incidents_severity             | Filter by severity            |
| announcements    | idx_announcements_tour             | Filter by tour                |
| checkpoints      | idx_checkpoints_route              | Filter by route and order     |
| routes           | idx_routes_tour                    | Filter by tour                |
| itineraries      | idx_itineraries_tour               | Filter by tour                |
| audit_logs       | idx_audit_logs_user                | Filter by user                |
| audit_logs       | idx_audit_logs_entity              | Filter by entity              |
| tour_users       | idx_tour_users_tour                | Filter by tour                |
| tour_users       | idx_tour_users_user                | Filter by user                |
| accommodations   | idx_accommodations_tour            | Filter by tour                |
| room_assignments | idx_room_assignments_accommodation | Filter by accommodation       |
| room_assignments | idx_room_assignments_user          | Filter by user                |
| tour_photos      | idx_tour_photos_tour               | Filter by tour                |
| tour_photos      | idx_tour_photos_user               | Filter by user                |

---

_Generated for TourSync - Tour Management System_
