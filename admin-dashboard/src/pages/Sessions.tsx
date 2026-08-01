import { useState, useEffect } from 'react';
import { catalogApi } from '../api/client';
import { MonitorSmartphone, Trash2, MapPin, Clock } from 'lucide-react';

interface Session {
  _id: string;
  adminId: {
    name: string;
    email: string;
    role: string;
  };
  userAgent: string;
  ipAddress: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await catalogApi.get('/admin/auth/sessions');
      setSessions(res.data.data.sessions || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to revoke this session? The user will be logged out immediately.')) {
      return;
    }
    
    try {
      await catalogApi.post(`/admin/auth/sessions/${sessionId}/revoke`);
      setSessions(sessions.filter(s => s._id !== sessionId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to revoke session');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading active sessions...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">{error}</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Active Sessions</h2>
        <p className="text-sm text-gray-500 mt-1">Manage and revoke active administrator sessions across all devices.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No active sessions found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Admin User</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Device & Location</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Logged In At</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Expires At</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((session) => (
                <tr key={session._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{session.adminId?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{session.adminId?.email || 'N/A'}</div>
                    <div className="text-xs inline-flex items-center px-2 py-0.5 mt-1 rounded-full bg-blue-50 text-blue-700 font-medium capitalize">
                      {(session.adminId?.role || 'Unknown').replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-2">
                      <MonitorSmartphone size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-700 truncate max-w-[250px]" title={session.userAgent}>
                          {session.userAgent || 'Unknown Device'}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin size={12} className="mr-1" />
                          {session.ipAddress}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={14} className="mr-1.5 text-gray-400" />
                      {formatDate(session.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      {formatDate(session.expiresAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRevoke(session._id)}
                      className="inline-flex items-center space-x-1.5 text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                      <span>Revoke</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
