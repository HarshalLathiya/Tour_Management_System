"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Plus,
  ChevronRight,
  ClipboardCheck,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Organization, Tour } from "@/types";

interface DashboardClientProps {
  organizations: Organization[];
  tours: (Tour & { organizations: { name: string } | null })[];
}

const statusColors = {
  draft: "bg-slate-100 text-slate-700",
  planned: "bg-blue-100 text-blue-700",
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-purple-100 text-purple-700",
  cancelled: "bg-red-100 text-red-700",
};

export function DashboardClient({
  organizations,
  tours,
}: DashboardClientProps) {
  const stats = [
    {
      label: "Active Tours",
      value: tours.filter((t) => t.status === "active").length,
      icon: MapPin,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "My Organizations",
      value: organizations.length,
      icon: Users,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Upcoming Tours",
      value: tours.filter((t) => t.status === "planned").length,
      icon: Calendar,
      color: "from-violet-500 to-purple-500",
    },
    {
      label: "Completed",
      value: tours.filter((t) => t.status === "completed").length,
      icon: DollarSign,
      color: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div
                      className={`rounded-xl bg-gradient-to-br ${stat.color} p-3 text-white`}
                    >
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Tours</CardTitle>
                <CardDescription>Your latest tour activities</CardDescription>
              </div>
              <Link href="/dashboard/tours/new">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Tour
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {tours.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No tours yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create your first tour to get started
                  </p>
                  <Link href="/dashboard/tours/new" className="mt-4">
                    <Button>Create Tour</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {tours.slice(0, 5).map((tour) => (
                    <Link
                      key={tour.id}
                      href={`/dashboard/tours/${tour.id}`}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="gradient-primary rounded-lg p-2">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {tour.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {tour.destination}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            statusColors[
                              tour.status as keyof typeof statusColors
                            ]
                          }`}
                        >
                          {tour.status.charAt(0).toUpperCase() +
                            tour.status.slice(1)}
                        </span>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Link
                href="/dashboard/tours/new"
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-slate-50"
              >
                <div className="rounded-lg bg-blue-100 p-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Create New Tour</p>
                  <p className="text-sm text-slate-500">
                    Start planning a new tour
                  </p>
                </div>
              </Link>
              <Link
                href="/dashboard/attendance"
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-slate-50"
              >
                <div className="rounded-lg bg-emerald-100 p-2">
                  <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Take Attendance</p>
                  <p className="text-sm text-slate-500">
                    Mark attendance for current tour
                  </p>
                </div>
              </Link>
              <Link
                href="/dashboard/announcements"
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-slate-50"
              >
                <div className="rounded-lg bg-violet-100 p-2">
                  <Bell className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    Send Announcement
                  </p>
                  <p className="text-sm text-slate-500">
                    Notify all participants
                  </p>
                </div>
              </Link>
              <Link
                href="/dashboard/safety"
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-slate-50"
              >
                <div className="rounded-lg bg-amber-100 p-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Report Incident</p>
                  <p className="text-sm text-slate-500">
                    Log safety concerns or emergencies
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
