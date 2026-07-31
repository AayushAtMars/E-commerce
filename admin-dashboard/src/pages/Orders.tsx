import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../api/client';
import { Package, ChevronRight } from 'lucide-react';

const STATUS_TABS = ['All', 'Placed', 'In Progress', 'On the Way', 'Delivered', 'Cancelled'];

const STATUS_COLOR: Record<string, string> = {
  'Placed':      'bg-blue-100 text-blue-800',
  'In Progress': 'bg-amber-100 text-amber-800',
  'On the Way':  'bg-purple-100 text-purple-800',
  'Delivered':   'bg-emerald-100 text-emerald-800',
  'Cancelled':   'bg-red-100 text-red-800',
};

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('All');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 20;
  const navigate = useNavigate();

  useEffect(() => {
    setPage(1);
    fetchOrders(1, activeStatus);
  }, [activeStatus]);

  useEffect(() => {
    if (page > 1) fetchOrders(page, activeStatus);
  }, [page]);

  const fetchOrders = async (p: number, status: string) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, limit: LIMIT };
      if (status !== 'All') params.status = status;
      const res = await orderApi.get('/admin/orders', { params });
      setOrders(res.data.data?.orders || []);
      setTotal(res.data.data?.count ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500 mt-1">{total} total orders</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveStatus(tab)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeStatus === tab
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Package size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
            <p className="text-gray-500 mt-1">
              {activeStatus === 'All' ? 'When customers place orders, they will appear here.' : `No "${activeStatus}" orders.`}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Order</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Items</th>
                    <th className="px-6 py-4 font-medium">Total</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="bg-white border-b border-gray-50 hover:bg-primary-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}</div>
                        <div className="text-xs text-gray-400">{order.userId?.slice(-8)}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        ₹{(order.total ?? order.totalAmount ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-primary-600">
                          <ChevronRight size={18} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages} · {total} orders
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 disabled:opacity-40 hover:border-primary-300 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 disabled:opacity-40 hover:border-primary-300 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
