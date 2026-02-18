"use client";

import { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ChevronDown,
  Filter,
  UserCheck,
  UserMinus,
  AlertTriangle,
  Loader2,
  MapPin,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { tourApi, attendanceApi, api } from "@/lib/api";
import type { TourData } from "@/lib/api";
import type { Tour, ItineraryDay } from "@/types";

interface Participant {
  id: number;
  full_name: string;
  email: string;
}

interface AttendanceEntry {
  user_id: number;
  status: string;
  marked_at?: string;
}

function AttendanceContent() {
  const searchParams = useSearchParams();
  const initialTourId = searchParams.get("tourId");

  const [tours, setTours] = useState<TourData[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<number>(
    initialTourId ? parseInt(initialTourId) : 0
  );
  const [itineraries, setItineraries] = useState<ItineraryDay[]>([]);
  const [selectedItineraryId, setSelectedItineraryId] = useState<number>(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [attendance, setAttendance] = useState<Record<number, AttendanceEntry>>({});
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAutoChecking, setIsAutoChecking] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const result = await tourApi.getAll();
        if (result.success && result.data) {
          setTours(result.data);
          if (!selectedTourId && result.data.length > 0) {
            setSelectedTourId(result.data[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedTourId) return;

    const fetchTourDetails = async () => {
      setLoading(true);
      try {
        // Fetch participants
        const participantResult = await api.get<Participant[]>(
          `/tours/${selectedTourId}/participants`
        );
        if (participantResult.success && participantResult.data) {
          setParticipants(participantResult.data);
        }

        // Fetch attendance for the current selection
        const attendanceResult = await attendanceApi.getAll({ tour_id: selectedTourId });
        if (attendanceResult.success && attendanceResult.data) {
          const attendanceMap: Record<number, AttendanceEntry> = {};
          attendanceResult.data.forEach((record) => {
            attendanceMap[record.user_id] = record;
          });
          setAttendance(attendanceMap);
        }
      } catch (error) {
        console.error("Error fetching tour details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetails();
  }, [selectedTourId]);

  const markAttendance = async (userId: number, status: string) => {
    setMarking(userId);
    try {
      const result = await attendanceApi.create({
        user_id: userId,
        tour_id: selectedTourId,
        date: new Date().toISOString().split("T")[0],
        status: status.toLowerCase() as "present" | "absent" | "late",
      });

      if (result.success) {
        setAttendance((prev) => ({
          ...prev,
          [userId]: { user_id: userId, status, marked_at: new Date().toISOString() },
        }));
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
    } finally {
      setMarking(null);
    }
  };

  const handleAutoCheckIn = async () => {
    setIsAutoChecking(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        });
      }
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setIsAutoChecking(false);
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const status = attendance[p.id]?.status || "PENDING";
    const matchesFilter =
      statusFilter === "all" || status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: participants.length,
    present: Object.values(attendance).filter((a) => a.status === "PRESENT").length,
    absent: Object.values(attendance).filter((a) => a.status === "ABSENT").length,
    permission: Object.values(attendance).filter((a) => a.status === "LEFT_WITH_PERMISSION").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Attendance Tracking</h2>
          <p className="text-slate-500">Real-time coordinator dashboard for tour locations.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedTourId}
            onChange={(e) => setSelectedTourId(parseInt(e.target.value))}
            className="input"
          >
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={selectedItineraryId}
            onChange={(e) => setSelectedItineraryId(parseInt(e.target.value))}
            className="input"
          >
            {itineraries.length === 0 ? (
              <option value="">No locations added</option>
            ) : (
              itineraries.map((i) => (
                <option key={i.id} value={i.id}>
                  Day {i.day_number}: {i.title}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
          <p className="text-xs font-bold text-green-600 uppercase">Present</p>
          <p className="text-2xl font-bold text-green-700">{stats.present}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
          <p className="text-xs font-bold text-red-600 uppercase">Absent</p>
          <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
        </div>
        <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 shadow-sm">
          <p className="text-xs font-bold text-primary-600 uppercase">Pending</p>
          <p className="text-2xl font-bold text-primary-700">
            {stats.total - (stats.present + stats.absent + stats.permission)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAutoCheckIn}
              disabled={isAutoChecking || !selectedItineraryId}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                isAutoChecking
                  ? "bg-slate-100 text-slate-400"
                  : "btn-primary shadow-lg shadow-primary-200"
              }`}
            >
              {isAutoChecking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              Auto Check-In
            </button>
            {["all", "present", "absent", "pending"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === f
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  Participant
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">
                  Actions
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParticipants.map((p) => {
                const status = attendance[p.id]?.status || "PENDING";
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{p.full_name}</p>
                      <p className="text-xs text-slate-500">{p.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          disabled={marking === p.id}
                          onClick={() => markAttendance(p.id, "PRESENT")}
                          className={`p-2 rounded-lg transition-all ${status === "PRESENT" ? "bg-green-600 text-white" : "bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600"}`}
                        >
                          <UserCheck className="h-5 w-5" />
                        </button>
                        <button
                          disabled={marking === p.id}
                          onClick={() => markAttendance(p.id, "ABSENT")}
                          className={`p-2 rounded-lg transition-all ${status === "ABSENT" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600"}`}
                        >
                          <UserMinus className="h-5 w-5" />
                        </button>
                        <button
                          disabled={marking === p.id}
                          onClick={() => markAttendance(p.id, "LEFT_WITH_PERMISSION")}
                          className={`p-2 rounded-lg transition-all ${status === "LEFT_WITH_PERMISSION" ? "bg-primary text-white" : "bg-slate-100 text-slate-400 hover:bg-primary-100 hover:text-primary-600"}`}
                        >
                          <Clock className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          status === "PRESENT"
                            ? "bg-green-100 text-green-700"
                            : status === "ABSENT"
                              ? "bg-red-100 text-red-700"
                              : status === "LEFT_WITH_PERMISSION"
                                ? "bg-primary-100 text-primary-700"
                                : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<div>Loading attendance...</div>}>
      <AttendanceContent />
    </Suspense>
  );
}
