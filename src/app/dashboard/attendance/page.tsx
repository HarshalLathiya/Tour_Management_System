'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, CheckCircle, XCircle, Clock, Search,
  ChevronDown, Filter, UserCheck, UserMinus, AlertTriangle
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AttendanceContent() {
  const searchParams = useSearchParams();
  const initialTourId = searchParams.get('tourId');

  const [tours, setTours] = useState<any[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string>(initialTourId || '');
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [selectedItineraryId, setSelectedItineraryId] = useState<string>('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: tourData } = await supabase
        .from('tours')
        .select('id, name')
        .order('created_at', { ascending: false });
      
      setTours(tourData || []);
      if (!selectedTourId && tourData && tourData.length > 0) {
        setSelectedTourId(tourData[0].id);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedTourId) return;

    const fetchTourDetails = async () => {
      setLoading(true);
      // Fetch itineraries
      const { data: itineraryData } = await supabase
        .from('itineraries')
        .select('*')
        .eq('tour_id', selectedTourId)
        .order('day_number', { ascending: true })
        .order('sequence_order', { ascending: true });
      
      setItineraries(itineraryData || []);
      if (itineraryData && itineraryData.length > 0) {
        setSelectedItineraryId(itineraryData[0].id);
      } else {
        setSelectedItineraryId('');
      }

      // Fetch participants
      const { data: participantData } = await supabase
        .from('tour_participants')
        .select(`
          user_id,
          profiles:user_id (id, full_name, email)
        `)
        .eq('tour_id', selectedTourId)
        .eq('role', 'PARTICIPANT');

      setParticipants(participantData?.map(p => p.profiles) || []);
      setLoading(false);
    };

    fetchTourDetails();
  }, [selectedTourId]);

  useEffect(() => {
    if (!selectedItineraryId) {
      setAttendance({});
      return;
    }

    const fetchAttendance = async () => {
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('itinerary_id', selectedItineraryId);
      
      const attendanceMap: Record<string, any> = {};
      data?.forEach(record => {
        attendanceMap[record.user_id] = record;
      });
      setAttendance(attendanceMap);
    };

    fetchAttendance();
  }, [selectedItineraryId]);

  const markAttendance = async (userId: string, status: string) => {
    setMarking(userId);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('attendance')
      .upsert({
        itinerary_id: selectedItineraryId,
        user_id: userId,
        status: status,
        marked_by: user?.id,
        marked_at: new Date().toISOString()
      }, { onConflict: 'itinerary_id,user_id' });

    if (!error) {
      setAttendance(prev => ({
        ...prev,
        [userId]: { status, marked_at: new Date().toISOString() }
      }));
    }
    setMarking(null);
  };

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const status = attendance[p.id]?.status || 'PENDING';
    const matchesFilter = statusFilter === 'all' || status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: participants.length,
    present: Object.values(attendance).filter(a => a.status === 'PRESENT').length,
    absent: Object.values(attendance).filter(a => a.status === 'ABSENT').length,
    permission: Object.values(attendance).filter(a => a.status === 'LEFT_WITH_PERMISSION').length,
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
            onChange={(e) => setSelectedTourId(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {tours.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select 
            value={selectedItineraryId} 
            onChange={(e) => setSelectedItineraryId(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {itineraries.length === 0 ? (
              <option value="">No locations added</option>
            ) : (
              itineraries.map(i => (
                <option key={i.id} value={i.id}>Day {i.day_number}: {i.location_name}</option>
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
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
          <p className="text-xs font-bold text-blue-600 uppercase">Pending</p>
          <p className="text-2xl font-bold text-blue-700">{stats.total - (stats.present + stats.absent + stats.permission)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'present', 'absent', 'pending'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === f ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Participant</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Actions</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParticipants.map((p) => {
                const status = attendance[p.id]?.status || 'PENDING';
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
                          onClick={() => markAttendance(p.id, 'PRESENT')}
                          className={`p-2 rounded-lg transition-all ${status === 'PRESENT' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600'}`}
                        >
                          <UserCheck className="h-5 w-5" />
                        </button>
                        <button 
                          disabled={marking === p.id}
                          onClick={() => markAttendance(p.id, 'ABSENT')}
                          className={`p-2 rounded-lg transition-all ${status === 'ABSENT' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600'}`}
                        >
                          <UserMinus className="h-5 w-5" />
                        </button>
                        <button 
                          disabled={marking === p.id}
                          onClick={() => markAttendance(p.id, 'LEFT_WITH_PERMISSION')}
                          className={`p-2 rounded-lg transition-all ${status === 'LEFT_WITH_PERMISSION' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-600'}`}
                        >
                          <Clock className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                        status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                        status === 'LEFT_WITH_PERMISSION' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {status.replace(/_/g, ' ')}
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
