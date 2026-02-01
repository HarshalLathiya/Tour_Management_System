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
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const sidebarLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "org_admin", "tour_leader", "participant"],
  },
  {
    name: "My Tours",
    href: "/dashboard/tours",
    icon: Map,
    roles: ["super_admin", "org_admin", "tour_leader", "participant"],
  },
  {
    name: "Attendance",
    href: "/dashboard/attendance",
    icon: Users,
    roles: ["super_admin", "org_admin", "tour_leader"],
  },
  {
    name: "Safety & SOS",
    href: "/dashboard/safety",
    icon: ShieldAlert,
    roles: ["super_admin", "org_admin", "tour_leader", "participant"],
  },
  {
    name: "Budget",
    href: "/dashboard/budget",
    icon: Wallet,
    roles: ["super_admin", "org_admin"],
  },
  {
    name: "Announcements",
    href: "/dashboard/announcements",
    icon: Bell,
    roles: ["super_admin", "org_admin", "tour_leader", "participant"],
  },
  {
    name: "Audit Logs",
    href: "/dashboard/audit-logs",
    icon: Settings,
    roles: ["super_admin", "org_admin"],
  },
];

export default function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const filteredLinks = sidebarLinks.filter((link) =>
    link.roles.includes(userRole),
  );

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-slate-300">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <MapPin className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold text-white">TourSync</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <link.icon
                className={`h-5 w-5 ${
                  isActive ? "text-white" : "text-slate-400"
                }`}
              />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
