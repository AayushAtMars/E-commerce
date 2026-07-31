import { useState, useEffect } from 'react';
import { catalogApi } from '../api/client';
import { Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Tickets() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await catalogApi.get(`/admin/tickets?page=${page}&limit=20${activeTab !== 'All' ? `&status=${activeTab}` : ''}`);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [activeTab, page]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-orange-600 bg-orange-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-blue-600 bg-blue-50';
      case 'In Progress': return 'text-amber-600 bg-amber-50';
      case 'Escalated': return 'text-red-600 bg-red-50';
      case 'Resolved': return 'text-green-600 bg-green-50';
      case 'Closed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500 mt-1">Manage customer grievances and support requests</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 p-4">
          <div className="flex gap-4">
            {['All', 'Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Ticket Info</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Customer</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Priority</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">Loading tickets...</td>
                </tr>
              ) : data?.tickets?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No tickets found</td>
                </tr>
              ) : (
                data?.tickets?.map((ticket: any) => (
                  <tr 
                    key={ticket._id} 
                    onClick={() => navigate(`/tickets/${ticket._id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900 truncate max-w-[200px]">{ticket.subject}</div>
                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <Ticket size={14} />
                        {ticket._id.substring(0, 8).toUpperCase()} • {ticket.category}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-900">{ticket.userId?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{ticket.userId?.email || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        SLA: {new Date(ticket.slaDeadline).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data?.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {data.totalPages}
            </span>
            <button 
              disabled={page === data.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
