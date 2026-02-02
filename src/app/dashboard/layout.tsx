"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Bell, User } from "lucide-react";

interface DecodedProfile {
  id: string;
  email: string;
  role: string;
  full_name: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<DecodedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setProfile({
          id: payload.id || "",
          email: payload.email || "",
          role: payload.role || "",
          full_name: payload.full_name || payload.email || "",
        });
      } catch {
        router.push("/auth/login");
        return;
      }

      setLoading(false);
    };

    getUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar userRole={profile?.role || ""} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">
            {profile?.role === "tour_leader"
              ? "Leader Dashboard"
              : profile?.role === "org_admin"
                ? "Organization Admin"
                : profile?.role === "super_admin"
                  ? "Platform Admin"
                  : "Participant Dashboard"}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2 rounded-full bg-slate-100 px-3 py-1.5 hover:bg-slate-200 cursor-pointer transition-colors">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-slate-700">{profile?.full_name}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
