"use client";

import { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";

const mockIncidents = [
  {
    id: 1,
    type: "medical",
    severity: "high",
    description: "Participant John Doe reported chest pain.",
    status: "open",
    time: "10m ago",
  },
  {
    id: 2,
    type: "logistics",
    severity: "low",
    description: "Bus delay due to traffic.",
    status: "resolved",
    time: "2h ago",
  },
  {
    id: 3,
    type: "security",
    severity: "medium",
    description: "Lost baggage at hotel check-in.",
    status: "open",
    time: "1h ago",
  },
];

export default function SafetyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Safety & SOS</h2>
          <p className="text-muted-foreground">
            Monitor incidents and respond to SOS alerts.
          </p>
        </div>
        <button className="flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
          <ShieldAlert className="mr-2 h-4 w-4" /> Trigger SOS Alert
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Incident Log</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter incidents..."
                  className="w-full rounded-md border border-slate-300 pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-4">
              {mockIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className={`flex items-start space-x-4 rounded-lg border p-4 ${
                    incident.status === "open"
                      ? "bg-white"
                      : "bg-slate-50 opacity-75"
                  }`}
                >
                  <div
                    className={`rounded-full p-2 ${
                      incident.severity === "high"
                        ? "bg-red-100 text-red-600"
                        : incident.severity === "medium"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                        {incident.type} • {incident.severity} SEVERITY
                      </h4>
                      <span className="text-xs text-slate-500">
                        {incident.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">
                      {incident.description}
                    </p>
                    <div className="mt-3 flex space-x-2">
                      {incident.status === "open" ? (
                        <button className="text-xs font-bold text-blue-600 hover:underline">
                          Mark as Resolved
                        </button>
                      ) : (
                        <span className="flex items-center text-xs font-bold text-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" /> Resolved
                        </span>
                      )}
                      <button className="text-xs font-bold text-slate-500 hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-slate-900 text-white space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <ShieldAlert className="mr-2 h-5 w-5 text-red-500" /> Emergency
              Contacts
            </h3>
            <div className="space-y-3">
              <div className="border-b border-slate-700 pb-3">
                <p className="text-xs text-slate-400">Local Police</p>
                <p className="text-sm font-medium">100 / 112</p>
              </div>
              <div className="border-b border-slate-700 pb-3">
                <p className="text-xs text-slate-400">
                  Nearest Hospital (Bangalore)
                </p>
                <p className="text-sm font-medium">St. Johns Medical College</p>
                <p className="text-xs text-slate-400">080 2206 5000</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Tour Operations Desk</p>
                <p className="text-sm font-medium">+91 98765 43210</p>
              </div>
            </div>
          </div>
          <div className="card space-y-4">
            <h3 className="text-lg font-semibold">Hospital Lookup</h3>
            <p className="text-sm text-slate-500">
              Find nearest medical facilities based on your current location.
            </p>
            <button className="w-full rounded-md border border-slate-200 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
              Open Hospital Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
