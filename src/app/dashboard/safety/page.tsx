"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Phone,
  MapPin,
  Loader2,
  Clock,
  X,
  AlertCircle,
  Users,
} from "lucide-react";
import { tourApi, incidentApi, type TourData } from "@/lib/api";
import { PageHeader, LoadingCard, ErrorMessage } from "@/components/features";

interface SafetyIncident {
  id: number;
  tour_id: number;
  title: string;
  description?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: string;
  location?: string;
  created_at: string;
  profiles?: { full_name?: string };
}

interface SafetyParticipant {
  id: string;
  user_id: string;
  profiles?: {
    full_name?: string;
    medical_info_url?: string;
    health_notes?: string;
    dietary_requirements?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
  };
}

export default function SafetyPage() {
  const [tours, setTours] = useState<TourData[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<SafetyParticipant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportForm, setReportForm] = useState({ title: "", description: "", location: "" });
  const [reportingSeverity, setReportingSeverity] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined
  >("LOW");

  const filteredParticipants = participants.filter((p) =>
    p.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchTours = async () => {
      const result = await tourApi.getAll();
      if (result.success && result.data) {
        setTours(result.data);
        if (result.data.length > 0) {
          setSelectedTourId(result.data[0].id);
        }
      } else {
        setError(result.error || "Failed to load tours");
      }
    };
    fetchTours();
  }, []);

  useEffect(() => {
    if (!selectedTourId) return;

    const fetchSafetyData = async () => {
      setLoading(true);
      setError(null);

      const result = await incidentApi.getAll(selectedTourId);
      if (result.success && result.data) {
        setIncidents(result.data);
      } else {
        setError(result.error || "Failed to load incidents");
      }

      setLoading(false);
    };

    fetchSafetyData();
  }, [selectedTourId]);

  const triggerSOS = async () => {
    if (!selectedTourId) return;

    const result = await incidentApi.triggerSOS({
      tour_id: selectedTourId,
      description: "Automatic SOS alert triggered by user.",
    });

    if (result.success && result.data) {
      setIncidents([result.data, ...incidents]);
      alert("CRITICAL SOS ALERT SENT TO ALL COORDINATORS!");
    } else {
      alert(result.error || "Failed to trigger SOS");
    }
  };

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourId) return;

    const result = await incidentApi.create({
      tour_id: selectedTourId,
      title: reportForm.title,
      description: reportForm.description,
      location: reportForm.location,
      severity: reportingSeverity,
    });

    if (result.success && result.data) {
      setIncidents([result.data, ...incidents]);
      setIsReporting(false);
      setReportForm({ title: "", description: "", location: "" });
    } else {
      setError(result.error || "Failed to report incident");
    }
  };

  const resolveIncident = async (id: number) => {
    const result = await incidentApi.resolve(id, "Resolved by user");

    if (result.success) {
      setIncidents(incidents.map((inc) => (inc.id === id ? { ...inc, status: "RESOLVED" } : inc)));
    } else {
      setError(result.error || "Failed to resolve incident");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Safety & Emergency</h2>
          <p className="text-slate-500">Real-time incident tracking and SOS management.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedTourId ?? ""}
            onChange={(e) => setSelectedTourId(parseInt(e.target.value))}
            className="input px-3 py-2 text-sm shadow-sm"
          >
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            onClick={triggerSOS}
            className="flex items-center justify-center rounded-lg bg-red-600 px-6 py-2 text-sm font-black text-white shadow-lg shadow-red-200 hover:bg-red-700 transition-all animate-pulse"
          >
            <ShieldAlert className="mr-2 h-4 w-4" /> SOS TRIGGER
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Incident Log</h3>
              <button
                onClick={() => setIsReporting(true)}
                className="text-sm font-bold text-primary flex items-center hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-all"
              >
                <Plus className="h-4 w-4 mr-1" /> New Log
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                </div>
              ) : incidents.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>All clear. No incidents reported.</p>
                </div>
              ) : (
                incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className={`p-6 flex items-start space-x-4 transition-colors ${incident.status === "OPEN" ? "bg-white" : "bg-slate-50 opacity-60"}`}
                  >
                    <div
                      className={`p-3 rounded-2xl ${
                        incident.severity === "CRITICAL"
                          ? "bg-red-100 text-red-600"
                          : incident.severity === "HIGH"
                            ? "bg-orange-100 text-orange-600"
                            : incident.severity === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-primary-100 text-primary-600"
                      }`}
                    >
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4
                            className={`text-sm font-black uppercase tracking-wider ${
                              incident.severity === "CRITICAL" ? "text-red-600" : "text-slate-500"
                            }`}
                          >
                            {incident.severity} SEVERITY • {incident.status}
                          </h4>
                          <h3 className="text-lg font-bold text-slate-800 mt-0.5">
                            {incident.title}
                          </h3>
                        </div>
                        <span className="text-xs font-bold text-slate-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />{" "}
                          {new Date(incident.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                        {incident.description}
                      </p>
                      {incident.location && (
                        <p className="text-xs text-slate-400 mt-2 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" /> {incident.location}
                        </p>
                      )}
                      <div className="mt-4 flex items-center space-x-4">
                        {incident.status === "OPEN" ? (
                          <button
                            onClick={() => resolveIncident(incident.id)}
                            className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-all"
                          >
                            Mark as Resolved
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-green-700 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Resolved
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          Reported by: {incident.profiles?.full_name || "System"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Participant Health Registry
            </h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search health notes..."
                className="input pl-10 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredParticipants.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No health records found.</p>
              ) : (
                filteredParticipants.map((p) => (
                  <div
                    key={p.user_id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 text-sm">{p.profiles?.full_name}</h4>
                      <div className="flex gap-2">
                        {p.profiles?.medical_info_url && (
                          <a
                            href={p.profiles.medical_info_url}
                            target="_blank"
                            className="text-primary hover:underline text-[10px] font-bold"
                          >
                            DOCS
                          </a>
                        )}
                      </div>
                    </div>

                    {p.profiles?.health_notes && (
                      <div className="flex items-start mb-2">
                        <AlertCircle className="h-3 w-3 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-slate-600 italic leading-tight">
                          {p.profiles.health_notes}
                        </p>
                      </div>
                    )}

                    {p.profiles?.dietary_requirements && (
                      <div className="flex items-center mb-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase">
                          Diet: {p.profiles.dietary_requirements}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-slate-200">
                      <p className="text-[10px] text-slate-400 font-medium">Emergency Contact:</p>
                      <p className="text-xs font-bold text-slate-700">
                        {p.profiles?.emergency_contact_name}: {p.profiles?.emergency_contact_phone}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
            <h3 className="text-lg font-bold flex items-center mb-6">
              <Phone className="mr-2 h-5 w-5 text-red-500" /> Emergency Contacts
            </h3>
            <div className="space-y-6">
              <div className="group">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Local Emergency
                </p>
                <p className="text-2xl font-black group-hover:text-red-400 transition-colors">
                  112 / 100
                </p>
              </div>
              <div className="h-px bg-slate-800"></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Control Room
                </p>
                <p className="text-lg font-bold">+1 (555) 000-9111</p>
              </div>
              <div className="h-px bg-slate-800"></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Nearest Medical
                </p>
                <p className="text-sm font-bold">St. Mary General Hospital</p>
                <p className="text-xs text-slate-500 mt-1">Distance: 2.4km • Open 24/7</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Medical Lookup</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Quickly find hospitals, clinics, and pharmacies near your current itinerary stop.
            </p>
            <button className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center justify-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" /> Open Map View
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {isReporting && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Log Safety Incident</h3>
                <p className="text-sm text-slate-500">Document any issues for accountability.</p>
              </div>
              <button
                onClick={() => setIsReporting(false)}
                className="p-2 hover:bg-slate-200 rounded-full"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleReportIncident} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Incident Title
                  </label>
                  <input
                    required
                    className="input"
                    value={reportForm.title}
                    onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                    placeholder="Brief summary..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Severity</label>
                  <select
                    className="input"
                    value={reportingSeverity}
                    onChange={(e) =>
                      setReportingSeverity(e.target.value as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                  <input
                    className="input"
                    value={reportForm.location}
                    onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                    placeholder="Where?"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  className="input min-h-[120px]"
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  placeholder="Detailed description of what happened..."
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 transition-all flex items-center justify-center"
                >
                  <AlertCircle className="h-4 w-4 mr-2" /> Log Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
