'use client';

import { useState } from 'react';
import { Bell, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

const mockAnnouncements = [
  { id: 1, author: 'Tour Leader A', content: 'Assembly at the hotel lobby in 15 minutes. Please be on time.', time: '5m ago', urgent: true, readBy: 38 },
  { id: 2, author: 'Admin', content: 'Lunch will be served at Bangalore Highway Restaurant.', time: '2h ago', urgent: false, readBy: 45 },
  { id: 3, author: 'Tour Leader A', content: 'Good morning everyone! Please check your itinerary for Day 3.', time: '4h ago', urgent: false, readBy: 42 },
];

export default function AnnouncementsPage() {
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Announcements</h2>
          <p className="text-slate-500">Send and view official tour updates.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card space-y-4">
            <h3 className="text-lg font-semibold">Post Announcement</h3>
            <div className="space-y-3">
              <textarea 
                className="w-full rounded-md border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                placeholder="Type your announcement here..."
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
              ></textarea>
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded text-blue-600 focus:ring-blue-500" 
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-slate-700">Mark as Urgent</span>
                </label>
                <button className="btn-primary flex items-center bg-blue-600">
                  <Send className="mr-2 h-4 w-4" /> Broadcast
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {mockAnnouncements.map((ann) => (
              <div key={ann.id} className={`card space-y-3 ${ann.urgent ? 'border-red-200 bg-red-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{ann.author}</span>
                    <span className="text-xs text-slate-500">• {ann.time}</span>
                  </div>
                  {ann.urgent && (
                    <span className="flex items-center text-xs font-bold text-red-600 uppercase">
                      <AlertCircle className="mr-1 h-3 w-3" /> Urgent
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700">{ann.content}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div className="flex items-center text-xs text-slate-500">
                    <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                    Acknowledged by {ann.readBy} / 45 participants
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:underline">View Progress</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card space-y-4">
            <h3 className="text-lg font-semibold">Scheduled Alerts</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="rounded-md bg-slate-100 p-2">
                  <Bell className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Headcount Check</p>
                  <p className="text-xs text-slate-500">Today, 04:00 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="rounded-md bg-slate-100 p-2">
                  <Bell className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Dinner Assembly</p>
                  <p className="text-xs text-slate-500">Today, 08:30 PM</p>
                </div>
              </div>
            </div>
            <button className="w-full rounded-md border border-slate-200 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
              Manage Reminders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
