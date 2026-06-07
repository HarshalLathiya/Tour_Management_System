"use client";

import { useEffect, useMemo, useState } from "react";
import { subDays, formatISO, startOfDay } from "date-fns";
import {
  Activity,
  Download,
  TrendingUp,
  Users,
  Map as MapIcon,
  ShieldAlert,
  Wallet,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { superAdminApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LoadingCard } from "@/components/features";

type DateRangePreset = "7d" | "30d" | "90d" | "ytd";

// ------------------------------------------------------------------
// Types (kept local for fast scaffolding; will be moved to shared types later)
// ------------------------------------------------------------------

type AnalyticsApiResponse = {
  users?: {
    totalUsers?: number;
    activeUsers?: number;
    inactiveUsers?: number;
    growth?: { points: Array<{ date: string; value: number }> };
    monthlyRegistrations?: { points: Array<{ month: string; value: number }> };
    roleDistribution?: { items: Array<{ role: string; value: number }> };
  };
  tours?: {
    totalTours?: number;
    createdPerMonth?: { points: Array<{ month: string; value: number }> };
    statusDistribution?: { items: Array<{ status: string; value: number }> };
    topTours?: {
      items: Array<{ tourId: number; tourName: string; metric: string; value: number }>;
    };
    occupancy?: { points: Array<{ month: string; value: number }> };
  };
  attendance?: {
    attendanceRateTrend?: { points: Array<{ date: string; value: number }> };
    presentAbsent?: { present: number; absent: number };
    byTour?: {
      items: Array<{ tourId: number; tourName: string; present: number; absent: number }>;
    };
  };
  safety?: {
    sosPerMonth?: { points: Array<{ month: string; value: number }> };
    severityBreakdown?: { items: Array<{ severity: string; value: number }> };
    resolutionTime?: { avgMinutes: number };
    incidentTypeDistribution?: { items: Array<{ type: string; value: number }> };
  };
  finance?: {
    revenueTrend?: { points: Array<{ month: string; value: number }> };
    expenseTrend?: { points: Array<{ month: string; value: number }> };
    revenueVsExpenses?: { points: Array<{ month: string; revenue: number; expenses: number }> };
    budgetUtilization?: { utilizationPercent: number };
    topRevenueTours?: { items: Array<{ tourId: number; tourName: string; value: number }> };
  };
  system?: {
    dailyActiveUsers?: { points: Array<{ date: string; value: number }> };
    weeklyActiveUsers?: { points: Array<{ week: string; value: number }> };
    loginActivity?: { points: Array<{ date: string; value: number }> };
    platformUsage?: { items: Array<{ platform: string; value: number }> };
  };
};

const roleColors: Record<string, string> = {
  super_admin: "#3b82f6",
  admin: "#22c55e",
  leader: "#f59e0b",
  participant: "#a855f7",
};

function formatMoneyINR(value: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${Math.round(value)}`;
  }
}

function defaultRange(preset: DateRangePreset) {
  const end = startOfDay(new Date());
  if (preset === "7d") return subDays(end, 6);
  if (preset === "30d") return subDays(end, 29);
  if (preset === "90d") return subDays(end, 89);
  // ytd
  const y = end.getFullYear();
  return new Date(y, 0, 1);
}

function formatKpiNumber(value?: number) {
  if (typeof value !== "number") return "—";
  return value.toLocaleString("en-IN");
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-8 w-1/3 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();
  const [rangePreset, setRangePreset] = useState<DateRangePreset>("30d");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsApiResponse | null>(null);

  const dateRange = useMemo(() => {
    const start = defaultRange(rangePreset);
    const end = startOfDay(new Date());
    return {
      start_date: formatISO(start, { representation: "date" }),
      end_date: formatISO(end, { representation: "date" }),
    };
  }, [rangePreset]);

  useEffect(() => {
    if (!user || user.role !== "super_admin") return;

    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        // New analytics endpoint will accept date range query params.
        const res = await superAdminApi.getAnalytics(dateRange);
        if (!res.success) throw new Error(res.error || "Analytics request failed");
        setData((res.data || {}) as AnalyticsApiResponse);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [user, dateRange]);

  if (isLoading) return <LoadingCard />;
  if (!user || user.role !== "super_admin")
    return <div className="text-red-600">Access denied.</div>;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <TrendingUp /> Analytics
            </h1>
            <p className="text-slate-600">Business intelligence for TourSync Super Admin.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics unavailable</CardTitle>
          <CardDescription>{err}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const kpis = [
    {
      title: "Total Users",
      value: formatKpiNumber(data?.users?.totalUsers),
      icon: Users,
      hint: "Across all roles",
    },
    {
      title: "Total Tours",
      value: formatKpiNumber(data?.tours?.totalTours),
      icon: MapIcon,
      hint: "Created to date",
    },
    {
      title: "Revenue",
      value: data?.finance?.revenueTrend?.points?.length
        ? formatMoneyINR(
            data.finance.revenueTrend.points[data.finance.revenueTrend.points.length - 1].value
          )
        : "—",
      icon: Wallet,
      hint: "Latest period",
    },
    {
      title: "Attendance Rate",
      value: data?.attendance?.attendanceRateTrend?.points?.length
        ? `${Math.round(data.attendance.attendanceRateTrend.points[data.attendance.attendanceRateTrend.points.length - 1].value)}%`
        : "—",
      icon: Activity,
      hint: "Present ratio",
    },
  ];

  const growthPoints = data?.users?.growth?.points ?? [];
  const monthlyRegs = data?.users?.monthlyRegistrations?.points ?? [];
  const roleDist = data?.users?.roleDistribution?.items ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="text-blue-600" /> Analytics
          </h1>
          <p className="text-slate-600">
            Trends, reporting, and business intelligence—historical insights over time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <Select value={rangePreset} onValueChange={(v) => setRangePreset(v as DateRangePreset)}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="ytd">YTD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" disabled>
              <Download className="h-4 w-4" /> Export PDF
            </Button>
            <Button variant="outline" className="gap-2" disabled>
              <Download className="h-4 w-4" /> Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.title} className="bg-card/80">
              <CardContent className="p-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{k.title}</p>
                  <p className="text-2xl font-bold mt-2">{k.value}</p>
                  <p className="text-xs text-slate-600 mt-1">{k.hint}</p>
                </div>
                <div className="rounded-full p-3 bg-slate-100">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total users over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {growthPoints.length === 0 ? (
              <div className="text-slate-500">No data for selected range.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
            <CardDescription>Users by role.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {roleDist.length === 0 ? (
              <div className="text-slate-500">No data for selected range.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={roleDist}
                    dataKey="value"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {roleDist.map((item) => (
                      <Cell key={item.role} fill={roleColors[item.role] || "#94a3b8"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Registrations</CardTitle>
            <CardDescription>New users per month.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {monthlyRegs.length === 0 ? (
              <div className="text-slate-500">No data for selected range.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRegs} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active vs Inactive</CardTitle>
            <CardDescription>User status distribution.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2 bg-emerald-50">
                    <Users className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active users</p>
                    <p className="text-2xl font-bold">
                      {formatKpiNumber(data?.users?.activeUsers)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2 bg-slate-100">
                    <Clock className="h-4 w-4 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Inactive users</p>
                    <p className="text-2xl font-bold">
                      {formatKpiNumber(data?.users?.inactiveUsers)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tours Created Per Month</CardTitle>
            <CardDescription>Historical tour creation volume.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {(data?.tours?.createdPerMonth?.points ?? []).length === 0 ? (
              <div className="text-slate-500">No data for selected range.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data?.tours?.createdPerMonth?.points}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tour Status Distribution</CardTitle>
            <CardDescription>Planned, ongoing, completed, cancelled.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {(data?.tours?.statusDistribution?.items ?? []).length === 0 ? (
              <div className="text-slate-500">No data for selected range.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={data?.tours?.statusDistribution?.items}
                    dataKey="value"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {data?.tours?.statusDistribution?.items.map((item) => (
                      <Cell
                        key={item.status}
                        fill={
                          item.status === "completed"
                            ? "#7c3aed"
                            : item.status === "cancelled"
                              ? "#dc2626"
                              : item.status === "ongoing"
                                ? "#16a34a"
                                : "#3b82f6"
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables section (scaffold—will be expanded once API returns proper shapes) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Tours</CardTitle>
            <CardDescription>Highest-performing tours (selected metric).</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.tours?.topTours?.items?.length ? (
              <div className="space-y-3">
                {data.tours.topTours.items.slice(0, 5).map((t) => (
                  <div
                    key={t.tourId}
                    className="flex items-center justify-between gap-3 p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{t.tourName}</p>
                      <p className="text-xs text-slate-500">{t.metric}</p>
                    </div>
                    <p className="font-bold">{t.value.toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500">No top tours available.</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Leaders</CardTitle>
            <CardDescription>Leaders ranked by tour performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-slate-500">Coming soon (API payload pending).</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Latest analytical insights.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-slate-500">Coming soon (API payload pending).</div>
          </CardContent>
        </Card>
      </div>

      {/* Remaining Analytics modules will be wired in once backend supports full analytics payload */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-slate-600">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-slate-700 mt-0.5" />
            <div>
              <p className="font-semibold">Analytics modules in progress</p>
              <p className="text-sm">
                Users/Tours charts are scaffolded. Attendance/Safety/Finance/System sections will
                render once backend returns the structured analytics sections for the selected date
                range.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
