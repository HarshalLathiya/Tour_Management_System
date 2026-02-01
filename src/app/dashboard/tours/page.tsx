"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { createClient } from "@/lib/supabase/client";

export default function ToursPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const supabase = createClient();

  const handleDeleteTour = async (tourId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this tour? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.from("tours").delete().eq("id", tourId);

      if (error) {
        console.error("Error deleting tour:", error);
        alert("Failed to delete tour. Please try again.");
      } else {
        setTours(tours.filter((tour) => tour.id !== tourId));
        alert("Tour deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting tour:", error);
      alert("Failed to delete tour. Please try again.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile to get role
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          setUserRole(profile?.role || null);
        }

        // Fetch tours based on user role
        let toursQuery = supabase.from("tours").select(`
            *,
            organizations:organization_id (name)
          `);

        if (userRole === "tour_leader" && user) {
          // For tour leaders, only show tours they are leading
          toursQuery = supabase
            .from("tour_leaders")
            .select(
              `
              tours:tour_id (
                *,
                organizations:organization_id (name)
              )
            `,
            )
            .eq("user_id", user.id);
        }

        const { data: toursData, error } = await toursQuery.order(
          "created_at",
          { ascending: false },
        );

        if (error) {
          console.error("Error fetching tours:", error);
        } else {
          setTours(toursData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {userRole === "tour_leader" ? "My Tours" : "Tours"}
          </h2>
          <p className="text-slate-500">
            {userRole === "tour_leader"
              ? "View and manage tours you are leading."
              : "Manage and monitor all your tours."}
          </p>
        </div>
        {userRole !== "tour_leader" && (
          <Link
            href="/dashboard/tours/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Create New Tour
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="card h-48 animate-pulse bg-slate-100"></div>
          ))
        ) : tours.length === 0 ? (
          <div className="col-span-full py-20 text-center card bg-white">
            <MapPin className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">
              No tours found
            </h3>
            <p className="mt-2 text-slate-500">
              Get started by creating your first tour itinerary.
            </p>
          </div>
        ) : (
          tours.map((tour) => (
            <Link
              key={tour.id}
              href={`/dashboard/tours/${tour.id}`}
              className="card group hover:border-blue-500 transition-all cursor-pointer block"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600">
                  {tour.name}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tour.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
                </span>
              </div>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(tour.start_date).toLocaleDateString()} -{" "}
                  {new Date(tour.end_date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  {tour.destination || "Multiple Locations"}
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {tour.max_participants || 0} Max Participants
                </div>
              </div>
              <div className="mt-6 pt-4 border-t flex justify-end">
                <div className="text-sm font-semibold text-blue-600 flex items-center">
                  Manage Details <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
