"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Users,
  ShieldAlert,
  Wallet,
  Bell,
  Settings,
  LogOut,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const sidebarLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "guide", "tourist"],
  },
  {
    name: "My Tours",
    href: "/dashboard/tours",
    icon: Map,
    roles: ["admin", "guide", "tourist"],
  },
  {
    name: "Attendance",
    href: "/dashboard/attendance",
    icon: Users,
    roles: ["admin", "guide"],
  },
  {
    name: "Safety & SOS",
    href: "/dashboard/safety",
    icon: ShieldAlert,
    roles: ["admin", "guide", "tourist"],
  },
  {
    name: "Budget",
    href: "/dashboard/budget",
    icon: Wallet,
    roles: ["admin"],
  },
  {
    name: "Announcements",
    href: "/dashboard/announcements",
    icon: Bell,
    roles: ["admin", "guide", "tourist"],
  },
  {
    name: "Audit Logs",
    href: "/dashboard/audit-logs",
    icon: Settings,
    roles: ["admin"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredLinks = sidebarLinks.filter((link) =>
    user?.role ? link.roles.includes(user.role) : false
  );

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center transition-transform group-hover:scale-105">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">TourSync</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
