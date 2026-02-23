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
import { tourApi, itineraryApi, ItineraryData } from "@/lib/api";

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
}

export default function TourDetailsPage() {
  const router = useRouter();
  const { id: rawId } = useParams();
  const tourId = Array.isArray(rawId) ? rawId[0] : rawId;
  const [tour, setTour] = useState<TourData | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<TourData>>({});

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

      // Decode JWT token to get user role
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUserRole(payload.role || null);
        } catch {
          setUserRole(null);
        }
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
    } catch (error) {
      console.error("Error fetching tour data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourData();
  }, [tourId]);

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

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: "overview", label: "Overview" },
            { id: "leader", label: "Leader", icon: User, adminOnly: true },
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

        {activeTab === "itinerary" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Itinerary Items</h3>
              <button
                onClick={() => setIsAddItineraryOpen(true)}
                className="flex items-center text-sm btn-primary"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Location
              </button>
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

        {activeTab === "accommodation" && <AccommodationManager tourId={tourId} />}

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
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Budget Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-slate-500">Price per Person</span>
                  <span className="font-bold text-slate-900">
                    ${Number(tour.price ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <Link
                href="/dashboard/budget"
                className="mt-6 block text-center text-sm font-semibold bg-slate-50 py-2 rounded-lg hover:bg-slate-100"
              >
                Manage Expenses
              </Link>
            </div>
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

      {/* Add Itinerary Dialog */}
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
