'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Hotel, Plus, Trash2, UserPlus, 
  MapPin, Phone, Calendar, Loader2,
  X, Check
} from 'lucide-react';

interface Accommodation {
  id: string;
  name: string;
  address: string;
  check_in_date: string;
  check_out_date: string;
  contact_number: string;
}

interface RoomAssignment {
  id: string;
  accommodation_id: string;
  user_id: string;
  room_number: string;
  room_type: string;
  notes: string;
  profile: {
    full_name: string;
  };
}

export function AccommodationManager({ tourId }: { tourId: string }) {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);

  const [newAcc, setNewAcc] = useState({
    name: '',
    address: '',
    check_in_date: '',
    check_out_date: '',
    contact_number: ''
  });

  const [newAssign, setNewAssign] = useState({
    user_id: '',
    room_number: '',
    room_type: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [tourId]);

  const fetchData = async () => {
    setLoading(true);
    const { data: accData } = await supabase
      .from('accommodations')
      .select('*')
      .eq('tour_id', tourId);
    
    setAccommodations(accData || []);

    const { data: assignData } = await supabase
      .from('room_assignments')
      .select(`
        *,
        profile:profiles(full_name)
      `)
      .in('accommodation_id', (accData || []).map(a => a.id));
    
    setAssignments(assignData || []);

    const { data: partData } = await supabase
      .from('tour_participants')
      .select('user_id, profiles(full_name)')
      .eq('tour_id', tourId);
    
    setParticipants(partData || []);
    setLoading(false);
  };

  const handleAddAccommodation = async () => {
    const { error } = await supabase
      .from('accommodations')
      .insert([{ ...newAcc, tour_id: tourId }]);
    
    if (!error) {
      setShowAddModal(false);
      setNewAcc({ name: '', address: '', check_in_date: '', check_out_date: '', contact_number: '' });
      fetchData();
    }
  };

  const handleAddAssignment = async (accommodationId: string) => {
    const { error } = await supabase
      .from('room_assignments')
      .insert([{ ...newAssign, accommodation_id: accommodationId }]);
    
    if (!error) {
      setShowAssignModal(null);
      setNewAssign({ user_id: '', room_number: '', room_type: '', notes: '' });
      fetchData();
    }
  };

  const handleDeleteAccommodation = async (id: string) => {
    if (confirm('Are you sure you want to delete this accommodation?')) {
      await supabase.from('accommodations').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800 flex items-center">
          <Hotel className="mr-2 h-5 w-5 text-blue-600" />
          Accommodation & Stays
        </h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Hotel/Stay
        </button>
      </div>

      <div className="grid gap-6">
        {accommodations.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <Hotel className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No accommodations recorded for this tour yet.</p>
          </div>
        ) : (
          accommodations.map(acc => (
            <div key={acc.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{acc.name}</h4>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                      <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1" /> {acc.address}</span>
                      <span className="flex items-center"><Phone className="h-3.5 w-3.5 mr-1" /> {acc.contact_number}</span>
                      <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1" /> {new Date(acc.check_in_date).toLocaleDateString()} - {new Date(acc.check_out_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteAccommodation(acc.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">Room Assignments</h5>
                  <button 
                    onClick={() => setShowAssignModal(acc.id)}
                    className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-700"
                  >
                    <UserPlus className="h-4 w-4 mr-1" /> Assign Room
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {assignments.filter(a => a.accommodation_id === acc.id).map(assign => (
                    <div key={assign.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{(assign.profile as any)?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">Room {assign.room_number} • {assign.room_type}</p>
                      </div>
                      <button 
                         onClick={async () => {
                           await supabase.from('room_assignments').delete().eq('id', assign.id);
                           fetchData();
                         }}
                        className="text-slate-300 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {assignments.filter(a => a.accommodation_id === acc.id).length === 0 && (
                    <p className="text-xs text-slate-400 col-span-full italic">No participants assigned yet.</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Accommodation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add Accommodation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hotel Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newAcc.name}
                  onChange={e => setNewAcc({...newAcc, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newAcc.address}
                  onChange={e => setNewAcc({...newAcc, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Check-in</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newAcc.check_in_date}
                    onChange={e => setNewAcc({...newAcc, check_in_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Check-out</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newAcc.check_out_date}
                    onChange={e => setNewAcc({...newAcc, check_out_date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newAcc.contact_number}
                  onChange={e => setNewAcc({...newAcc, contact_number: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddAccommodation}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Save Hotel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Room Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Assign Room</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Participant</label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newAssign.user_id}
                  onChange={e => setNewAssign({...newAssign, user_id: e.target.value})}
                >
                  <option value="">Select participant</option>
                  {participants.map(p => (
                    <option key={p.user_id} value={p.user_id}>{(p.profiles as any)?.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room Number</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newAssign.room_number}
                    onChange={e => setNewAssign({...newAssign, room_number: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room Type</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Twin Share"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newAssign.room_type}
                    onChange={e => setNewAssign({...newAssign, room_type: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAssignModal(null)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleAddAssignment(showAssignModal)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
