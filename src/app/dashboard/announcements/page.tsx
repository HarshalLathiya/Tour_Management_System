'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Bell, Send, CheckCircle2, AlertCircle, 
  Search, Loader2, User, Clock, Check
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';

export default function AnnouncementsPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string>('');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', content: '' });

  useEffect(() => {
    const fetchInitial = async () => {
      // For now, mock a user profile since we are moving away from Supabase Auth in this session
      setProfile({ id: 1, full_name: 'Admin User', role: 'ORG_ADMIN' });

      try {
        const response = await fetch('http://localhost:5000/api/tours');
        if (response.ok) {
          const tourData = await response.json();
          setTours(tourData || []);
          if (tourData && tourData.length > 0) {
            setSelectedTourId(tourData[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (!selectedTourId) return;

    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/announcements?tour_id=${selectedTourId}`);
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data || []);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
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
      const response = await fetch('http://localhost:5000/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tour_id: selectedTourId,
          title: newAnn.title || 'Tour Update',
          content: newAnn.content
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements([{ ...data, profiles: { full_name: profile?.full_name }, announcement_reads: [] }, ...announcements]);
        setNewAnn({ title: '', content: '' });
      }
    } catch (error) {
      console.error('Error posting announcement:', error);
    } finally {
      setPosting(false);
    }
  };

  const markAsRead = async (annId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('announcement_reads')
      .upsert({ announcement_id: annId, user_id: user.id });

    if (!error) {
      setAnnouncements(announcements.map(ann => {
        if (ann.id === annId) {
          const reads = ann.announcement_reads || [];
          if (!reads.some((r: any) => r.user_id === user.id)) {
            return { ...ann, announcement_reads: [...reads, { user_id: user.id }] };
          }
        }
        return ann;
      }));
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
          onChange={(e) => setSelectedTourId(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        >
          {tours.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Post Form - Only for Leaders/Admins */}
          {(profile?.role === 'TOUR_LEADER' || profile?.role === 'ORG_ADMIN') && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b flex items-center space-x-2">
                <Send className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">New Broadcast</h3>
              </div>
              <form onSubmit={handlePost} className="p-6 space-y-4">
                <input 
                  type="text" 
                  placeholder="Subject (e.g. Assembly Reminder)"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                  value={newAnn.title}
                  onChange={e => setNewAnn({...newAnn, title: e.target.value})}
                />
                <textarea 
                  required
                  placeholder="Type your message to all participants..."
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[100px]"
                  value={newAnn.content}
                  onChange={e => setNewAnn({...newAnn, content: e.target.value})}
                />
                <div className="flex justify-end">
                  <button 
                    disabled={posting || !newAnn.content}
                    className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center"
                  >
                    {posting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Broadcast Message
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Recent Announcements</h3>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
            ) : announcements.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-2xl border border-dashed text-slate-400">
                <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No announcements yet for this tour.</p>
              </div>
            ) : (
              announcements.map(ann => {
                const hasRead = ann.announcement_reads?.some((r: any) => r.user_id === profile?.id);
                return (
                  <div key={ann.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 hover:border-blue-200 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{ann.profiles?.full_name}</p>
                          <p className="text-xs text-slate-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> {new Date(ann.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {!hasRead && profile?.role === 'PARTICIPANT' && (
                        <button 
                          onClick={() => markAsRead(ann.id)}
                          className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
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
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <span className="text-sm font-bold text-blue-700">Total Broadcasts</span>
                <span className="text-xl font-black text-blue-800">{announcements.length}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Announcements are real-time. Participants receive push notifications and must acknowledge urgent updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
