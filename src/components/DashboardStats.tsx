"use client";

import { Users, Map, ShieldAlert, Wallet } from "lucide-react";

const stats = [
  {
    name: "Active Participants",
    value: "124",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    name: "Total Tours",
    value: "12",
    icon: Map,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    name: "Open Incidents",
    value: "2",
    icon: ShieldAlert,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  {
    name: "Budget Utilized",
    value: "68%",
    icon: Wallet,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
];

export default function DashboardStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="card flex items-center space-x-4">
          <div className={`rounded-full p-3 ${stat.bg}`}>
            <stat.icon className={`h-6 w-6 ${stat.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {stat.name}
            </p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
