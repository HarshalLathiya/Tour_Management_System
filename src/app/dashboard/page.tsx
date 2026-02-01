import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get user role
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let userRole = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    userRole = profile?.role || null;
  }

  // Fetch Organizations
  const { data: organizations } = await supabase
    .from("organizations")
    .select("*");

  // Fetch Tours based on user role
  let toursQuery = supabase.from("tours").select("*, organizations(name)");

  if (userRole === "tour_leader" && user) {
    // For tour leaders, only show tours they are leading
    toursQuery = supabase
      .from("tour_leaders")
      .select(
        `
        tours:tour_id (
          *,
          organizations(name)
        )
      `,
      )
      .eq("user_id", user.id);
  }

  const { data: toursData } = await toursQuery;

  // Extract tours from nested structure for leaders
  let tours = toursData;
  if (userRole === "tour_leader") {
    tours = toursData?.map((item) => item.tours).filter(Boolean) || [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Overview</h2>
        <p className="text-muted-foreground">
          Welcome to TourSync. Here's what's happening today.
        </p>
      </div>

      <DashboardClient
        organizations={organizations || []}
        tours={tours || []}
        userRole={userRole}
      />
    </div>
  );
}
