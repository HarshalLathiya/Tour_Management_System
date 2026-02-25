# Data Dictionary - Tour Management System

This document provides a comprehensive reference of all data entities, attributes, types, and relationships in the Tour Management System.

---

## 1. User Entity

### Description

Represents system users who can access the tour management platform. Users have different roles determining their permissions.

### Table: `users`

| Column        | Data Type | Constraints                         | Description                               |
| ------------- | --------- | ----------------------------------- | ----------------------------------------- |
| id            | INTEGER   | PRIMARY KEY, AUTOINCREMENT          | Unique user identifier                    |
| email         | TEXT      | UNIQUE, NOT NULL                    | User's email address (used for login)     |
| password_hash | TEXT      | NOT NULL                            | Bcrypt hashed password                    |
| name          | TEXT      | NOT NULL                            | User's full name                          |
| role          | TEXT      | NOT NULL, DEFAULT 'tourist'         | User role: 'admin', 'guide', or 'tourist' |
| created_at    | DATETIME  | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp                |

### Roles

| Role    | Description          | Permissions                                                    |
| ------- | -------------------- | -------------------------------------------------------------- |
| admin   | System Administrator | Full access to all features, user management, tour CRUD        |
| guide   | Tour Leader/Guide    | Manage assigned tours, verify attendance, respond to incidents |
| tourist | Regular User         | View tours, check-in, report incidents, view announcements     |

---

## 2. Tour Entity

### Description

Represents a tour trip with details about destination, dates, pricing, and status.

### Table: `tours`

| Column             | Data Type | Constraints                         | Description                                                 |
| ------------------ | --------- | ----------------------------------- | ----------------------------------------------------------- |
| id                 | INTEGER   | PRIMARY KEY, AUTOINCREMENT          | Unique tour identifier                                      |
| name               | TEXT      | NOT NULL                            | Tour name/title                                             |
| description        | TEXT      | NULLABLE                            | Detailed tour description                                   |
| start_date         | DATE      | NULLABLE                            | Tour start date                                             |
| end_date           | DATE      | NULLABLE                            | Tour end date                                               |
| destination        | TEXT      | NULLABLE                            | Tour destination location                                   |
| price              | REAL      | NULLABLE                            | Tour price per person                                       |
| status             | TEXT      | NOT NULL, DEFAULT 'planned'         | Tour status: 'planned', 'ongoing', 'completed', 'cancelled' |
| content            | TEXT      | NULLABLE                            | Additional tour content/markdown                            |
| assigned_leader_id | INTEGER   | NULLABLE, REFERENCES users(id)      | Guide assigned to lead the tour                             |
| leader_assigned_at | DATETIME  | NULLABLE                            | When leader was assigned                                    |
| participant_count  | INTEGER   | DEFAULT 0                           | Number of participants                                      |
| created_at         | DATETIME  | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Tour creation timestamp                                     |

### Status Values

| Status    | Description                          |
| --------- | ------------------------------------ |
| planned   | Tour is scheduled but hasn't started |
| ongoing   | Tour is currently active             |
| completed | Tour has ended                       |
| cancelled | Tour was cancelled                   |

---

## 3. Tour Participants Entity

### Description

Links users to tours for participation tracking.

### Table: `tour_users`

| Column     | Data Type | Constraints                    | Description            |
| ---------- | --------- | ------------------------------ | ---------------------- |
| id         | INTEGER   | PRIMARY KEY, AUTOINCREMENT     | Unique identifier      |
| tour_id    | INTEGER   | NOT NULL, REFERENCES tours(id) | Associated tour        |
| user_id    | INTEGER   | NOT NULL, REFERENCES users(id) | Participating user     |
| created_at | DATETIME  | DEFAULT CURRENT_TIMESTAMP      | Registration timestamp |

---

## 4. Attendance Entity

### Description

Tracks user check-in/check-out status for tours with location verification.

### Table: `attendance`

| Column            | Data Type | Constraints                          | Description                      |
| ----------------- | --------- | ------------------------------------ | -------------------------------- |
| id                | INTEGER   | PRIMARY KEY, AUTOINCREMENT           | Unique attendance record         |
| user_id           | INTEGER   | NOT NULL, REFERENCES users(id)       | User who checked in              |
| tour_id           | INTEGER   | NOT NULL, REFERENCES tours(id)       | Tour being attended              |
| date              | DATE      | NOT NULL                             | Date of attendance               |
| status            | TEXT      | NOT NULL                             | Attendance status                |
| checkpoint_id     | INTEGER   | NULLABLE, REFERENCES checkpoints(id) | Checkpoint where verified        |
| verified_by       | INTEGER   | NULLABLE, REFERENCES users(id)       | User who verified (leader/admin) |
| verification_time | DATETIME  | NULLABLE                             | When verification occurred       |
| location_lat      | REAL      | NULLABLE                             | Latitude of check-in location    |
| location_lng      | REAL      | NULLABLE                             | Longitude of check-in location   |
| created_at        | DATETIME  | DEFAULT CURRENT_TIMESTAMP            | Record creation time             |

### Status Values

| Status               | Description             |
| -------------------- | ----------------------- |
| present              | User attended           |
| absent               | User was absent         |
| late                 | User arrived late       |
| left_with_permission | User left with approval |

---

## 5. Incident Entity

### Description

Records incidents, emergencies, and safety issues during tours.

### Table: `incidents`

| Column           | Data Type | Constraints                    | Description                                |
| ---------------- | --------- | ------------------------------ | ------------------------------------------ |
| id               | INTEGER   | PRIMARY KEY, AUTOINCREMENT     | Unique incident identifier                 |
| tour_id          | INTEGER   | NOT NULL, REFERENCES tours(id) | Tour where incident occurred               |
| reported_by      | INTEGER   | NOT NULL, REFERENCES users(id) | User who reported                          |
| responded_by     | INTEGER   | NULLABLE, REFERENCES users(id) | User who responded                         |
| title            | TEXT      | NOT NULL                       | Incident title                             |
| description      | TEXT      | NULLABLE                       | Detailed incident description              |
| location         | TEXT      | NULLABLE                       | Where incident occurred                    |
| severity         | TEXT      | NOT NULL, DEFAULT 'LOW'        | Incident severity level                    |
| status           | TEXT      | NOT NULL, DEFAULT 'OPEN'       | Current incident status                    |
| incident_type    | TEXT      | NULLABLE                       | Type: 'SOS', 'HEALTH', 'GENERAL', 'SAFETY' |
| health_category  | TEXT      | NULLABLE                       | Health issue category                      |
| response_time    | DATETIME  | NULLABLE                       | When response began                        |
| resolution_notes | TEXT      | NULLABLE                       | Resolution details                         |
| created_at       | DATETIME  | DEFAULT CURRENT_TIMESTAMP      | Incident report time                       |
| updated_at       | DATETIME  | NULLABLE                       | Last update time                           |

### Severity Values

| Severity | Description                                |
| -------- | ------------------------------------------ |
| LOW      | Minor issue, no immediate action needed    |
| MEDIUM   | Moderate issue, requires attention         |
| HIGH     | Serious issue, requires prompt response    |
| CRITICAL | Emergency, requires immediate action (SOS) |

### Status Values

| Status      | Description                       |
| ----------- | --------------------------------- |
| OPEN        | Newly reported, awaiting response |
| IN_PROGRESS | Being handled by guide/admin      |
| RESOLVED    | Issue has been resolved           |

### Incident Types

| Type    | Description                        |
| ------- | ---------------------------------- |
| SOS     | Emergency alert - highest priority |
| HEALTH  | Health-related incident            |
| SAFETY  | Safety concern                     |
| GENERAL | General incident                   |

---

## 6. Accommodation Entity

### Description

Stores accommodation details for tours (hotels, hostels, etc.).

### Table: `accommodations`

| Column         | Data Type | Constraints                    | Description             |
| -------------- | --------- | ------------------------------ | ----------------------- |
| id             | INTEGER   | PRIMARY KEY, AUTOINCREMENT     | Unique accommodation ID |
| tour_id        | INTEGER   | NOT NULL, REFERENCES tours(id) | Associated tour         |
| name           | TEXT      | NOT NULL                       | Accommodation name      |
| address        | TEXT      | NULLABLE                       | Full address            |
| check_in_date  | DATE      | NULLABLE                       | Check-in date           |
| check_out_date | DATE      | NULLABLE                       | Check-out date          |
| contact_number | TEXT      | NULLABLE                       | Contact phone number    |
| created_at     | DATETIME  | DEFAULT CURRENT_TIMESTAMP      | Record creation time    |

---

## 7. Room Assignment Entity

### Description

Assigns participants to specific rooms in accommodations.

### Table: `room_assignments`

| Column           | Data Type | Constraints                             | Description                      |
| ---------------- | --------- | --------------------------------------- | -------------------------------- |
| id               | INTEGER   | PRIMARY KEY, AUTOINCREMENT              | Unique assignment ID             |
| accommodation_id | INTEGER   | NOT NULL, REFERENCES accommodations(id) | Associated accommodation         |
| user_id          | INTEGER   | NOT NULL, REFERENCES users(id)          | Assigned user                    |
| room_number      | TEXT      | NULLABLE                                | Room number                      |
| room_type        | TEXT      | NULLABLE                                | Room type (single, double, etc.) |
| notes            | TEXT      | NULLABLE                                | Additional notes                 |
| created_at       | DATETIME  | DEFAULT CURRENT_TIMESTAMP               | Assignment time                  |
| updated_at       | DATETIME  | NULLABLE                                | Last update time                 |

---

## 8. Announcement Entity

### Description

Public announcements for tours or the system.

### Table: `announcements`

| Column     | Data Type | Constraints                    | Description                       |
| ---------- | --------- | ------------------------------ | --------------------------------- |
| id         | INTEGER   | PRIMARY KEY, AUTOINCREMENT     | Unique announcement ID            |
| title      | TEXT      | NOT NULL                       | Announcement title                |
| content    | TEXT      | NOT NULL                       | Announcement content              |
| tour_id    | INTEGER   | NULLABLE, REFERENCES tours(id) | Associated tour (null for global) |
| created_at | DATETIME  | DEFAULT CURRENT_TIMESTAMP      | Publication time                  |

---

## 9. Itinerary Entity

### Description

Daily schedule and activities for tours.

### Table: `itineraries`

| Column      | Data Type | Constraints                     | Description          |
| ----------- | --------- | ------------------------------- | -------------------- |
| id          | INTEGER   | PRIMARY KEY, AUTOINCREMENT      | Unique itinerary ID  |
| tour_id     | INTEGER   | NOT NULL, REFERENCES tours(id)  | Associated tour      |
| route_id    | INTEGER   | NULLABLE, REFERENCES routes(id) | Associated route     |
| date        | DATE      | NOT NULL                        | Activity date        |
| title       | TEXT      | NOT NULL                        | Activity title       |
| description | TEXT      | NULLABLE                        | Activity description |
| start_time  | TIME      | NULLABLE                        | Start time           |
| end_time    | TIME      | NULLABLE                        | End time             |
| status      | TEXT      | DEFAULT 'SCHEDULED'             | Activity status      |
| created_at  | DATETIME  | DEFAULT CURRENT_TIMESTAMP       | Creation time        |
| updated_at  | DATETIME  | NULLABLE                        | Last update time     |

### Status Values

| Status      | Description         |
| ----------- | ------------------- |
| SCHEDULED   | Planned activity    |
| IN_PROGRESS | Currently happening |
| COMPLETED   | Activity finished   |
| CANCELLED   | Activity cancelled  |

---

## 10. Route Entity

### Description

Defines travel routes for tours.

### Table: `routes`

| Column      | Data Type | Constraints                    | Description       |
| ----------- | --------- | ------------------------------ | ----------------- |
| id          | INTEGER   | PRIMARY KEY, AUTOINCREMENT     | Unique route ID   |
| tour_id     | INTEGER   | NOT NULL, REFERENCES tours(id) | Associated tour   |
| name        | TEXT      | NOT NULL                       | Route name        |
| description | TEXT      | NULLABLE                       | Route description |
| created_at  | DATETIME  | DEFAULT CURRENT_TIMESTAMP      | Creation time     |

---

## 11. Checkpoint Entity

### Description

Checkpoints along routes for attendance and tracking.

### Table: `checkpoints`

| Column         | Data Type | Constraints                     | Description            |
| -------------- | --------- | ------------------------------- | ---------------------- |
| id             | INTEGER   | PRIMARY KEY, AUTOINCREMENT      | Unique checkpoint ID   |
| route_id       | INTEGER   | NOT NULL, REFERENCES routes(id) | Associated route       |
| place_id       | INTEGER   | NULLABLE, REFERENCES places(id) | Associated place       |
| name           | TEXT      | NOT NULL                        | Checkpoint name        |
| description    | TEXT      | NULLABLE                        | Checkpoint description |
| sequence_order | INTEGER   | NOT NULL                        | Order in route         |
| latitude       | REAL      | NULLABLE                        | Checkpoint latitude    |
| longitude      | REAL      | NULLABLE                        | Checkpoint longitude   |
| status         | TEXT      | DEFAULT 'PENDING'               | Checkpoint status      |
| created_at     | DATETIME  | DEFAULT CURRENT_TIMESTAMP       | Creation time          |

---

## 12. Place Entity

### Description

tourist destinations and points of interest.

### Table: `places`

| Column      | Data Type | Constraints                     | Description       |
| ----------- | --------- | ------------------------------- | ----------------- |
| id          | INTEGER   | PRIMARY KEY, AUTOINCREMENT      | Unique place ID   |
| name        | TEXT      | NOT NULL                        | Place name        |
| city_id     | INTEGER   | NOT NULL, REFERENCES cities(id) | Associated city   |
| latitude    | REAL      | NULLABLE                        | Place latitude    |
| longitude   | REAL      | NULLABLE                        | Place longitude   |
| description | TEXT      | NULLABLE                        | Place description |
| category    | TEXT      | NOT NULL                        | Place category    |
| created_at  | DATETIME  | DEFAULT CURRENT_TIMESTAMP       | Creation time     |

### Categories

| Category      | Description          |
| ------------- | -------------------- |
| HISTORICAL    | Historical sites     |
| NATURAL       | Natural attractions  |
| CULTURAL      | Cultural sites       |
| RELIGIOUS     | Religious places     |
| ENTERTAINMENT | Entertainment venues |
| OTHER         | Other attractions    |

---

## 13. City & State Entities

### Table: `states`

| Column     | Data Type | Constraints                | Description     |
| ---------- | --------- | -------------------------- | --------------- |
| id         | INTEGER   | PRIMARY KEY, AUTOINCREMENT | Unique state ID |
| name       | TEXT      | NOT NULL                   | State name      |
| code       | TEXT      | NULLABLE                   | State code      |
| created_at | DATETIME  | DEFAULT CURRENT_TIMESTAMP  | Creation time   |

### Table: `cities`

| Column     | Data Type | Constraints                     | Description      |
| ---------- | --------- | ------------------------------- | ---------------- |
| id         | INTEGER   | PRIMARY KEY, AUTOINCREMENT      | Unique city ID   |
| name       | TEXT      | NOT NULL                        | City name        |
| state_id   | INTEGER   | NOT NULL, REFERENCES states(id) | Associated state |
| created_at | DATETIME  | DEFAULT CURRENT_TIMESTAMP       | Creation time    |

---

## 14. Budget Entity

### Description

Financial tracking for tours.

### Table: `budgets`

| Column              | Data Type | Constraints                    | Description         |
| ------------------- | --------- | ------------------------------ | ------------------- |
| id                  | INTEGER   | PRIMARY KEY, AUTOINCREMENT     | Unique budget ID    |
| tour_id             | INTEGER   | NOT NULL, REFERENCES tours(id) | Associated tour     |
| total_amount        | REAL      | NOT NULL                       | Total budget amount |
| spent_amount        | REAL      | DEFAULT 0                      | Amount spent        |
| per_participant_fee | REAL      | NULLABLE                       | Fee per participant |
| currency            | TEXT      | DEFAULT 'USD'                  | Currency code       |
| description         | TEXT      | NULLABLE                       | Budget description  |
| created_at          | DATETIME  | DEFAULT CURRENT_TIMESTAMP      | Creation time       |

---

## 15. Expense Entity

### Description

Individual expenses within a tour budget.

### Table: `expenses`

| Column      | Data Type | Constraints                    | Description         |
| ----------- | --------- | ------------------------------ | ------------------- |
| id          | INTEGER   | PRIMARY KEY, AUTOINCREMENT     | Unique expense ID   |
| tour_id     | INTEGER   | NOT NULL, REFERENCES tours(id) | Associated tour     |
| amount      | REAL      | NOT NULL                       | Expense amount      |
| category    | TEXT      | NOT NULL                       | Expense category    |
| description | TEXT      | NULLABLE                       | Expense description |
| created_at  | DATETIME  | DEFAULT CURRENT_TIMESTAMP      | Creation time       |

---

## 16. Photo Entity

### Description

Photos uploaded for tours.

### Table: `tour_photos`

| Column     | Data Type | Constraints                    | Description                        |
| ---------- | --------- | ------------------------------ | ---------------------------------- |
| id         | INTEGER   | PRIMARY KEY, AUTOINCREMENT     | Unique photo ID                    |
| tour_id    | INTEGER   | NOT NULL, REFERENCES tours(id) | Associated tour                    |
| user_id    | INTEGER   | NOT NULL, REFERENCES users(id) | User who uploaded                  |
| photo_url  | TEXT      | NOT NULL                       | Photo URL (base64 or external URL) |
| caption    | TEXT      | NULLABLE                       | Photo caption                      |
| created_at | DATETIME  | DEFAULT CURRENT_TIMESTAMP      | Upload time                        |

---

## 17. Safety Protocol Entity

### Description

Safety protocols and guidelines for tours.

### Table: `safety_protocols`

| Column      | Data Type | Constraints                    | Description             |
| ----------- | --------- | ------------------------------ | ----------------------- |
| id          | INTEGER   | PRIMARY KEY, AUTOINCREMENT     | Unique protocol ID      |
| tour_id     | INTEGER   | NOT NULL, REFERENCES tours(id) | Associated tour         |
| title       | TEXT      | NOT NULL                       | Protocol title          |
| description | TEXT      | NOT NULL                       | Protocol description    |
| severity    | TEXT      | NOT NULL                       | Protocol severity level |
| created_at  | DATETIME  | DEFAULT CURRENT_TIMESTAMP      | Creation time           |

---

## 18. API Types (Frontend)

### TourData (from src/lib/api.ts)

```
typescript
interface TourData {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  destination?: string;
  price?: number | string;
  status: "planned" | "ongoing" | "completed" | "cancelled";
  content?: string;
  created_by?: number;
  created_at: string;
  assigned_leader_id?: number;
  leader_assigned_at?: string;
  participant_count?: number;
  leader_name?: string;
  leader_email?: string;
}
```

### UserData (from src/lib/api.ts)

```
typescript
interface UserData {
  id: number;
  email: string;
  name: string;
  role: "admin" | "guide" | "tourist";
  created_at: string;
}
```

### AttendanceData (from src/lib/api.ts)

```
typescript
interface AttendanceData {
  id: number;
  user_id: number;
  tour_id: number;
  date: string;
  status: "present" | "absent" | "late" | "left_with_permission";
  checkpoint_id?: number;
  verified_by?: number;
  verification_time?: string;
  location_lat?: number;
  location_lng?: number;
  created_at?: string;
  user_name?: string;
  user_email?: string;
}
```

### IncidentData (from src/lib/api.ts)

```
typescript
interface IncidentData {
  id: number;
  tour_id: number;
  reported_by?: number;
  title: string;
  description?: string;
  location?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "RESOLVED";
  created_at: string;
  updated_at?: string;
}
```

### AccommodationData (from src/lib/api.ts)

```
typescript
interface AccommodationData {
  id: number;
  tour_id: number;
  name: string;
  address?: string;
  check_in_date?: string;
  check_out_date?: string;
  contact_number?: string;
  created_at?: string;
}
```

### PhotoData (from src/lib/api.ts)

```
typescript
interface PhotoData {
  id: number;
  tour_id: number;
  user_id: number;
  photo_url: string;
  caption?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}
```

---

## 19. Entity Relationship Summary

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │       │    tours    │       │   tours    │
└──────┬──────┘       └──────┬──────┘       └──────┬──────┘
       │                    │                      │
       │ 1:N                │ 1:N                  │ 1:1
       ▼                    ▼                      ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ attendance  │       │  incidents  │       │ accommodations
│   (tour)    │       │   (tour)    │       │   (tour)    │
└─────────────┘       └─────────────┘       └──────┬──────┘
                                                   │
                                                   │ 1:N
                                                   ▼
                                            ┌─────────────┐
                                            │room_assign-
                                            │   ments     │
                                            └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  itineraries│       │   routes    │       │   budgets   │
│   (tour)    │       │   (tour)    │       │   (tour)    │
└─────────────┘       └──────┬──────┘       └─────────────┘
                              │
                              │ 1:N
                              ▼
                       ┌─────────────┐
                       │ checkpoints │
                       └─────────────┘
```

---

_Generated for Tour Management System - Next.js + Express Application_
