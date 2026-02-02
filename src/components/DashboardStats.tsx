"use client";

import { useEffect, useState } from "react";
import { Users, Map, ShieldAlert, Wallet } from "lucide-react";

export default function DashboardStats() {
  const [stats, setStats] = useState([
    {
      name: "Active Participants",
      value: "0",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      name: "Total Tours",
      value: "0",
      icon: Map,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      name: "Open Incidents",
      value: "0",
      icon: ShieldAlert,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      name: "Budget Utilized",
      value: "0%",
      icon: Wallet,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const toursRes = await fetch("http://localhost:5000/api/tours");
        const toursData = await toursRes.json();
        const toursCount = Array.isArray(toursData) ? toursData.length : 0;

        // Participants, incidents, and expenses endpoints are not yet available;
        // display tours count and leave the remaining stats at their defaults.
        setStats((prev) => [
          { ...prev[0], value: "0" },
          { ...prev[1], value: toursCount.toString() },
          { ...prev[2], value: "0" },
          { ...prev[3], value: "0" },
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="card flex items-center space-x-4">
          <div className={`rounded-full p-3 ${stat.bg}`}>
            <stat.icon className={`h-6 w-6 ${stat.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
