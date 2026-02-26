"use client";

import Sidebar from "@/components/Sidebar";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LoadingPage } from "@/components/features";
import { NotificationBell } from "@/components/NotificationBell";

const getRoleLabel = (role?: string) => {
  switch (role) {
    case "admin":
      return "Administrator";
    case "guide":
      return "Tour Leader";
    case "tourist":
      return "Participant";
    default:
      return "Dashboard";
  }
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-8">
          <h1 className="text-xl font-semibold text-foreground">{getRoleLabel(user?.role)}</h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 hover:bg-muted/80 cursor-pointer transition-colors">
              <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {user?.name || user?.email}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 bg-muted/30">{children}</main>
      </div>
    </div>
  );
}
