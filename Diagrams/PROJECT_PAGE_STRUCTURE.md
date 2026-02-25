# Project Page Structure Diagram

## Overview

This document provides a comprehensive visual representation of the Tour Management System's page structure, organized by routing hierarchy.

---

## 1. Root Level Pages

```
src/app/
├── page.tsx                    # Landing/Home Page
├── layout.tsx                  # Root Layout
├── globals.css                # Global Styles
├── auth/                      # Authentication Routes
│   ├── login/
│   │   └── page.tsx          # /auth/login
│   ├── register/
│   │   └── page.tsx          # /auth/register
│   ├── forgot-password/
│   │   ├── page.tsx          # /auth/forgot-password
│   │   └── actions.ts        # Server Actions
│   ├── verify-email/
│   │   └── page.tsx          # /auth/verify-email
│   └── update-password/
│       └── page.tsx          # /auth/update-password
│
└── dashboard/                 # Protected Dashboard Routes
    ├── layout.tsx            # Dashboard Layout (with Sidebar)
    ├── page.tsx              # /dashboard (Dashboard Home)
    ├── dashboard-client.tsx  # Dashboard Client Component
    ├── dashboard-client-new.tsx
    │
    ├── profile/
    │   ├── page.tsx          # /dashboard/profile
    │   ├── profile-client.tsx
    │   └── actions.ts        # Profile Actions
    │
    ├── tours/
    │   ├── page.tsx          # /dashboard/tours (List)
    │   ├── tours-client.tsx  # Tours List Component
    │   ├── new/
    │   │   └── page.tsx      # /dashboard/tours/new (Create)
    │   └── [id]/
    │       └── page.tsx      # /dashboard/tours/[id] (Detail)
    │
    ├── attendance/
    │   ├── page.tsx          # /dashboard/attendance
    │   └── checkin/
    │       └── page.tsx      # /dashboard/attendance/checkin
    │
    ├── announcements/
    │   └── page.tsx          # /dashboard/announcements
    │
    ├── budget/
    │   └── page.tsx          # /dashboard/budget
    │
    ├── safety/
    │   └── page.tsx          # /dashboard/safety
    │
    └── audit-logs/
        └── page.tsx          # /dashboard/audit-logs
```

---

## 2. Page Hierarchy Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ROOT (/)                                 │
│                   (src/app/page.tsx)                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│    /auth/*          │         │   /dashboard/*      │
│  (Auth Pages)       │         │ (Protected Routes)  │
└─────────────────────┘         └──────────┬──────────┘
                                           │
        ┌──────────────────────────────────┼──────────────────┐
        │                                  │                  │
        ▼                                  ▼                  ▼
┌───────────────┐              ┌─────────────────┐    ┌──────────────┐
│ /login        │              │ /profile        │    │ /tours       │
│ /register     │              │ /tours          │    │ /tours/new   │
│ /forgot-pass  │              │ /tours/[id]     │    │ /attendance  │
│ /verify-email │              │ /attendance     │    │ /announce-   │
│ /update-pass  │              │ /announcements  │    │   ments       │
└───────────────┘              │ /budget         │    │ /budget       │
                               │ /safety         │    │ /safety       │
                               │ /audit-logs     │    │ /audit-logs   │
                               └─────────────────┘    └──────────────┘
```

---

## 3. Component Structure

```
src/components/
├── ui/                          # UI Components (Shadcn)
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── progress.tsx
│   ├── select.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   └── toaster.tsx
│
├── features/                    # Feature-Specific Components
│   ├── AuthLayout.tsx
│   ├── ErrorMessage.tsx
│   ├── FormInput.tsx
│   ├── LoadingSpinner.tsx
│   └── PageHeader.tsx
│
├── tours/                       # Tour-Related Components
│
├── Sidebar.tsx                 # Dashboard Sidebar
├── BackButton.tsx              # Navigation Button
├── DashboardStats.tsx          # Statistics Display
├── LeaderAssignment.tsx        # Tour Leader Management
├── SOSButton.tsx               # Emergency Button
├── accommodation-manager.tsx   # Accommodation Management
├── document-vault.tsx          # Document Storage
└── photo-gallery.tsx           # Photo Gallery
```

---

## 4. Server API Routes (Backend)

```
server/
├── routes/                      # API Endpoints
│   ├── auth.ts                 # POST /api/auth/*
│   ├── tours.ts                # CRUD /api/tours/*
│   ├── attendance.ts           # /api/attendance/*
│   ├── announcements.ts        # /api/announcements/*
│   ├── budgets.ts               # /api/budgets/*
│   ├── expenses.ts             # /api/expenses/*
│   ├── incidents.ts            # /api/incidents/*
│   ├── itineraries.ts          # /api/itineraries/*
│   ├── locations.ts            # /api/locations/*
│   ├── notifications.ts        # /api/notifications/*
│   ├── photos.ts               # /api/photos/*
│   ├── accommodations.ts        # /api/accommodations/*
│   ├── auditLogs.ts            # /api/audit-logs/*
│   └── safety.ts               # /api/safety/*
│
├── controllers/                # Request Handlers
│   ├── auth.controller.ts
│   ├── tour.controller.ts
│   ├── attendance.controller.ts
│   ├── accommodation.controller.ts
│   ├── incident.controller.ts
│   └── photo.controller.ts
│
├── models/                     # Database Models
│   ├── User.model.ts
│   ├── Tour.model.ts
│   ├── Attendance.model.ts
│   ├── Incident.model.ts
│   ├── Accommodation.model.ts
│   ├── Photo.model.ts
│   ├── Announcement.model.ts
│   ├── Budget.model.ts
│   ├── Itinerary.model.ts
│   └── Location.model.ts
│
├── middleware/                 # Express Middleware
│   ├── auth.ts                # Authentication
│   ├── validation.ts          # Input Validation
│   ├── rateLimiter.ts          # Rate Limiting
│   └── errorHandler.ts         # Error Handling
│
└── services/                   # Business Logic
    └── notification.service.ts
```

---

## 5. Routing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     REQUEST FLOW                               │
└─────────────────────────────────────────────────────────────────┘

User Request
     │
     ▼
┌─────────────────┐
│  Next.js Router │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
/auth/*   /dashboard/*
    │         │
    │    ┌────┴─────────────────────────────┐
    │    │                                  │
    ▼    ▼                                  ▼
Client   API Routes                     Server API
Pages    (/api/*)                       (Express)
    │    │                              │
    ▼    ▼                              ▼
 Auth   DB                          Database
Check  Operations                    (SQLite)
```

---

## 6. Key Routes Summary

| Route                      | File                                       | Description         |
| -------------------------- | ------------------------------------------ | ------------------- |
| `/`                        | `src/app/page.tsx`                         | Landing page        |
| `/auth/login`              | `src/app/auth/login/page.tsx`              | User login          |
| `/auth/register`           | `src/app/auth/register/page.tsx`           | User registration   |
| `/dashboard`               | `src/app/dashboard/page.tsx`               | Main dashboard      |
| `/dashboard/tours`         | `src/app/dashboard/tours/page.tsx`         | Tour list           |
| `/dashboard/tours/new`     | `src/app/dashboard/tours/new/page.tsx`     | Create tour         |
| `/dashboard/tours/[id]`    | `src/app/dashboard/tours/[id]/page.tsx`    | Tour details        |
| `/dashboard/attendance`    | `src/app/dashboard/attendance/page.tsx`    | Attendance tracking |
| `/dashboard/announcements` | `src/app/dashboard/announcements/page.tsx` | Announcements       |
| `/dashboard/budget`        | `src/app/dashboard/budget/page.tsx`        | Budget management   |
| `/dashboard/safety`        | `src/app/dashboard/safety/page.tsx`        | Safety features     |
| `/dashboard/profile`       | `src/app/dashboard/profile/page.tsx`       | User profile        |

---

## 7. File Organization Summary

```
Tour_Management_System/
├── src/                         # Frontend (Next.js)
│   ├── app/                    # App Router Pages
│   ├── components/            # React Components
│   ├── lib/                   # Utilities (API, utils)
│   ├── context/               # React Context
│   ├── hooks/                 # Custom Hooks
│   ├── types/                 # TypeScript Types
│   └── config/                # Configuration
│
├── server/                     # Backend (Express)
│   ├── routes/                # API Routes
│   ├── controllers/           # Controllers
│   ├── models/                # Database Models
│   ├── middleware/            # Middleware
│   ├── services/              # Services
│   ├── types/                 # TypeScript Types
│   └── utils/                 # Utilities
│
├── public/                     # Static Assets
│
└── Documentation Files
    ├── PROJECT_PAGE_STRUCTURE.md    # This file
    ├── USE_CASE_DIAGRAM.md
    ├── ACTIVITY_DIAGRAM.md
    ├── DFD_DIAGRAM.md
    └── ER_DIAGRAM.md
```

---

_Generated for Tour Management System - Next.js + Express Application_
