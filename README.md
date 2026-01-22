# 🌍 TourSync: Global Tour Management Simplified

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

**TourSync** is a comprehensive tour management platform designed for educational institutions and organizations to streamline on-ground execution, enhance safety coordination, and automate logistics for global tours.

---

## ✨ Key Features

### 📋 Smart Attendance Tracking
- **Geofenced Check-ins**: Ensure participants are at the right location during check-ins.
- **QR Code System**: Fast and secure check-ins via QR code scanning.
- **Automated Roll Calls**: Real-time visibility into participant attendance.
- **Offline Capability**: Synchronize data once back online.

### 🛡️ Advanced Safety & SOS
- **Instant SOS Alerts**: Real-time location sharing and alerts during emergencies.
- **Incident Reporting**: Comprehensive tracking of any incidents during the tour.
- **Emergency Contacts**: Quick access to vital participant information.

### 💰 Intelligent Budget Control
- **Expense Tracking**: Real-time recording and categorization of expenses.
- **Fund Allocation**: Manage budgets for different tour phases or activities.
- **Receipt Management**: Digital storage for all financial records.

### 🗺️ Tour & Itinerary Management
- **Detailed Itineraries**: Multi-day planning with location mapping.
- **Accommodation Management**: Track stays and manage room assignments.
- **Participant Profiles**: Centralized management of all travelers and staff.

### 📢 Communication & Audit
- **Announcements**: Broadcast important updates with acknowledgment tracking.
- **Audit Logs**: Transparent history of all critical actions and system changes.

---

## 🚀 Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/)
- **Icons**: [Lucide Icons](https://lucide.dev/)

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm / yarn / pnpm / bun
- A Supabase Project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/tour-management-system.git
   cd tour-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   DATABASE_URL=your_postgresql_connection_string
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the results.

---

## 📂 Project Structure

```text
src/
├── app/              # Next.js App Router (Pages & API)
├── components/       # Reusable UI components
├── lib/              # Utility functions and Supabase client
├── types/            # TypeScript type definitions
├── public/           # Static assets
└── ...
```

---

## 👨‍💻 Developed By

**Harshal Lathiya**  
*Full Stack Developer*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Support

For support, email support@toursync.com or join our Discord community.

---
Built with ❤️ for better travel experiences.
