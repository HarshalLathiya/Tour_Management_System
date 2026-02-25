# TourSync - Use Case Diagram

This document contains the Use Case Diagram for the Tour Management System, showing all actors and their interactions with the system.

---

## System Overview

The TourSync system involves three main user roles:

| Role        | Description                                                                     |
| ----------- | ------------------------------------------------------------------------------- |
| **Admin**   | Full system access, manages tours, users, budgets, and system settings          |
| **Guide**   | Leads tours, manages attendance, handles incidents, creates announcements       |
| **Tourist** | Participates in tours, marks attendance, reports incidents, views announcements |

---

## Use Case Diagram

```
mermaid
flowchart TB
    subgraph Actors
        Admin["👤 Admin"]
        Guide["👤 Guide"]
        Tourist["👤 Tourist"]
        System["⚙️ System"]
    end

    subgraph Authentication
        UC1["Register Account"]
        UC2["Login"]
        UC3["Logout"]
        UC4["Refresh Token"]
        UC5["Change Password"]
        UC6["Update Profile"]
    end

    subgraph TourManagement
        UC7["View Tours"]
        UC8["Create Tour"]
        UC9["Edit Tour"]
        UC10["Delete Tour"]
        UC11["Assign Leader"]
        UC12["Unassign Leader"]
        UC13["Join Tour"]
        UC14["Leave Tour"]
        UC15["View Tour Details"]
    end

    subgraph Attendance
        UC16["View Attendance"]
        UC17["Check-in"]
        UC18["Verify Attendance"]
        UC19["View Attendance History"]
    end

    subgraph Safety
        UC20["View Incidents"]
        UC21["Report Incident"]
        UC22["Trigger SOS"]
        UC23["Report Health Issue"]
        UC24["Respond to Incident"]
        UC25["Resolve Incident"]
        UC26["View Safety Protocols"]
    end

    subgraph Budget
        UC27["View Budget"]
        UC28["Create Budget"]
        UC29["Update Budget"]
        UC30["Delete Budget"]
        UC31["Add Expense"]
        UC32["View Expenses"]
    end

    subgraph Announcements
        UC33["View Announcements"]
        UC34["Create Announcement"]
        UC35["Edit Announcement"]
        UC36["Delete Announcement"]
    end

    subgraph Accommodation
        UC37["View Accommodations"]
        UC38["Manage Accommodations"]
        UC39["Assign Rooms"]
    end

    subgraph Itinerary
        UC40["View Itinerary"]
        UC41["Manage Itinerary"]
    end

    subgraph Photos
        UC42["View Photos"]
        UC43["Upload Photo"]
    end

    subgraph Audit
        UC44["View Audit Logs"]
    end

    %% Actor to Use Case Connections
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC15
    Admin --> UC16
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20
    Admin --> UC24
    Admin --> UC25
    Admin --> UC26
    Admin --> UC27
    Admin --> UC28
    Admin --> UC29
    Admin --> UC30
    Admin --> UC31
    Admin --> UC32
    Admin --> UC33
    Admin --> UC34
    Admin --> UC35
    Admin --> UC36
    Admin --> UC37
    Admin --> UC38
    Admin --> UC39
    Admin --> UC40
    Admin --> UC41
    Admin --> UC42
    Admin --> UC43
    Admin --> UC44

    Guide --> UC2
    Guide --> UC3
    Guide --> UC5
    Guide --> UC6
    Guide --> UC7
    Guide --> UC15
    Guide --> UC16
    Guide --> UC17
    Guide --> UC18
    Guide --> UC19
    Guide --> UC20
    Guide --> UC21
    Guide --> UC22
    Guide --> UC23
    Guide --> UC24
    Guide --> UC25
    Guide --> UC26
    Guide --> UC27
    Guide --> UC32
    Guide --> UC33
    Guide --> UC34
    Guide --> UC35
    Guide --> UC36
    Guide --> UC37
    Guide --> UC40
    Guide --> UC42

    Tourist --> UC2
    Tourist --> UC3
    Tourist --> UC5
    Tourist --> UC6
    Tourist --> UC7
    Tourist --> UC13
    Tourist --> UC14
    Tourist --> UC15
    Tourist --> UC16
    Tourist --> UC17
    Tourist --> UC19
    Tourist --> UC20
    Tourist --> UC21
    Tourist --> UC22
    Tourist --> UC23
    Tourist --> UC26
    Tourist --> UC33
    Tourist --> UC37
    Tourist --> UC40
    Tourist --> UC42
    Tourist --> UC43

    System --> UC4
```

---

## Detailed Use Case Descriptions

### 1. Authentication Module

| Use Case             | Actor  | Description                                 |
| -------------------- | ------ | ------------------------------------------- |
| **Register Account** | Admin  | Create a new user account in the system     |
| **Login**            | All    | Authenticate user with email and password   |
| **Logout**           | All    | End user session and clear tokens           |
| **Refresh Token**    | System | Automatically refresh expired access tokens |
| **Change Password**  | All    | Update user password                        |
| **Update Profile**   | All    | Modify user profile information             |

---

### 2. Tour Management Module

| Use Case              | Actor   | Description                         |
| --------------------- | ------- | ----------------------------------- |
| **View Tours**        | All     | Browse and search available tours   |
| **Create Tour**       | Admin   | Create a new tour with details      |
| **Edit Tour**         | Admin   | Modify existing tour information    |
| **Delete Tour**       | Admin   | Remove a tour from the system       |
| **Assign Leader**     | Admin   | Assign a guide to lead a tour       |
| **Unassign Leader**   | Admin   | Remove guide assignment from tour   |
| **Join Tour**         | Tourist | Register to participate in a tour   |
| **Leave Tour**        | Tourist | Cancel tour participation           |
| **View Tour Details** | All     | View comprehensive tour information |

---

### 3. Attendance Module

| Use Case                    | Actor       | Description                                |
| --------------------------- | ----------- | ------------------------------------------ |
| **View Attendance**         | All         | See attendance records for a tour          |
| **Check-in**                | Tourist     | Mark attendance with location verification |
| **Verify Attendance**       | Guide/Admin | Confirm attendance marked by participants  |
| **View Attendance History** | All         | View past attendance records               |

---

### 4. Safety & Incident Module

| Use Case                  | Actor         | Description                         |
| ------------------------- | ------------- | ----------------------------------- |
| **View Incidents**        | All           | See all incidents for a tour        |
| **Report Incident**       | Tourist/Guide | Submit a general incident report    |
| **Trigger SOS**           | Tourist       | One-click emergency alert           |
| **Report Health Issue**   | Tourist       | Report health-related concern       |
| **Respond to Incident**   | Guide/Admin   | Acknowledge and respond to incident |
| **Resolve Incident**      | Guide/Admin   | Mark incident as resolved           |
| **View Safety Protocols** | All           | View safety guidelines for tour     |

---

### 5. Budget Management Module

| Use Case          | Actor       | Description                      |
| ----------------- | ----------- | -------------------------------- |
| **View Budget**   | Admin/Guide | See budget details for a tour    |
| **Create Budget** | Admin       | Set up budget for a tour         |
| **Update Budget** | Admin       | Modify budget amounts            |
| **Delete Budget** | Admin       | Remove budget from tour          |
| **Add Expense**   | Admin       | Record an expense against budget |
| **View Expenses** | Admin/Guide | See all expenses for a tour      |

---

### 6. Announcement Module

| Use Case                | Actor       | Description                      |
| ----------------------- | ----------- | -------------------------------- |
| **View Announcements**  | All         | See all announcements for a tour |
| **Create Announcement** | Guide/Admin | Post a new announcement          |
| **Edit Announcement**   | Guide/Admin | Modify existing announcement     |
| **Delete Announcement** | Guide/Admin | Remove an announcement           |

---

### 7. Accommodation Module

| Use Case                  | Actor | Description                        |
| ------------------------- | ----- | ---------------------------------- |
| **View Accommodations**   | All   | See accommodation details for tour |
| **Manage Accommodations** | Admin | Add/edit/remove accommodations     |
| **Assign Rooms**          | Admin | Assign participants to rooms       |

---

### 8. Itinerary Module

| Use Case             | Actor | Description                |
| -------------------- | ----- | -------------------------- |
| **View Itinerary**   | All   | See daily tour schedule    |
| **Manage Itinerary** | Admin | Create/edit tour itinerary |

---

### 9. Photo Gallery Module

| Use Case         | Actor   | Description            |
| ---------------- | ------- | ---------------------- |
| **View Photos**  | All     | Browse tour photos     |
| **Upload Photo** | Tourist | Share photos from tour |

---

### 10. Audit Module

| Use Case            | Actor | Description               |
| ------------------- | ----- | ------------------------- |
| **View Audit Logs** | Admin | View system activity logs |

---

## Use Case Summary by Actor

### Admin Use Cases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ADMIN USE CASES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ Authentication                                                               │
│   ✓ Register Account                                                        │
│   ✓ Login                                                                   │
│   ✓ Logout                                                                  │
│   ✓ Change Password                                                         │
│   ✓ Update Profile                                                          │
│                                                                             │
│ Tour Management                                                              │
│   ✓ View Tours                                                              │
│   ✓ Create Tour                                                             │
│   ✓ Edit Tour                                                               │
│   ✓ Delete Tour                                                             │
│   ✓ Assign Leader                                                           │
│   ✓ Unassign Leader                                                         │
│   ✓ View Tour Details                                                       │
│                                                                             │
│ Attendance                                                                   │
│   ✓ View Attendance                                                         │
│   ✓ Verify Attendance                                                       │
│   ✓ View Attendance History                                                 │
│                                                                             │
│ Safety & Incidents                                                           │
│   ✓ View Incidents                                                          │
│   ✓ Respond to Incident                                                     │
│   ✓ Resolve Incident                                                        │
│   ✓ View Safety Protocols                                                   │
│                                                                             │
│ Budget Management                                                            │
│   ✓ View Budget                                                             │
│   ✓ Create Budget                                                           │
│   ✓ Update Budget                                                           │
│   ✓ Delete Budget                                                           │
│   ✓ Add Expense                                                             │
│   ✓ View Expenses                                                           │
│                                                                             │
│ Announcements                                                                │
│   ✓ View Announcements                                                      │
│   ✓ Create Announcement                                                     │
│   ✓ Edit Announcement                                                       │
│   ✓ Delete Announcement                                                     │
│                                                                             │
│ Accommodation                                                                 │
│   ✓ View Accommodations                                                     │
│   ✓ Manage Accommodations                                                   │
│   ✓ Assign Rooms                                                             │
│                                                                             │
│ Itinerary                                                                     │
│   ✓ View Itinerary                                                          │
│   ✓ Manage Itinerary                                                        │
│                                                                             │
│ Photos                                                                        │
│   ✓ View Photos                                                             │
│   ✓ Upload Photo                                                            │
│                                                                             │
│ Audit                                                                         │
│   ✓ View Audit Logs                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Guide Use Cases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              GUIDE USE CASES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ Authentication                                                               │
│   ✓ Login                                                                   │
│   ✓ Logout                                                                  │
│   ✓ Change Password                                                         │
│   ✓ Update Profile                                                          │
│                                                                             │
│ Tour Management                                                              │
│   ✓ View Tours                                                              │
│   ✓ View Tour Details                                                       │
│                                                                             │
│ Attendance                                                                   │
│   ✓ View Attendance                                                         │
│   ✓ Check-in                                                                │
│   ✓ Verify Attendance                                                       │
│   ✓ View Attendance History                                                 │
│                                                                             │
│ Safety & Incidents                                                           │
│   ✓ View Incidents                                                          │
│   ✓ Report Incident                                                         │
│   ✓ Trigger SOS                                                             │
│   ✓ Report Health Issue                                                     │
│   ✓ Respond to Incident                                                      │
│   ✓ Resolve Incident                                                        │
│   ✓ View Safety Protocols                                                   │
│                                                                             │
│ Budget Management                                                            │
│   ✓ View Budget                                                             │
│   ✓ View Expenses                                                           │
│                                                                             │
│ Announcements                                                                │
│   ✓ View Announcements                                                      │
│   ✓ Create Announcement                                                     │
│   ✓ Edit Announcement                                                       │
│   ✓ Delete Announcement                                                     │
│                                                                             │
│ Accommodation                                                                 │
│   ✓ View Accommodations                                                     │
│                                                                             │
│ Itinerary                                                                     │
│   ✓ View Itinerary                                                          │
│                                                                             │
│ Photos                                                                        │
│   ✓ View Photos                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tourist Use Cases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             TOURIST USE CASES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ Authentication                                                               │
│   ✓ Login                                                                   │
│   ✓ Logout                                                                  │
│   ✓ Change Password                                                         │
│   ✓ Update Profile                                                          │
│                                                                             │
│ Tour Management                                                              │
│   ✓ View Tours                                                              │
│   ✓ Join Tour                                                               │
│   ✓ Leave Tour                                                              │
│   ✓ View Tour Details                                                       │
│                                                                             │
│ Attendance                                                                   │
│   ✓ View Attendance                                                         │
│   ✓ Check-in                                                                │
│   ✓ View Attendance History                                                 │
│                                                                             │
│ Safety & Incidents                                                           │
│   ✓ View Incidents                                                          │
│   ✓ Report Incident                                                         │
│   ✓ Trigger SOS                                                             │
│   ✓ Report Health Issue                                                     │
│   ✓ View Safety Protocols                                                   │
│                                                                             │
│ Announcements                                                                │
│   ✓ View Announcements                                                      │
│                                                                             │
│ Accommodation                                                                 │
│   ✓ View Accommodations                                                     │
│                                                                             │
│ Itinerary                                                                     │
│   ✓ View Itinerary                                                          │
│                                                                             │
│ Photos                                                                        │
│   ✓ View Photos                                                             │
│   ✓ Upload Photo                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Use Case Relationships

### Include Relationships

```
mermaid
flowchart LR
    UC1["Check-in"] -->|"include"| UC2["Verify Location"]
    UC3["Create Tour"] -->|"include"| UC4["Validate Data"]
    UC5["Add Expense"] -->|"include"| UC6["Update Budget"]
    UC7["Trigger SOS"] -->|"include"| UC8["Notify Admins"]
```

### Extend Relationships

```
mermaid
flowchart LR
    UC1["Report Incident"] -->|"extend"| UC2["Trigger SOS"]
    UC1 -->|"extend"| UC3["Report Health Issue"]
```

---

## System Boundaries

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                          TOUR MANAGEMENT SYSTEM                                 │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                         EXTERNAL ACTORS                                   │  │
│  │                                                                           │  │
│  │   ┌─────────┐     ┌─────────┐     ┌─────────┐                          │  │
│  │   │  Admin  │     │  Guide  │     │ Tourist │                          │  │
│  │   └────┬────┘     └────┬────┘     └────┬────┘                          │  │
│  │        │               │               │                                │  │
│  │        └───────────────┼───────────────┘                                │  │
│  │                        │                                                  │  │
│  └────────────────────────┼────────────────────────────────────────────────┘  │
│                           │                                                    │
│  ┌────────────────────────┼────────────────────────────────────────────────┐  │
│  │                        ▼                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      USE CASES                                   │  │  │
│  │  │                                                                   │  │  │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │  │  │
│  │  │  │  Authenti-  │ │    Tour     │ │ Attendance  │ │  Safety   │ │  │  │
│  │  │  │   cation    │ │ Management  │ │             │ │           │ │  │  │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │  │  │
│  │  │                                                                   │  │  │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │  │  │
│  │  │  │   Budget    │ │Announce-    │ │Accommo-     │ │ Itinerary │ │  │  │
│  │  │  │             │ │   ments     │ │   dation    │ │           │ │  │  │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │  │  │
│  │  │                                                                   │  │  │
│  │  │  ┌─────────────┐ ┌─────────────┐                               │  │  │
│  │  │  │   Photos    │ │    Audit    │                               │  │  │
│  │  │  └─────────────┘ └─────────────┘                               │  │  │
│  │  │                                                                   │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                      DATABASE (BACKEND)                                   │  │
│  │                                                                           │  │
│  │   20 Tables with relationships as defined in ER Diagram                  │  │
│  │                                                                           │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## Use Case Diagram (Simplified View)

```
mermaid
graph LR
    subgraph Actors
        A[Admin]
        G[Guide]
        T[Tourist]
    end

    subgraph UseCases
        Auth[Authentication]
        Tours[Tour Management]
        Attend[Attendance]
        Safety[Safety & Incidents]
        Budget[Budget Management]
        Announce[Announcements]
        Accom[Accommodation]
        Itin[Itinerary]
        Photos[Photos]
        Audit[Audit Logs]
    end

    A --> Auth
    A --> Tours
    A --> Budget
    A --> Accom
    A --> Itin
    A --> Audit
    A --> Announce

    G --> Auth
    G --> Tours
    G --> Attend
    G --> Safety
    G --> Budget
    G --> Announce
    G --> Accom
    G --> Itin

    T --> Auth
    T --> Tours
    T --> Attend
    T --> Safety
    T --> Announce
    T --> Accom
    T --> Itin
    T --> Photos

    Tours --> Attend
    Tours --> Safety
    Tours --> Budget
    Tours --> Announce
    Tours --> Accom
    Tours --> Itin
    Tours --> Photos
```

---

_Generated for TourSync - Tour Management System_
