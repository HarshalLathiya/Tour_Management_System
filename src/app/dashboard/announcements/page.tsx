"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Search,
  Loader2,
  User,
  Clock,
  Check,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { tourApi, announcementApi, api, tokenManager } from "@/lib/api";
import type { TourData, AnnouncementData } from "@/lib/api";
import type { Tour } from "@/types";

interface AnnouncementWithMeta extends AnnouncementData {
  profiles?: { full_name: string };
  announcement_reads?: { user_id: number }[];
}

interface UserProfile {
  id: number;
  full_name: string;
  role: string;
}

export default function AnnouncementsPage() {
  const [tours, setTours] = useState<TourData[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<number>(0);
  const [announcements, setAnnouncements] = useState<AnnouncementWithMeta[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: "", content: "" });

  useEffect(() => {
    const fetchInitial = async () => {
      // Get user from token
      const decoded = tokenManager.decodeToken();
      if (decoded) {
        setProfile({ id: decoded.id, full_name: decoded.email, role: decoded.role });
      }

      try {
        const result = await tourApi.getAll();
        if (result.success && result.data) {
          setTours(result.data);
          if (result.data.length > 0) {
            setSelectedTourId(result.data[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (!selectedTourId) return;

    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const result = await api.get<AnnouncementWithMeta[]>(
          `/announcements?tour_id=${selectedTourId}`
        );
        if (result.success && result.data) {
          setAnnouncements(result.data);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [selectedTourId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnn.content) return;
    setPosting(true);

    try {
      const result = await announcementApi.create({
        tour_id: selectedTourId,
        title: newAnn.title || "Tour Update",
        content: newAnn.content,
      });

      if (result.success && result.data) {
        setAnnouncements([
          {
            ...result.data,
            profiles: { full_name: profile?.full_name || "" },
            announcement_reads: [],
          },
          ...announcements,
        ]);
        setNewAnn({ title: "", content: "" });
      }
    } catch (error) {
      console.error("Error posting announcement:", error);
    } finally {
      setPosting(false);
    }
  };

  const markAsRead = async (annId: number) => {
    if (!profile) return;
    try {
      await api.post(`/announcements/${annId}/read`, { user_id: profile.id });
      setAnnouncements(
        announcements.map((ann) => {
          if (ann.id === annId) {
            const reads = ann.announcement_reads || [];
            if (!reads.some((r: { user_id: number }) => r.user_id === profile.id)) {
              return { ...ann, announcement_reads: [...reads, { user_id: profile.id }] };
            }
          }
          return ann;
        })
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Communication Center</h2>
          <p className="text-slate-500">Official broadcasts and headcount acknowledgments.</p>
        </div>
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
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Post Form - Only for Leaders/Admins */}
          {(profile?.role === "TOUR_LEADER" || profile?.role === "ORG_ADMIN") && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b flex items-center space-x-2">
                <Send className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  New Broadcast
                </h3>
              </div>
              <form onSubmit={handlePost} className="p-6 space-y-4">
                <input
                  type="text"
                  placeholder="Subject (e.g. Assembly Reminder)"
                  className="input font-semibold"
                  value={newAnn.title}
                  onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                />
                <textarea
                  required
                  placeholder="Type your message to all participants..."
                  className="input min-h-[100px]"
                  value={newAnn.content}
                  onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                />
                <div className="flex justify-end">
                  <button
                    disabled={posting || !newAnn.content}
                    className="btn-primary disabled:opacity-50"
                  >
                    {posting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Broadcast Message
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Recent Announcements</h3>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-2xl border border-dashed text-slate-400">
                <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No announcements yet for this tour.</p>
              </div>
            ) : (
              announcements.map((ann) => {
                const hasRead = ann.announcement_reads?.some((r) => r.user_id === profile?.id);
                return (
                  <div
                    key={ann.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 hover:border-primary-200 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{ann.profiles?.full_name}</p>
                          <p className="text-xs text-slate-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />{" "}
                            {new Date(ann.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {!hasRead && profile?.role === "PARTICIPANT" && (
                        <button
                          onClick={() => markAsRead(ann.id)}
                          className="text-xs font-bold text-primary bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100"
                        >
                          Mark as Read
                        </button>
                      )}
                      {hasRead && (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Read
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{ann.title}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{ann.content}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-400 font-semibold">
                        <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                        {ann.announcement_reads?.length || 0} participants acknowledged
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
                <span className="text-sm font-bold text-primary-700">Total Broadcasts</span>
                <span className="text-xl font-black text-primary-800">{announcements.length}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Announcements are real-time. Participants receive push notifications and must
                acknowledge urgent updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
