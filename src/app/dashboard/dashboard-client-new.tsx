"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  MapPin,
  Calendar,
  DollarSign,
  ClipboardCheck,
  AlertTriangle,
  Search,
  Clock,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Organization, Tour } from "@/types";

/* ---------- STRICT ROLE TYPE ---------- */

export type UserRole = "org_admin" | "super_admin" | "tour_leader" | "participant";

interface ExtendedTour extends Tour {
  organizations: { name: string } | null;
  startDate?: Date | string;
  incidents?: { resolved: boolean; severity: "low" | "medium" | "high" }[];
  payments?: { amount: number; status: "paid" | "pending" }[];
  attendanceRecords?: { present: boolean }[];
}

interface DashboardClientProps {
  organizations: Organization[];
  tours: ExtendedTour[];
  userRole: UserRole | null;
}

/* ---------- STATUS MAPS ---------- */

const statusColors = {
  draft: "bg-slate-100 text-slate-700",
  planned: "bg-blue-100 text-blue-700",
  active: "bg-emerald-600 text-white",
  completed: "bg-purple-600 text-white",
  cancelled: "bg-red-600 text-white",
};

const statusIcons = {
  draft: <Clock className="h-4 w-4" />,
  planned: <Calendar className="h-4 w-4" />,
  active: <MapPin className="h-4 w-4" />,
  completed: <ClipboardCheck className="h-4 w-4" />,
  cancelled: <AlertTriangle className="h-4 w-4" />,
};

/* ---------- HELPER FUNCTIONS ---------- */

function calculateDaysLeft(date?: string | Date) {
  if (!date) return null;
  const diff = new Date(date).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function calculateAttendanceRate(records?: { present: boolean }[]) {
  if (!records || records.length === 0) return 0;
  const present = records.filter((r) => r.present).length;
  return Math.round((present / records.length) * 100);
}

/* ======================================================= */

export function DashboardClient({ organizations, tours, userRole }: DashboardClientProps) {
  if (userRole === "org_admin" || userRole === "super_admin") {
    return <OrganizationAdminDashboard organizations={organizations} tours={tours} />;
  }

  if (userRole === "tour_leader") {
    return <LeaderDashboard tours={tours} />;
  }

  if (userRole === "participant") {
    return <ParticipantDashboard tours={tours} />;
  }

  return <div className="p-10 text-red-600">Access denied.</div>;
}

/* ======================================================= */
/* ================= ADMIN DASHBOARD ===================== */
/* ======================================================= */

function OrganizationAdminDashboard({
  tours,
}: {
  organizations: Organization[];
  tours: ExtendedTour[];
}): import("react").JSX.Element {
  const [search, setSearch] = useState("");

  const filteredTours = useMemo(() => {
    return tours.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, tours]);

  /* ----- REAL DERIVED STATS ----- */

  const totalRevenue = useMemo(() => {
    return tours.reduce((sum, tour) => {
      const paid = tour.payments?.filter((p) => p.status === "paid") || [];
      return sum + paid.reduce((s, p) => s + p.amount, 0);
    }, 0);
  }, [tours]);

  const activeTours = tours.filter((t) => t.status === "active");
  const unresolvedIncidents = tours.reduce((sum, tour) => {
    const unresolved = tour.incidents?.filter((i) => !i.resolved).length || 0;
    return sum + unresolved;
  }, 0);

  const attendanceRate = useMemo(() => {
    const allRecords = tours.flatMap((t) => t.attendanceRecords || []);
    return calculateAttendanceRate(allRecords);
  }, [tours]);

  const systemHealth = 100 - unresolvedIncidents * 5;

  /* ----- STATS ARRAY ----- */

  const stats = [
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      label: "Active Tours",
      value: activeTours.length,
      icon: MapPin,
    },
    {
      label: "Attendance Rate",
      value: `${attendanceRate}%`,
      icon: ClipboardCheck,
    },
    {
      label: "System Health",
      value: `${systemHealth > 0 ? systemHealth : 0}%`,
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Organization Dashboard</h1>
          <p className="text-slate-600">Real-time analytics and operational overview.</p>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tours..."
            className="pl-9 pr-4 py-2 w-full border rounded-lg"
          />
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="h-6 w-6 text-blue-600" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TOUR LIST */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tours</CardTitle>
          <CardDescription>Operational tour list with real metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTours.length === 0 ? (
            <p className="text-slate-500">No tours found.</p>
          ) : (
            <div className="space-y-3">
              {filteredTours.map((tour) => {
                const daysLeft = calculateDaysLeft(tour.startDate);

                return (
                  <Link
                    key={tour.id}
                    href={`/dashboard/tours/${tour.id}`}
                    className="flex justify-between p-4 border rounded-lg hover:bg-slate-100"
                  >
                    <div>
                      <p className="font-semibold">{tour.name}</p>
                      <p className="text-sm text-slate-500">
                        {tour.destination} • {tour.organizations?.name || "Independent"}
                      </p>
                      {daysLeft !== null && daysLeft > 0 && (
                        <p className="text-xs text-blue-600">Starts in {daysLeft} days</p>
                      )}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        statusColors[tour.status as keyof typeof statusColors]
                      }`}
                    >
                      {statusIcons[tour.status as keyof typeof statusIcons]}
                      <span className="ml-1 capitalize">{tour.status}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ======================================================= */
/* ================= PARTICIPANT ========================= */
/* ======================================================= */

function ParticipantDashboard({ tours }: { tours: ExtendedTour[] }) {
  const myAttendance = calculateAttendanceRate(tours.flatMap((t) => t.attendanceRecords || []));

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <h1 className="text-3xl font-bold mb-6">Participant Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">My Tours</p>
            <p className="text-2xl font-bold">{tours.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Attendance Rate</p>
            <p className="text-2xl font-bold">{myAttendance}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Unresolved Incidents</p>
            <p className="text-2xl font-bold">
              {tours.reduce((s, t) => s + (t.incidents?.filter((i) => !i.resolved).length || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ======================================================= */
/* ================= LEADER ============================== */
/* ======================================================= */

function LeaderDashboard({ tours }: { tours: ExtendedTour[] }) {
  const activeTours = tours.filter((t) => t.status === "active");

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <h1 className="text-3xl font-bold mb-6">Tour Leader Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Active Tours</p>
            <p className="text-2xl font-bold">{activeTours.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Total Participants</p>
            <p className="text-2xl font-bold">
              {tours.reduce((s, t) => s + (t.participants?.length || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Managed Tours</CardTitle>
        </CardHeader>
        <CardContent>
          {tours.map((t) => (
            <div key={t.id} className="p-4 border rounded-lg mb-3">
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-slate-500">{t.destination}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
