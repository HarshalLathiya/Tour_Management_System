'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  History, Search, Filter, 
  User, Activity, Clock, 
  ChevronRight, Database, Eye
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        profiles:user_id (full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (!error) {
      setLogs(data || []);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <BackButton />
          <h2 className="text-2xl font-bold text-slate-800 flex items-center mt-2">
            <History className="mr-2 h-6 w-6 text-blue-600" />
            System Audit Logs
          </h2>
          <p className="text-slate-500">Track all administrative and operational changes for full traceability.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by action, entity or user..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 border rounded-lg hover:bg-slate-50">
              <Filter className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Entity</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Time</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Loading logs...</td></tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">No logs found.</td></tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr 
                        key={log.id} 
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedLog?.id === log.id ? 'bg-blue-50/50' : ''}`}
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-700">{log.action}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center mr-2">
                              <User className="h-3 w-3 text-slate-500" />
                            </div>
                            <span className="text-slate-600">{log.profiles?.full_name || 'System'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                            {log.entity_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Eye className="h-4 w-4 text-blue-500 inline-block" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm min-h-[400px]">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <Activity className="mr-2 h-5 w-5 text-blue-600" />
              Log Details
            </h3>
            
            {selectedLog ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Change Payload</p>
                  <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-[11px] text-green-400 font-mono">
                      {JSON.stringify(selectedLog.new_data || selectedLog.old_data, null, 2)}
                    </pre>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">IP Address</p>
                    <p className="text-sm font-bold text-slate-700">{selectedLog.ip_address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Entity ID</p>
                    <p className="text-xs font-mono text-slate-500 truncate">{selectedLog.entity_id}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-700 leading-relaxed font-medium">
                    This action was performed by <strong>{selectedLog.profiles?.full_name || 'the system'}</strong> on 
                    <strong> {new Date(selectedLog.created_at).toLocaleString()}</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <Database className="h-12 w-12 mb-4 opacity-20" />
                <p>Select a log entry to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
