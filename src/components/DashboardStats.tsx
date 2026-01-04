"use client";

import { useEffect, useState } from "react";
import { Users, Map, ShieldAlert, Wallet } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
        // Fetch Total Tours
        const { count: toursCount } = await supabase
          .from("tours")
          .select("*", { count: "exact", head: true });

        // Fetch Total Participants (approximate for demo)
        const { count: participantsCount } = await supabase
          .from("tour_participants")
          .select("*", { count: "exact", head: true });

        // Fetch Open Incidents
        const { count: incidentsCount } = await supabase
          .from("incidents")
          .select("*", { count: "exact", head: true })
          .eq("status", "open");

        // Fetch Budget Stats
        const { data: expenses } = await supabase
          .from("expenses")
          .select("amount");
        
        const totalExpenses = expenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
        
        setStats(prev => [
          { ...prev[0], value: (participantsCount || 0).toString() },
          { ...prev[1], value: (toursCount || 0).toString() },
          { ...prev[2], value: (incidentsCount || 0).toString() },
          { ...prev[3], value: totalExpenses > 0 ? `$${totalExpenses.toLocaleString()}` : "0" },
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
