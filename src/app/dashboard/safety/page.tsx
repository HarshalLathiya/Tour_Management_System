'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShieldAlert, AlertTriangle, CheckCircle, 
  Plus, Search, Phone, MapPin, Loader2,
  Clock, X, AlertCircle
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';

export default function SafetyPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string>('');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReporting, setIsReporting] = useState(false);
  const [reportingSeverity, setReportingSeverity] = useState('LOW');
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    location: ''
  });

  useEffect(() => {
    const fetchTours = async () => {
      const { data } = await supabase
        .from('tours')
        .select('id, name')
        .order('created_at', { ascending: false });
      
      setTours(data || []);
      if (data && data.length > 0) {
        setSelectedTourId(data[0].id);
      }
    };
    fetchTours();
  }, []);

  useEffect(() => {
    if (!selectedTourId) return;

    const fetchIncidents = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('incidents')
        .select(`
          *,
          profiles:reported_by (full_name)
        `)
        .eq('tour_id', selectedTourId)
        .order('created_at', { ascending: false });
      
      setIncidents(data || []);
      setLoading(false);
    };

    fetchIncidents();
  }, [selectedTourId]);

  const triggerSOS = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('incidents')
      .insert({
        tour_id: selectedTourId,
        reported_by: user.id,
        title: 'URGENT SOS TRIGGERED',
        description: 'Automatic SOS alert triggered by user.',
        severity: 'CRITICAL',
        status: 'OPEN'
      })
      .select()
      .single();

    if (!error) {
      setIncidents([data, ...incidents]);
      alert('CRITICAL SOS ALERT SENT TO ALL COORDINATORS!');
    }
  };

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        tour_id: selectedTourId,
        reported_by: user?.id,
        title: reportForm.title,
        description: reportForm.description,
        location: reportForm.location,
        severity: reportingSeverity,
        status: 'OPEN'
      })
      .select()
      .single();

    if (!error) {
      setIncidents([data, ...incidents]);
      setIsReporting(false);
      setReportForm({ title: '', description: '', location: '' });
    }
  };

  const resolveIncident = async (id: string) => {
    const { error } = await supabase
      .from('incidents')
      .update({ status: 'RESOLVED', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setIncidents(incidents.map(inc => inc.id === id ? { ...inc, status: 'RESOLVED' } : inc));
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
            value={selectedTourId} 
            onChange={(e) => setSelectedTourId(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          >
            {tours.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
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
                className="text-sm font-bold text-blue-600 flex items-center hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
              >
                <Plus className="h-4 w-4 mr-1" /> New Log
              </button>
            </div>
            
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
              ) : incidents.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>All clear. No incidents reported.</p>
                </div>
              ) : (
                incidents.map(incident => (
                  <div key={incident.id} className={`p-6 flex items-start space-x-4 transition-colors ${incident.status === 'OPEN' ? 'bg-white' : 'bg-slate-50 opacity-60'}`}>
                    <div className={`p-3 rounded-2xl ${
                      incident.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                      incident.severity === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                      incident.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`text-sm font-black uppercase tracking-wider ${
                            incident.severity === 'CRITICAL' ? 'text-red-600' : 'text-slate-500'
                          }`}>
                            {incident.severity} SEVERITY • {incident.status}
                          </h4>
                          <h3 className="text-lg font-bold text-slate-800 mt-0.5">{incident.title}</h3>
                        </div>
                        <span className="text-xs font-bold text-slate-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> {new Date(incident.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mt-2 leading-relaxed">{incident.description}</p>
                      {incident.location && (
                        <p className="text-xs text-slate-400 mt-2 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" /> {incident.location}
                        </p>
                      )}
                      <div className="mt-4 flex items-center space-x-4">
                        {incident.status === 'OPEN' ? (
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
                        <span className="text-xs text-slate-400">Reported by: {incident.profiles?.full_name || 'System'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
            <h3 className="text-lg font-bold flex items-center mb-6">
              <Phone className="mr-2 h-5 w-5 text-red-500" /> Emergency Contacts
            </h3>
            <div className="space-y-6">
              <div className="group">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Local Emergency</p>
                <p className="text-2xl font-black group-hover:text-red-400 transition-colors">112 / 100</p>
              </div>
              <div className="h-px bg-slate-800"></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Control Room</p>
                <p className="text-lg font-bold">+1 (555) 000-9111</p>
              </div>
              <div className="h-px bg-slate-800"></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nearest Medical</p>
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
              <MapPin className="h-4 w-4 mr-2 text-blue-600" /> Open Map View
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
              <button onClick={() => setIsReporting(false)} className="p-2 hover:bg-slate-200 rounded-full">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleReportIncident} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Incident Title</label>
                  <input 
                    required
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={reportForm.title}
                    onChange={e => setReportForm({...reportForm, title: e.target.value})}
                    placeholder="Brief summary..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Severity</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={reportingSeverity}
                    onChange={e => setReportingSeverity(e.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                  <input 
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={reportForm.location}
                    onChange={e => setReportForm({...reportForm, location: e.target.value})}
                    placeholder="Where?"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea 
                  required
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
                  value={reportForm.description}
                  onChange={e => setReportForm({...reportForm, description: e.target.value})}
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
