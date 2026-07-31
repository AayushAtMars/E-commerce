import { useState, useEffect } from 'react';
import { orderApi } from '../api/client';
import { Undo2, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Returns() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeReturn, setActiveReturn] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNote, setActionNote] = useState('');

  const [filterStatus, setFilterStatus] = useState('Requested');

  useEffect(() => {
    fetchReturns();
  }, [filterStatus]);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await orderApi.get(`/admin/returns?status=${filterStatus}`);
      setReturns(res.data.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (ret: any) => {
    setActiveReturn(ret);
    setActionNote('');
    setShowModal(true);
  };

  const handleUpdateStatus = async (status: string) => {
    setActionLoading(true);
    try {
      await orderApi.patch(`/admin/returns/${activeReturn._id}`, { status, note: actionNote });
      setShowModal(false);
      fetchReturns();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update return');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Requested': return 'bg-amber-100 text-amber-700';
      case 'Approved': return 'bg-blue-100 text-blue-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Returns</h2>
          <p className="text-sm text-gray-500 mt-1">Manage customer return & replacement requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
        {['Requested', 'Approved', 'Rejected', 'Completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterStatus === status ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading returns...</div>
        ) : returns.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No {filterStatus.toLowerCase()} return requests found.</div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Return ID</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {returns.map((ret) => (
                <tr key={ret._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-medium">{ret._id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <Link to={`/orders/${ret.orderId?._id}`} className="text-primary-600 hover:underline flex items-center gap-1">
                      {ret.orderId?.orderNumber} <ExternalLink size={12} />
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-md ${ret.type === 'Refund' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                      {ret.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{ret.items.length} item(s)</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ret.status)}`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openDetail(ret)} className="text-gray-400 hover:text-primary-600 p-2 rounded-lg hover:bg-primary-50 transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && activeReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Undo2 size={18} className="text-primary-600" /> Return Details
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Type</p>
                  <p className="font-semibold text-gray-900 mt-1">{activeReturn.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Order Total</p>
                  <p className="font-semibold text-gray-900 mt-1">₹{activeReturn.orderId?.total}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Items to Return</p>
                <div className="space-y-3">
                  {activeReturn.items.map((item: any, i: number) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                      <div className="flex justify-between font-medium text-gray-900">
                        <span>Product ID: {item.productId}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <p className="text-gray-600 mt-1 text-sm bg-white p-2 rounded border border-gray-100 mt-2">
                        <span className="font-medium text-gray-900">Reason:</span> {item.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {activeReturn.status === 'Requested' && (
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Admin Note (Optional)</p>
                  <textarea 
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder="Enter reason for rejection or approval note..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    rows={2}
                  />
                </div>
              )}
              
              {activeReturn.statusHistory && activeReturn.statusHistory.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">History</p>
                  <div className="space-y-2 text-sm">
                    {activeReturn.statusHistory.map((h: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-gray-600">
                        <span><span className="font-medium">{h.status}</span> - {new Date(h.timestamp).toLocaleDateString()}</span>
                        {h.note && <span className="text-xs italic text-gray-400 max-w-[200px] truncate">{h.note}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Close</button>
              
              {activeReturn.status === 'Requested' && (
                <>
                  <button onClick={() => handleUpdateStatus('Rejected')} disabled={actionLoading} className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50">
                    Reject
                  </button>
                  <button onClick={() => handleUpdateStatus('Approved')} disabled={actionLoading} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50">
                    {actionLoading ? 'Processing...' : activeReturn.type === 'Refund' ? 'Approve & Refund' : 'Approve Replacement'}
                  </button>
                </>
              )}
              {activeReturn.status === 'Approved' && (
                <button onClick={() => handleUpdateStatus('Completed')} disabled={actionLoading} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {actionLoading ? 'Processing...' : 'Mark Completed'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
