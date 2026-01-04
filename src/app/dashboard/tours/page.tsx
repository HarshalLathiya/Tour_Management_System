'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, MapPin, Calendar, Users, ChevronRight } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

export default function ToursPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        setTours(data || []);
      }
      setLoading(false);
    };

    fetchTours();
  }, []);

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tours</h2>
          <p className="text-slate-500">Manage and monitor all your tours.</p>
        </div>
        <button className="btn-primary flex items-center bg-blue-600">
          <Plus className="mr-2 h-4 w-4" /> Create New Tour
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="card h-48 animate-pulse bg-slate-100"></div>
          ))
        ) : tours.length === 0 ? (
          <div className="col-span-full py-20 text-center card bg-white">
            <MapPin className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">No tours found</h3>
            <p className="mt-2 text-slate-500">Get started by creating your first tour itinerary.</p>
          </div>
        ) : (
          tours.map((tour) => (
            <div key={tour.id} className="card group hover:border-blue-500 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600">{tour.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${

                  tour.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
                </span>
              </div>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(tour.start_date).toLocaleDateString()} - {new Date(tour.end_date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  {tour.locations_count || 5} Locations
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {tour.participants_count || 45} Participants
                </div>
              </div>
              <div className="mt-6 pt-4 border-t flex justify-end">
                <button className="text-sm font-semibold text-blue-600 flex items-center">
                  Manage Details <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
