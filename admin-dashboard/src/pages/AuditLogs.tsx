import { useState, useEffect } from 'react';
import { catalogApi, orderApi } from '../api/client';
import { ShieldAlert, User, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Fetch from both services (since we implemented audit logs on both independently)
      const [identityRes, commerceRes] = await Promise.all([
        catalogApi.get('/admin/audit-logs?limit=50').catch(() => ({ data: { data: { logs: [] } } })),
        orderApi.get('/admin/audit-logs?limit=50').catch(() => ({ data: { data: { logs: [] } } }))
      ]);

      const identityLogs = identityRes.data?.data?.logs || [];
      const commerceLogs = commerceRes.data?.data?.logs || [];
      
      const combined = [...identityLogs, ...commerceLogs].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setLogs(combined);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'POST': return 'bg-green-100 text-green-800 border-green-200';
      case 'PATCH':
      case 'PUT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Audit Logs</h2>
        <p className="text-sm text-gray-500 mt-1">Track all administrative actions performed across the platform.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Timestamp</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Admin</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Action</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Resource</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Details (JSON)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <ShieldAlert className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p>No audit logs recorded yet.</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-50 p-1.5 rounded-full">
                        <User size={14} className="text-indigo-600" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{log.adminName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{log.resourceType}</span>
                    </div>
                    {log.resourceId && (
                      <div className="text-xs text-gray-500 mt-1 font-mono">{log.resourceId}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs max-h-24 overflow-auto bg-gray-50 p-2 rounded border border-gray-100 text-xs text-gray-600 font-mono">
                      {log.details ? log.details : '-'}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
