import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { catalogApi } from '../api/client';
import { ArrowLeft, Send, Clock, Package } from 'lucide-react';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await catalogApi.get(`/admin/tickets/${id}`);
      setTicket(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    try {
      await catalogApi.post(`/admin/tickets/${id}/message`, { text: replyText });
      setReplyText('');
      fetchTicket();
    } catch (err) {
      console.error(err);
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    setIsUpdatingStatus(true);
    try {
      await catalogApi.patch(`/admin/tickets/${id}`, { status });
      fetchTicket();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (priority: string) => {
    setIsUpdatingPriority(true);
    try {
      await catalogApi.patch(`/admin/tickets/${id}`, { priority });
      fetchTicket();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  if (isLoading) return <div className="p-8 text-gray-500">Loading ticket details...</div>;
  if (!ticket) return <div className="p-8 text-gray-500">Ticket not found</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/tickets')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
          <div className="text-sm text-gray-500 mt-1">Ticket ID: {ticket._id}</div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Chat Section */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-0">
          <div className="p-4 border-b border-gray-100 font-medium text-gray-900 flex justify-between items-center">
            Conversation
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
            {ticket.messages?.map((msg: any, i: number) => (
              <div key={i} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl p-4 ${
                  msg.isAdmin 
                    ? 'bg-gray-900 text-white rounded-tr-sm' 
                    : 'bg-white border border-gray-200 text-gray-900 rounded-tl-sm shadow-sm'
                }`}>
                  <div className={`text-xs font-medium mb-1 ${msg.isAdmin ? 'text-gray-300' : 'text-gray-500'}`}>
                    {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-4">
              <textarea
                className="flex-1 border border-gray-200 rounded-xl p-3 resize-none focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                placeholder={ticket.status === 'Closed' ? 'Ticket is closed' : 'Type your reply...'}
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={ticket.status === 'Closed' || isReplying}
              />
              <button
                className="bg-gray-900 text-white px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                onClick={handleReply}
                disabled={!replyText.trim() || ticket.status === 'Closed' || isReplying}
              >
                <Send size={18} />
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-80 flex flex-col gap-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Ticket Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Customer</label>
                <div className="font-medium text-gray-900 mt-1">{ticket.userId?.name || 'Unknown'}</div>
                <div className="text-sm text-gray-500">{ticket.userId?.email || 'N/A'}</div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Category</label>
                <div className="font-medium text-gray-900 mt-1">{ticket.category}</div>
              </div>

              {ticket.orderId && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Related Order</label>
                  <Link to={`/orders/${ticket.orderId}`} className="flex items-center gap-2 text-blue-600 font-medium mt-1 hover:underline">
                    <Package size={16} />
                    View Order
                  </Link>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">SLA Deadline</label>
                <div className={`font-medium mt-1 flex items-center gap-2 ${new Date(ticket.slaDeadline) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                  <Clock size={16} />
                  {new Date(ticket.slaDeadline).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Management</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Status</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdatingStatus}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Priority</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  disabled={isUpdatingPriority}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              
              {ticket.status !== 'Closed' && (
                <button
                  className="w-full py-2.5 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors mt-2"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to close this ticket?')) {
                      handleStatusChange('Closed');
                    }
                  }}
                >
                  Close Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
