"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MapPin, Calendar, Users, ChevronRight } from "lucide-react";
import { PageHeader, LoadingCard, ErrorMessage } from "@/components/features";
import { tourApi, type TourData } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ToursPage() {
  const { user } = useAuth();
  const [tours, setTours] = useState<TourData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has admin role
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchTours = async () => {
      const result = await tourApi.getAll();
      if (result.success && result.data) {
        setTours(result.data);
      } else {
        setError(result.error || "Failed to fetch tours");
      }
      setLoading(false);
    };
    fetchTours();
  }, []);

  if (loading) return <LoadingCard />;
  if (error) return <ErrorMessage message={error} variant="card" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tours"
        description="Manage and monitor all your tours"
        action={
          isAdmin ? (
            <Link href="/dashboard/tours/new" className="btn-primary">
              <Plus className="h-4 w-4" />
              Create Tour
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {tours.length === 0 ? (
          <div className="col-span-full card p-20 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No tours found</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              {isAdmin
                ? "Get started by creating your first tour"
                : "No tours available at the moment"}
            </p>
            {isAdmin && (
              <Link href="/dashboard/tours/new" className="btn-primary">
                Create Tour
              </Link>
            )}
          </div>
        ) : (
          tours.map((tour) => (
            <Link key={tour.id} href={`/dashboard/tours/${tour.id}`} className="card-hover block">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {tour.name}
                  </h3>
                  <span className={`status-${tour.status}`}>
                    {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(tour.start_date).toLocaleDateString()} -{" "}
                    {new Date(tour.end_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {tour.destination || "Multiple Locations"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {tour.participant_count || 0} Participants
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border flex justify-end">
                  <div className="text-sm font-semibold text-primary flex items-center gap-1">
                    View Details
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
