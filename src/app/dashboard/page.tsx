"use client";

import DashboardStats from "@/components/DashboardStats";
import {
  Calendar,
  MapPin,
  Users,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Overview</h2>
        <p className="text-muted-foreground">
          Welcome to TourSync. Here's what's happening today.
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Tours</h3>
            <Link
              href="/dashboard/tours"
              className="text-sm font-medium text-blue-600 hover:underline flex items-center"
            >
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="rounded-md bg-blue-100 p-2">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Summer Industrial Visit 2026</h4>
                <p className="text-sm text-slate-500">
                  Day 3 of 5 • Bangalore, India
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  On Track
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="rounded-md bg-purple-100 p-2">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">NGO Field Trip - Rural Dev</h4>
                <p className="text-sm text-slate-500">
                  Day 1 of 3 • Hampi, India
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  Starting
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Alerts</h3>
            <Link
              href="/dashboard/safety"
              className="text-sm font-medium text-blue-600 hover:underline flex items-center"
            >
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 rounded-lg border border-red-100 bg-red-50 p-4">
              <div className="rounded-md bg-red-100 p-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-red-900">
                  SOS Alert - Participant
                </h4>
                <p className="text-sm text-red-700">
                  John Doe reported a medical emergency at Site A.
                </p>
              </div>
              <span className="text-xs font-bold text-red-600">2m ago</span>
            </div>
            <div className="flex items-center space-x-4 rounded-lg border p-4">
              <div className="rounded-md bg-orange-100 p-2">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Headcount Required</h4>
                <p className="text-sm text-slate-500">
                  Arrival at Lunch Stop. Please mark attendance.
                </p>
              </div>
              <span className="text-xs text-slate-400">15m ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
