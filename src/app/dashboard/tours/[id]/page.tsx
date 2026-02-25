"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  Plus,
  ChevronRight,
  Hotel,
  Edit,
  Trash2,
  User,
  X,
  UserPlus,
  UserMinus,
  Loader2,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BackButton } from "@/components/BackButton";
import { PhotoGallery } from "@/components/photo-gallery";
import { AccommodationManager } from "@/components/accommodation-manager";
import { LeaderAssignment } from "@/components/LeaderAssignment";
import { SOSButton } from "@/components/SOSButton";
import {
  tourApi,
  itineraryApi,
  ItineraryData,
  tokenManager,
  budgetApi,
  type BudgetData,
} from "@/lib/api";
import { toast } from "sonner";

interface TourData {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  destination: string | null;
  price: number | null;
  status: string;
  assigned_leader_id: number | null;
  leader_name?: string | null;
  leader_email?: string | null;
  participant_count?: number;
}

interface Participant {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
}

export default function TourDetailsPage() {
  const router = useRouter();
  const { id: rawId } = useParams();
  const tourId = Array.isArray(rawId) ? rawId[0] : rawId;
  const [tour, setTour] = useState<TourData | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryData[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<TourData>>({});
  const [isParticipant, setIsParticipant] = useState(false);
  const [loadingParticipation, setLoadingParticipation] = useState(false);
  const [joiningTour, setJoiningTour] = useState(false);
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);

  // Itinerary dialog state
  const [isAddItineraryOpen, setIsAddItineraryOpen] = useState(false);
  const [newItinerary, setNewItinerary] = useState({
    title: "",
    date: "",
    start_time: "",
    end_time: "",
    description: "",
  });
  const [isSubmittingItinerary, setIsSubmittingItinerary] = useState(false);

  const fetchTourData = async () => {
    setLoading(true);
    try {
      const result = await tourApi.getById(parseInt(tourId));

      if (result.success && result.data) {
        const tourData = result.data as unknown as TourData;
        setTour(tourData);
        setEditForm(tourData);
      } else {
        console.error("Failed to fetch tour:", result.error);
      }

      // Decode JWT token to get user role and ID
      const token = tokenManager.getToken();
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          console.log("Token payload:", payload);
          setUserRole(payload.role || null);
          setUserId(payload.id || null);
        } catch (e) {
          console.error("Error parsing token:", e);
          setUserRole(null);
          setUserId(null);
        }
      } else {
        console.log("No token found in localStorage");
      }

      // Fetch itinerary items
      try {
        const itineraryResult = await itineraryApi.getAll(parseInt(tourId));
        if (itineraryResult.success && itineraryResult.data) {
          setItinerary(itineraryResult.data);
        }
      } catch (err) {
        console.error("Error fetching itinerary:", err);
        setItinerary([]);
      }

      // Fetch budget data
      try {
        setLoadingBudget(true);
        const budgetResult = await budgetApi.getByTourId(parseInt(tourId));
        if (budgetResult.success && budgetResult.data) {
          // Handle both array and single object responses
          const budgetData = Array.isArray(budgetResult.data)
            ? budgetResult.data[0]
            : budgetResult.data;
          setBudget(budgetData);
        }
      } catch (err) {
        console.error("Error fetching budget:", err);
        setBudget(null);
      } finally {
        setLoadingBudget(false);
      }
    } catch (error) {
      console.error("Error fetching tour data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipation = async () => {
    if (!userId) return;
    setLoadingParticipation(true);
    try {
      const result = await tourApi.checkParticipation(parseInt(tourId));
      if (result.success && result.data) {
        setIsParticipant(result.data.isParticipant);
      }
    } catch (err) {
      console.error("Error checking participation:", err);
    } finally {
      setLoadingParticipation(false);
    }
  };

  const fetchParticipants = async () => {
    setLoadingParticipants(true);
    try {
      const token = tokenManager.getToken();
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/tours/${tourId}/participants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await result.json();
      if (data.success && data.data) {
        setParticipants(data.data);
      }
    } catch (err) {
      console.error("Error fetching participants:", err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  useEffect(() => {
    fetchTourData();
  }, [tourId]);

  useEffect(() => {
    if (userId) {
      fetchParticipation();
    }
  }, [userId, tourId]);

  useEffect(() => {
    if (activeTab === "participants") {
      fetchParticipants();
    }
  }, [activeTab]);

  const handleJoinTour = async () => {
    console.log("handleJoinTour called, tourId:", tourId);
    alert("Joining tour... ID: " + tourId);
    setJoiningTour(true);
    try {
      const result = await tourApi.join(parseInt(tourId));
      console.log("Join result:", result);
      if (result.success) {
        setIsParticipant(true);
        toast.success("Successfully joined the tour!");
        fetchTourData();
      } else {
        console.error("Join failed:", result.error);
        alert(result.error || "Failed to join tour");
      }
    } catch (err) {
      console.error("Join error:", err);
      alert("Failed to join tour - check console");
    } finally {
      setJoiningTour(false);
    }
  };

  const handleLeaveTour = async () => {
    if (!confirm("Are you sure you want to leave this tour?")) return;

    setJoiningTour(true);
    try {
      const result = await tourApi.leave(parseInt(tourId));
      if (result.success) {
        setIsParticipant(false);
        toast.success("Successfully left the tour");
        fetchTourData();
      } else {
        toast.error(result.error || "Failed to leave tour");
      }
    } catch (err) {
      toast.error("Failed to leave tour");
    } finally {
      setJoiningTour(false);
    }
  };

  const handleEditTour = async () => {
    try {
      const result = await tourApi.update(
        parseInt(tourId),
        editForm as unknown as Parameters<typeof tourApi.update>[1]
      );

      if (result.success) {
        setTour((prev) => (prev ? { ...prev, ...editForm } : prev));
        setIsEditing(false);
        alert("Tour updated successfully.");
      } else {
        console.error("Error updating tour:", result.error);
        alert(`Failed to update tour: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating tour:", error);
      alert("Failed to update tour. Please try again.");
    }
  };

  const handleDeleteTour = async () => {
    if (!confirm("Are you sure you want to delete this tour? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await tourApi.delete(parseInt(tourId));

      if (result.success) {
        alert("Tour deleted successfully.");
        router.push("/dashboard/tours");
      } else {
        console.error("Error deleting tour:", result.error);
        alert(`Failed to delete tour: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting tour:", error);
      alert("Failed to delete tour. Please try again.");
    }
  };

  const handleAddItinerary = async () => {
    if (!newItinerary.title || !newItinerary.date) {
      alert("Please fill in the required fields");
      return;
    }

    setIsSubmittingItinerary(true);
    try {
      const result = await itineraryApi.create({
        tour_id: parseInt(tourId),
        title: newItinerary.title,
        date: newItinerary.date,
        start_time: newItinerary.start_time || undefined,
        end_time: newItinerary.end_time || undefined,
        description: newItinerary.description || undefined,
      });

      if (result.success) {
        alert("Itinerary item added successfully!");
        setIsAddItineraryOpen(false);
        setNewItinerary({
          title: "",
          date: "",
          start_time: "",
          end_time: "",
          description: "",
        });
        fetchTourData();
      } else {
        console.error("Error adding itinerary:", result.error);
        alert(`Failed to add itinerary: ${result.error}`);
      }
    } catch (error) {
      console.error("Error adding itinerary:", error);
      alert("Failed to add itinerary. Please try again.");
    } finally {
      setIsSubmittingItinerary(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading tour details...</div>;
  if (!tour) return <div className="p-8 text-center">Tour not found.</div>;

  const isAdmin = userRole === "admin";
  const isGuide = userRole === "guide";
  const canManageTour = isAdmin || isGuide;
  const canJoinTour = !isAdmin && userRole !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackButton className="mb-0" />
          <div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-2xl font-bold text-slate-800 border rounded px-2 py-1"
                  placeholder="Tour Name"
                />
                <input
                  type="text"
                  value={editForm.destination || ""}
                  onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                  className="text-slate-500 border rounded px-2 py-1"
                  placeholder="Destination"
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-800">{tour.name}</h2>
                <p className="text-slate-500 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" /> {tour.destination || "No destination"} •
                  <Calendar className="h-4 w-4 ml-2 mr-1" />{" "}
                  {tour.start_date ? new Date(tour.start_date).toLocaleDateString() : "No date"}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Join/Leave Tour Button for non-admin users (tourists and guides) */}
          {canJoinTour && !loadingParticipation && (
            <button
              onClick={isParticipant ? handleLeaveTour : handleJoinTour}
              disabled={joiningTour}
              className={`flex items-center px-4 py-2 rounded-lg font-bold transition-all ${
                isParticipant
                  ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                  : "bg-green-600 text-white hover:bg-green-700"
              } disabled:opacity-50`}
            >
              {joiningTour ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isParticipant ? (
                <UserMinus className="h-4 w-4 mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {isParticipant ? "Leave Tour" : "Join Tour"}
            </button>
          )}
          {isAdmin && (
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button onClick={handleEditTour} className="btn-primary">
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(tour);
                    }}
                    className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Tour
                  </button>
                  <button
                    onClick={handleDeleteTour}
                    className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Tour
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Participation Status Banner */}
      {canJoinTour && isParticipant && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <User className="h-5 w-5 text-green-600" />
          <span className="text-green-700 font-medium">You are a participant of this tour</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: "overview", label: "Overview" },
            { id: "leader", label: "Leader", icon: User, adminOnly: true },
            { id: "participants", label: "Participants", icon: Users },
            { id: "itinerary", label: "Itinerary" },
            { id: "accommodation", label: "Accommodation", icon: Hotel },
            { id: "attendance", label: "Attendance" },
            { id: "budget", label: "Budget" },
            { id: "safety", label: "Safety" },
            { id: "gallery", label: "Gallery" },
            { id: "documents", label: "Documents" },
          ]
            .filter((tab) => !tab.adminOnly || isAdmin)
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }
                `}
              >
                {tab.icon ? (
                  <span className="flex items-center">
                    <tab.icon className="h-4 w-4 mr-1.5" /> {tab.label}
                  </span>
                ) : (
                  tab.label
                )}
              </button>
            ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold mb-4">Tour Information</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="font-medium capitalize">{tour.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Start Date</dt>
                  <dd className="font-medium">
                    {tour.start_date ? new Date(tour.start_date).toLocaleDateString() : "Not set"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">End Date</dt>
                  <dd className="font-medium">
                    {tour.end_date ? new Date(tour.end_date).toLocaleDateString() : "Not set"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Price per Person</dt>
                  <dd className="font-medium">${Number(tour.price ?? 0).toFixed(2)}</dd>
                </div>
                {tour.leader_name && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Assigned Leader</dt>
                    <dd className="font-medium">{tour.leader_name}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-500">Participants</dt>
                  <dd className="font-medium">{tour.participant_count || 0}</dd>
                </div>
              </dl>
            </div>
            {tour.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-slate-600">{tour.description}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "leader" && isAdmin && (
          <div className="max-w-2xl">
            <LeaderAssignment
              tourId={tour.id}
              currentLeaderId={tour.assigned_leader_id}
              currentLeaderName={tour.leader_name}
              currentLeaderEmail={tour.leader_email}
              onAssignmentChange={fetchTourData}
            />
          </div>
        )}

        {activeTab === "participants" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tour Participants</h3>
            {loadingParticipants ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
              </div>
            ) : participants.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-slate-200">
                <Users className="h-12 w-12 text-slate-300 mx-auto" />
                <p className="mt-2 text-slate-500">No participants yet.</p>
                <p className="text-sm text-slate-400">
                  Tourists can join this tour from the overview tab.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-600">
                        {participant.full_name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {participant.full_name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500">{participant.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "itinerary" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Itinerary Items</h3>
              {canManageTour && (
                <button
                  onClick={() => setIsAddItineraryOpen(true)}
                  className="flex items-center text-sm btn-primary"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Location
                </button>
              )}
            </div>

            {itinerary.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-slate-200">
                <Clock className="h-12 w-12 text-slate-300 mx-auto" />
                <p className="mt-2 text-slate-500">No itinerary items yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {itinerary.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded">
                          {item.date ? new Date(item.date).toLocaleDateString() : "No date"}
                        </span>
                        <h4 className="font-bold text-slate-800">{item.title}</h4>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {item.start_time && item.end_time
                          ? `${item.start_time} - ${item.end_time}`
                          : item.description || "No description"}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "accommodation" && (
          <AccommodationManager tourId={tourId} canManage={canManageTour} />
        )}

        {activeTab === "attendance" && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold mb-4">Quick Attendance</h3>
            <p className="text-slate-500 text-sm mb-6">Track presence for today's locations.</p>
            <Link
              href={`/dashboard/attendance?tourId=${tourId}`}
              className="text-primary-600 font-medium hover:underline"
            >
              Go to Full Attendance Module →
            </Link>
          </div>
        )}

        {activeTab === "budget" && (
          <div className="space-y-6">
            {loadingBudget ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
              </div>
            ) : budget ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold mb-4 text-slate-800">Budget Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-slate-500">Total Budget</span>
                    <span className="font-bold text-slate-900 text-xl">
                      ${Number(budget.total_amount ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-slate-500">Spent Amount</span>
                    <span className="font-semibold text-slate-900">
                      ${Number(budget.spent_amount ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500">Remaining</span>
                    <span className="font-semibold text-green-600">
                      ${Number((budget.total_amount ?? 0) - (budget.spent_amount ?? 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-500 block">Per Participant Fee</span>
                      <span className="font-semibold text-slate-900">
                        ${Number(budget.per_participant_fee ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-500 block">Currency</span>
                      <span className="font-semibold text-slate-900">
                        {budget.currency ?? "INR"}
                      </span>
                    </div>
                  </div>
                  {budget.description && (
                    <div className="pt-4 border-t">
                      <span className="text-sm text-slate-500 block">Description</span>
                      <p className="text-slate-700 mt-1">{budget.description}</p>
                    </div>
                  )}
                </div>
                <Link
                  href="/dashboard/budget"
                  className="mt-6 block text-center text-sm font-semibold bg-slate-50 py-2 rounded-lg hover:bg-slate-100"
                >
                  Manage Expenses
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-500">No budget set for this tour yet.</p>
                <p className="text-sm text-slate-400 mt-1">
                  Add budget details when creating a tour or set it up here.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "safety" && (
          <div className="bg-red-50 rounded-xl p-6 border border-red-100">
            <div className="flex items-center space-x-2 text-red-700 mb-4">
              <AlertCircle className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Emergency & Safety</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Quick access to SOS and incident reporting.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <SOSButton tourId={tour.id} />
              <button className="bg-white text-red-600 border border-red-200 font-bold py-3 rounded-lg hover:bg-red-50 transition-colors">
                REPORT INCIDENT
              </button>
            </div>
          </div>
        )}

        {activeTab === "gallery" && <PhotoGallery tourId={tourId} />}

        {activeTab === "documents" && (
          <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-500">Document vault feature coming soon.</p>
          </div>
        )}
      </div>

      {/* Add Itin
      
      
      Dialog */}
      <Dialog open={isAddItineraryOpen} onOpenChange={setIsAddItineraryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Itinerary Item</DialogTitle>
            <DialogDescription>
              Add a new location or activity to the tour itinerary.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={newItinerary.title}
                onChange={(e) => setNewItinerary({ ...newItinerary, title: e.target.value })}
                placeholder="e.g., Visit Eiffel Tower"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Date *</label>
              <Input
                type="date"
                value={newItinerary.date}
                onChange={(e) => setNewItinerary({ ...newItinerary, date: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={newItinerary.start_time}
                  onChange={(e) => setNewItinerary({ ...newItinerary, start_time: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  value={newItinerary.end_time}
                  onChange={(e) => setNewItinerary({ ...newItinerary, end_time: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newItinerary.description}
                onChange={(e) => setNewItinerary({ ...newItinerary, description: e.target.value })}
                placeholder="Additional details about this activity..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddItineraryOpen(false)}
              disabled={isSubmittingItinerary}
            >
              Cancel
            </Button>
            <Button onClick={handleAddItinerary} disabled={isSubmittingItinerary}>
              {isSubmittingItinerary ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
