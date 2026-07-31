import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi, catalogApi } from '../api/client';
import {
  ArrowLeft, Package, MapPin, CreditCard, Truck, User,
  CheckCircle, Clock, XCircle, ChevronRight
} from 'lucide-react';

const STATUS_OPTIONS = ['Placed', 'In Progress', 'On the Way', 'Delivered', 'Cancelled'];

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  'Placed':      { color: 'bg-blue-100 text-blue-800 border-blue-200',   icon: <Clock size={14} /> },
  'In Progress': { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Package size={14} /> },
  'On the Way':  { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Truck size={14} /> },
  'Delivered':   { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle size={14} /> },
  'Cancelled':   { color: 'bg-red-100 text-red-800 border-red-200',      icon: <XCircle size={14} /> },
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => { fetchOrder(); }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await orderApi.get(`/admin/orders/${id}`);
      const o = res.data.data?.order;
      setOrder(o);
      setSelectedStatus(o?.status ?? '');

      // Fetch user detail
      if (o?.userId) {
        try {
          const uRes = await catalogApi.get(`/admin/users/${o.userId}`);
          setUser(uRes.data.data?.user);
        } catch { /* user lookup optional */ }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === order?.status) return;
    setStatusLoading(true);
    setStatusMsg('');
    try {
      const res = await orderApi.patch(`/admin/orders/${id}/status`, {
        status: selectedStatus,
        note: statusNote.trim() || undefined,
      });
      setOrder(res.data.data?.order);
      setStatusNote('');
      setStatusMsg(`✅ Status updated to "${selectedStatus}"`);
    } catch (err: any) {
      setStatusMsg(`❌ ${err.response?.data?.message || 'Failed to update status.'}`);
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;

  if (!order) return (
    <div className="space-y-4">
      <Link to="/orders" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft size={16} className="mr-1" /> Back to Orders
      </Link>
      <div className="bg-white p-12 text-center rounded-2xl border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">Order not found</h3>
      </div>
    </div>
  );

  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['Placed'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link to="/orders" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4">
          <ArrowLeft size={16} className="mr-1" /> Back to Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-400 mt-0.5">{order.orderNumber}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusCfg.color}`}>
            {statusCfg.icon} {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Package size={18} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Order Items</h3>
              <span className="ml-auto text-xs text-gray-400">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <Package size={20} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.size && `Size: ${item.size}`}{item.size && item.color && ' · '}{item.color && `Color: ${item.color}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium text-gray-900">₹{item.price?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">× {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Clock size={18} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Order Timeline</h3>
            </div>
            <div className="px-6 py-4 space-y-0">
              {[...( order.statusHistory ?? [])].reverse().map((entry: any, i: number) => {
                const cfg = STATUS_CONFIG[entry.status];
                return (
                  <div key={i} className="flex gap-4 pb-4 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 ${i === 0 ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-gray-50'}`}>
                        <span className={i === 0 ? 'text-primary-600' : 'text-gray-400'}>{cfg?.icon ?? <Clock size={14} />}</span>
                      </div>
                      {i < (order.statusHistory?.length ?? 0) - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-100 mt-1" />
                      )}
                    </div>
                    <div className="pt-1 pb-4">
                      <p className="font-medium text-gray-900 text-sm">{entry.status}</p>
                      {entry.note && <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-6">

          {/* Status Update */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChevronRight size={18} className="text-gray-400" /> Update Status
            </h3>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none mb-3"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <textarea
              placeholder="Admin note (optional)"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none mb-3 resize-none"
            />
            <button
              onClick={handleStatusUpdate}
              disabled={statusLoading || selectedStatus === order.status}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {statusLoading ? 'Updating...' : 'Update Status'}
            </button>
            {statusMsg && (
              <p className={`text-xs mt-2 text-center ${statusMsg.startsWith('✅') ? 'text-emerald-600' : 'text-red-600'}`}>
                {statusMsg}
              </p>
            )}
          </div>

          {/* Customer */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-gray-400" /> Customer
            </h3>
            {user ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-gray-500 text-xs">{user.email}</p>
                  </div>
                </div>
                <Link
                  to={`/users/${order.userId}`}
                  className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 text-xs font-medium mt-1"
                >
                  View full profile <ChevronRight size={12} />
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-500">User ID: {order.userId}</p>
            )}
          </div>

          {/* Payment & Shipping */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard size={18} className="text-gray-400" /> Payment & Shipping
            </h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium text-gray-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-gray-900">{order.shippingType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">₹{order.subtotal?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>−₹{order.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping cost</span>
                <span>₹{order.shippingCost?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-2">
                <span>Total</span>
                <span>₹{order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-gray-400" /> Delivery Address
            </h3>
            {order.shippingAddress && (
              <div className="text-sm text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-900">{order.shippingAddress.label}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.floor && <p>{order.shippingAddress.floor}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.pincode}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
