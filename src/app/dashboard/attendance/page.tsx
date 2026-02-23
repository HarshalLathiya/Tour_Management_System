"use client";

export const dynamic = "force-dynamic";

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
  Calendar,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { tourApi, attendanceApi, api, itineraryApi } from "@/lib/api";
import type { TourData, ItineraryData } from "@/lib/api";
import type { Tour, ItineraryDay } from "@/types";
import { toast } from "sonner";

interface Participant {
  id: number;
  full_name: string;
  email: string;
}

interface AttendanceEntry {
  user_id: number;
  status: string;
  marked_at?: string;
  participant_name?: string;
}

interface ItineraryLocation {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  arrival_time?: string;
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
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [attendance, setAttendance] = useState<Record<number, AttendanceEntry>>({});
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAutoChecking, setIsAutoChecking] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch tours on mount
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

  // Fetch itineraries when tour is selected
  useEffect(() => {
    if (!selectedTourId) return;

    const fetchItineraries = async () => {
      try {
        const result = await itineraryApi.getAll(selectedTourId);
        if (result.success && result.data) {
          // Map ItineraryData to ItineraryDay format
          const mappedItineraries: ItineraryDay[] = result.data.map((item: ItineraryData) => ({
            id: String(item.id),
            tour_id: String(item.tour_id),
            day_number: parseInt(item.date.split("-")[2]) || 1,
            date: item.date,
            title: item.title,
            description: item.description,
            created_at: item.created_at,
          }));
          setItineraries(mappedItineraries);

          // Auto-select first itinerary if available
          if (mappedItineraries.length > 0 && !selectedItineraryId) {
            setSelectedItineraryId(Number(mappedItineraries[0].id));
          }
        }
      } catch (error) {
        console.error("Error fetching itineraries:", error);
      }
    };
    fetchItineraries();
  }, [selectedTourId]);

  // Fetch tour details (participants and attendance) when tour or date changes
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

        // Fetch attendance for the selected date
        const attendanceResult = await attendanceApi.getAll({
          tour_id: selectedTourId,
          date: selectedDate,
        });
        if (attendanceResult.success && attendanceResult.data) {
          const attendanceMap: Record<number, AttendanceEntry> = {};
          attendanceResult.data.forEach((record) => {
            attendanceMap[record.user_id] = {
              ...record,
              participant_name: participants.find((p) => p.id === record.user_id)?.full_name,
            };
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
  }, [selectedTourId, selectedDate]);

  const markAttendance = async (userId: number, status: string) => {
    setMarking(userId);
    try {
      // Use lowercase status for API (fix status case mismatch)
      const apiStatus = status.toLowerCase() as "present" | "absent" | "left_with_permission";

      const result = await attendanceApi.create({
        user_id: userId,
        tour_id: selectedTourId,
        date: selectedDate,
        status: apiStatus,
      });

      if (result.success) {
        // Find participant name for display
        const participant = participants.find((p) => p.id === userId);
        setAttendance((prev) => ({
          ...prev,
          [userId]: {
            user_id: userId,
            status,
            marked_at: new Date().toISOString(),
            participant_name: participant?.full_name,
          },
        }));
        toast.success("Attendance marked", {
          description: `${participant?.full_name || "Participant"} marked as ${status.replace(/_/g, " ").toLowerCase()}`,
        });
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Error", { description: "Failed to mark attendance" });
    } finally {
      setMarking(null);
    }
  };

  const handleAutoCheckIn = async () => {
    setIsAutoChecking(true);
    try {
      // Get user's current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setUserLocation(location);

      // Find selected itinerary location
      const selectedItinerary = itineraries.find((i) => i.id === String(selectedItineraryId));

      if (
        selectedItinerary &&
        selectedItinerary.locations &&
        selectedItinerary.locations.length > 0
      ) {
        // Get first location from itinerary
        const locationData = selectedItinerary.locations[0];

        if (locationData.latitude && locationData.longitude) {
          // Calculate distance
          const distance = calculateDistance(
            location.lat,
            location.lng,
            locationData.latitude,
            locationData.longitude
          );

          // Default radius is 500 meters if not specified
          const radius = 500;

          if (distance > radius) {
            toast.error("Too far", {
              description: `You are ${Math.round(distance)}m away from the location. Please move closer to auto check-in.`,
            });
            setIsAutoChecking(false);
            return;
          }
        }
      }

      // Mark all participants as present (auto check-in)
      for (const participant of participants) {
        await markAttendance(participant.id, "present");
      }

      toast.success("Auto Check-In Complete", {
        description: `All ${participants.length} participants marked as present`,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      toast.error("Error", {
        description: "Failed to get your location. Please enable location services.",
      });
    } finally {
      setIsAutoChecking(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Return in meters
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const status = attendance[p.id]?.status || "pending";
    const matchesFilter =
      statusFilter === "all" || status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: participants.length,
    present: Object.values(attendance).filter((a) => a.status?.toLowerCase() === "present").length,
    absent: Object.values(attendance).filter((a) => a.status?.toLowerCase() === "absent").length,
    permission: Object.values(attendance).filter(
      (a) => a.status?.toLowerCase() === "left_with_permission"
    ).length,
  };

  // Get dates for the last 7 days for date picker
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push({
        value: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      });
    }
    return dates;
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
            onChange={(e) => {
              setSelectedTourId(parseInt(e.target.value));
              setSelectedItineraryId(0);
              setItineraries([]);
            }}
            className="input"
          >
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Date Picker */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input pl-10"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <select
            value={selectedItineraryId}
            onChange={(e) => setSelectedItineraryId(parseInt(e.target.value))}
            className="input"
          >
            {itineraries.length === 0 ? (
              <option value={0}>No locations added</option>
            ) : (
              itineraries.map((i) => (
                <option key={i.id} value={i.id}>
                  Day {i.day_number}: {i.title || i.date}
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
              disabled={isAutoChecking || participants.length === 0}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                isAutoChecking || participants.length === 0
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
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                    <p className="text-sm text-slate-500 mt-2">Loading participants...</p>
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center">
                    <Users className="h-12 w-12 mx-auto text-slate-300" />
                    <p className="text-sm text-slate-500 mt-2">No participants found</p>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => {
                  const attendanceRecord = attendance[p.id];
                  const status = attendanceRecord?.status
                    ? attendanceRecord.status.toUpperCase()
                    : "PENDING";
                  const markedAt = attendanceRecord?.marked_at
                    ? new Date(attendanceRecord.marked_at).toLocaleTimeString()
                    : null;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{p.full_name}</p>
                        <p className="text-xs text-slate-500">{p.email}</p>
                        {markedAt && (
                          <p className="text-[10px] text-green-600 mt-1">Marked at {markedAt}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            disabled={marking === p.id}
                            onClick={() => markAttendance(p.id, "present")}
                            className={`p-2 rounded-lg transition-all ${status === "PRESENT" ? "bg-green-600 text-white" : "bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600"}`}
                            title="Mark Present"
                          >
                            <UserCheck className="h-5 w-5" />
                          </button>
                          <button
                            disabled={marking === p.id}
                            onClick={() => markAttendance(p.id, "absent")}
                            className={`p-2 rounded-lg transition-all ${status === "ABSENT" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600"}`}
                            title="Mark Absent"
                          >
                            <UserMinus className="h-5 w-5" />
                          </button>
                          <button
                            disabled={marking === p.id}
                            onClick={() => markAttendance(p.id, "left_with_permission")}
                            className={`p-2 rounded-lg transition-all ${status === "LEFT_WITH_PERMISSION" ? "bg-primary text-white" : "bg-slate-100 text-slate-400 hover:bg-primary-100 hover:text-primary-600"}`}
                            title="Left with Permission"
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
                })
              )}
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
