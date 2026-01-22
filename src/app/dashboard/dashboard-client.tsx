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
  Search,
  Filter,
  TrendingUp,
  Clock,
  Shield,
  BarChart3,
  MoreVertical,
  Download,
  Eye,
  Edit,
  Trash2,
  History,
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
  active: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
  completed: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white",
  cancelled: "bg-gradient-to-r from-red-500 to-rose-500 text-white",
};

const statusIcons = {
  draft: <Clock className="h-4 w-4" />,
  planned: <Calendar className="h-4 w-4" />,
  active: <MapPin className="h-4 w-4" />,
  completed: <ClipboardCheck className="h-4 w-4" />,
  cancelled: <AlertTriangle className="h-4 w-4" />,
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
      change: "+12%",
      trend: "up",
    },
    {
      label: "Total Organizations",
      value: organizations.length,
      icon: Users,
      color: "from-emerald-500 to-teal-500",
      change: "+2",
      trend: "up",
    },
    {
      label: "Upcoming Tours",
      value: tours.filter((t) => t.status === "planned").length,
      icon: Calendar,
      color: "from-violet-500 to-purple-500",
      change: "3",
      trend: "neutral",
    },
    {
      label: "Total Participants",
      value: tours.reduce(
        (sum, tour) => sum + (tour.participants?.length || 0),
        0
      ),
      icon: Users,
      color: "from-amber-500 to-orange-500",
      change: "+24",
      trend: "up",
    },
  ];

  const activeTours = tours.filter((t) => t.status === "active").slice(0, 3);
  const upcomingTours = tours.filter((t) => t.status === "planned").slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Welcome back! Here's what's happening with your tours.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search tours, participants..."
                className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64 text-stone-950"
              />
            </div>
            <Button className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300">
              <Plus className="h-4 w-4 mr-2" />
              New Tour
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="cursor-pointer"
            >
              <Card className="overflow-hidden border-2 border-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-2">
                        {stat.label}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-slate-900">
                          {stat.value}
                        </p>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            stat.trend === "up"
                              ? "bg-emerald-100 text-emerald-700"
                              : stat.trend === "down"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`rounded-xl bg-gradient-to-br ${stat.color} p-3 text-white shadow-lg`}
                    >
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-slate-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>Updated just now</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Tours & Quick Actions */}
        <div className="lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Tours */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-2"
            >
              <Card className="rounded-3xl border-2 border-white hover:border-blue-100 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Recent Tours</CardTitle>
                    <CardDescription>
                      Your latest tour activities
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-slate-300"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Link href="/dashboard/tours/new">
                      <Button
                        size="sm"
                        className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Tour
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {tours.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-4 mb-4">
                        <MapPin className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        No tours yet
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Create your first tour to get started
                      </p>
                      <Link href="/dashboard/tours/new" className="mt-4">
                        <Button className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300">
                          Create Tour
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tours.slice(0, 5).map((tour) => (
                        <motion.div
                          key={tour.id}
                          whileHover={{ scale: 1.01, x: 4 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Link
                            href={`/dashboard/tours/${tour.id}`}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50"
                          >
                            <div className="flex items-center gap-4">
                              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3">
                                <MapPin className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {tour.name}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-sm text-slate-500">
                                    {tour.destination}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    •
                                  </span>
                                  <span className="text-sm text-slate-500">
                                    {tour.organizations?.name ||
                                      "No Organization"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
                                  statusColors[
                                    tour.status as keyof typeof statusColors
                                  ]
                                }`}
                              >
                                {
                                  statusIcons[
                                    tour.status as keyof typeof statusIcons
                                  ]
                                }
                                <span>
                                  {tour.status.charAt(0).toUpperCase() +
                                    tour.status.slice(1)}
                                </span>
                              </span>
                              <ChevronRight className="h-5 w-5 text-slate-400" />
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2"
            >
              <Card className="rounded-3xl border-2 border-white hover:border-blue-100 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {[
                    {
                      href: "/dashboard/tours/new",
                      icon: Plus,
                      iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
                      title: "Create New Tour",
                      description: "Start planning a new tour",
                    },
                    {
                      href: "/dashboard/attendance",
                      icon: ClipboardCheck,
                      iconColor:
                        "bg-gradient-to-br from-emerald-500 to-teal-500",
                      title: "Take Attendance",
                      description: "Mark attendance for current tour",
                    },
                    {
                      href: "/dashboard/announcements",
                      icon: Bell,
                      iconColor:
                        "bg-gradient-to-br from-violet-500 to-purple-500",
                      title: "Send Announcement",
                      description: "Notify all participants",
                    },
                      {
                        href: "/dashboard/safety",
                        icon: AlertTriangle,
                        iconColor:
                          "bg-gradient-to-br from-amber-500 to-orange-500",
                        title: "Report Incident",
                        description: "Log safety concerns or emergencies",
                      },
                      {
                        href: "/dashboard/audit-logs",
                        icon: History,
                        iconColor: "bg-gradient-to-br from-slate-600 to-slate-800",
                        title: "System Audit Logs",
                        description: "Track all administrative changes",
                      },
                    ].map((action, index) => (

                    <motion.div
                      key={action.title}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Link
                        href={action.href}
                        className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50"
                      >
                        <div
                          className={`rounded-xl p-3 text-white ${action.iconColor}`}
                        >
                          <action.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {action.title}
                          </p>
                          <p className="text-sm text-slate-600">
                            {action.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </Link>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Tours */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-3xl border-2 border-white hover:border-blue-100 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl">Active Tours</CardTitle>
                <CardDescription>Currently running tours</CardDescription>
              </CardHeader>
              <CardContent>
                {activeTours.length === 0 ? (
                  <div className="text-center py-6">
                    <MapPin className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">No active tours</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeTours.map((tour) => (
                      <div
                        key={tour.id}
                        className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {tour.name}
                            </p>
                            <p className="text-sm text-slate-600">
                              {tour.destination}
                            </p>
                          </div>
                          <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-1 text-xs font-medium text-white">
                            Active
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">
                            {tour.participants?.length || 0} participants
                          </span>
                          <Link
                            href={`/dashboard/tours/${tour.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Tours */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="rounded-3xl border-2 border-white hover:border-blue-100 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl">Upcoming Tours</CardTitle>
                <CardDescription>Scheduled for next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingTours.length === 0 ? (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">No upcoming tours</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingTours.map((tour) => (
                      <div
                        key={tour.id}
                        className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {tour.name}
                            </p>
                            <p className="text-sm text-slate-600">
                              {tour.destination}
                            </p>
                          </div>
                          <span className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-2 py-1 text-xs font-medium text-white">
                            Planned
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">
                            Starts in {Math.floor(Math.random() * 14) + 1} days
                          </span>
                          <Link
                            href={`/dashboard/tours/${tour.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Prepare →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Safety Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="rounded-3xl border-2 border-white hover:border-blue-100 transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Safety Status
                    </h3>
                    <p className="text-sm text-slate-600">All systems normal</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Active SOS</span>
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                      0 incidents
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Participants</span>
                    <span className="text-sm font-medium text-slate-900">
                      All safe
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Last check</span>
                    <span className="text-sm text-slate-500">2 min ago</span>
                  </div>
                </div>
                <Button
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  variant="outline"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  View Safety Dashboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
