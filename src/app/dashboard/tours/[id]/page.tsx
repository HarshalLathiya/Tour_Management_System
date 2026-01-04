'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { 
  Calendar, MapPin, Users, DollarSign, 
  Clock, CheckCircle, AlertCircle, Plus,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/BackButton';

export default function TourDetailsPage() {
  const { id } = useParams();
  const [tour, setTour] = useState<any>(null);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('itinerary');

  useEffect(() => {
    const fetchTourData = async () => {
      // Fetch tour basic info
      const { data: tourData, error: tourError } = await supabase
        .from('tours')
        .select('*')
        .eq('id', id)
        .single();

      if (tourError) {
        console.error(tourError);
        return;
      }
      setTour(tourData);

      // Fetch itinerary
      const { data: itineraryData } = await supabase
        .from('itineraries')
        .select('*')
        .eq('tour_id', id)
        .order('day_number', { ascending: true })
        .order('sequence_order', { ascending: true });

      setItinerary(itineraryData || []);
      setLoading(false);
    };

    fetchTourData();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading tour details...</div>;
  if (!tour) return <div className="p-8 text-center">Tour not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <BackButton className="mb-0" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{tour.name}</h2>
          <p className="text-slate-500 flex items-center">
            <MapPin className="h-4 w-4 mr-1" /> {tour.destination} • 
            <Calendar className="h-4 w-4 ml-2 mr-1" /> {new Date(tour.start_date).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {['itinerary', 'attendance', 'budget', 'safety'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {activeTab === 'itinerary' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Itinerary Items</h3>
              <button className="flex items-center text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md">
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
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">Day {item.day_number}</span>
                        <h4 className="font-bold text-slate-800">{item.location_name}</h4>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{item.activity_details}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold mb-4">Quick Attendance</h3>
            <p className="text-slate-500 text-sm mb-6">Track presence for today's locations.</p>
            <Link href={`/dashboard/attendance?tourId=${id}`} className="text-blue-600 font-medium hover:underline">
              Go to Full Attendance Module →
            </Link>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Budget Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-slate-500">Total Funds</span>
                  <span className="font-bold text-slate-900">${(tour.per_person_fee * (tour.max_participants || 1)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-slate-500">Buffer Amount</span>
                  <span className="font-bold text-slate-900">${tour.buffer_amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center text-blue-600 pt-2">
                  <span className="font-semibold">Available Budget</span>
                  <span className="text-xl font-bold">${(tour.per_person_fee * (tour.max_participants || 1) + (tour.buffer_amount || 0)).toFixed(2)}</span>
                </div>
              </div>
              <Link href="/dashboard/budget" className="mt-6 block text-center text-sm font-semibold bg-slate-50 py-2 rounded-lg hover:bg-slate-100">
                Manage Expenses
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="bg-red-50 rounded-xl p-6 border border-red-100">
            <div className="flex items-center space-x-2 text-red-700 mb-4">
              <AlertCircle className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Emergency & Safety</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6">Quick access to SOS and incident reporting.</p>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-red-700 transition-colors">
                TRIGGER SOS
              </button>
              <button className="bg-white text-red-600 border border-red-200 font-bold py-3 rounded-lg hover:bg-red-50 transition-colors">
                REPORT INCIDENT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
