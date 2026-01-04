"use client";

import { useState } from "react";
import { Users, CheckCircle, XCircle, Clock, Search } from "lucide-react";
import { BackButton } from "@/components/BackButton";

export default function AttendancePage() {

  const [filter, setFilter] = useState("all");

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Attendance</h2>
          <p className="text-muted-foreground">
            Track participant presence at each location.
          </p>
        </div>
        <div className="flex space-x-2">
          <select className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Summer Industrial Visit 2026</option>
            <option>NGO Field Trip</option>
          </select>
          <select className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Day 3: Bangalore Site A</option>
            <option>Day 3: Bangalore Site B</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card bg-blue-50 border-blue-100">
          <p className="text-sm font-medium text-blue-600">
            Total Participants
          </p>
          <p className="text-2xl font-bold text-blue-900">45</p>
        </div>
        <div className="card bg-green-50 border-green-100">
          <p className="text-sm font-medium text-green-600">Present</p>
          <p className="text-2xl font-bold text-green-900">42</p>
        </div>
        <div className="card bg-red-50 border-red-100">
          <p className="text-sm font-medium text-red-600">Absent</p>
          <p className="text-2xl font-bold text-red-900">2</p>
        </div>
        <div className="card bg-orange-50 border-orange-100">
          <p className="text-sm font-medium text-orange-600">With Permission</p>
          <p className="text-2xl font-bold text-orange-900">1</p>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="flex items-center justify-between border-b p-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search participants..."
              className="w-full rounded-md border border-slate-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-1 rounded-md bg-slate-100 p-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-xs font-medium rounded ${
                filter === "all"
                  ? "bg-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("present")}
              className={`px-3 py-1 text-xs font-medium rounded ${
                filter === "present"
                  ? "bg-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Present
            </button>
            <button
              onClick={() => setFilter("absent")}
              className={`px-3 py-1 text-xs font-medium rounded ${
                filter === "absent"
                  ? "bg-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Absent
            </button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-3">Participant Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Marked Time</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {mockParticipants.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {p.name}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === "present"
                        ? "bg-green-100 text-green-800"
                        : p.status === "absent"
                        ? "bg-red-100 text-red-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {p.status === "present" && (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    )}
                    {p.status === "absent" && (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {p.status === "permission" && (
                      <Clock className="mr-1 h-3 w-3" />
                    )}
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{p.time}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Edit
                  </button>
                  <button className="text-slate-400 hover:text-slate-600 font-medium">
                    Log
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
