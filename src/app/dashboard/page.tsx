"use client";

import { useEffect, useState } from "react";
import { DashboardClient } from "./dashboard-client";
import { tourApi, type TourData } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LoadingCard } from "@/components/features";

export default function DashboardPage() {
  const { user } = useAuth();
  const [tours, setTours] = useState<TourData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const result = await tourApi.getAll();
      if (result.success && result.data) {
        setTours(result.data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingCard />;
  }

  return <DashboardClient tours={tours} userRole={user?.role || null} />;
}
