import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogApi, orderApi } from '../api/client';
import { ArrowLeft, Package, User, Calendar, Mail, Phone } from 'lucide-react';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      // 1. Fetch all users and find this specific user (since backend doesn't have a get by ID admin route)
      const usersRes = await catalogApi.get('/admin/users');
      const allUsers = usersRes.data.data?.users || [];
      const foundUser = allUsers.find((u: any) => u._id === id);
      setUser(foundUser);

      if (foundUser) {
        // 2. Fetch all orders and filter by this user's ID
        const ordersRes = await orderApi.get('/admin/orders');
        const allOrders = ordersRes.data.data?.orders || [];
        const userOrders = allOrders.filter((o: any) => o.userId === id);
        // Sort newest first
        setOrders(userOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading user details...</div>;
  }

  if (!user) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <Link to="/users" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Users
        </Link>
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">User not found</h3>
          <p className="text-gray-500 mt-1">The user you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link to="/users" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4">
          <ArrowLeft size={16} className="mr-1" /> Back to Users
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">User Details</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
            <div className="flex flex-col items-center text-center">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full object-cover bg-gray-100 shadow-sm mb-4" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-3xl shadow-sm mb-4">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-gray-500">ID: {user._id}</p>
              
              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium capitalize">
                  {user.authProvider || 'local'} Auth
                </span>
                {user.isVerified && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                    Verified
                  </span>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-start space-x-3 text-sm">
                <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Email Address</p>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>
              
              {user.phone && (
                <div className="flex items-start space-x-3 text-sm">
                  <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Number</p>
                    <p className="text-gray-500">{user.phone}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-3 text-sm">
                <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Joined Date</p>
                  <p className="text-gray-500">{new Date(user.createdAt).toLocaleDateString()} at {new Date(user.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
              
              {user.dob && (
                <div className="flex items-start space-x-3 text-sm">
                  <User className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Date of Birth</p>
                    <p className="text-gray-500">{user.dob}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Package className="mr-2 h-5 w-5 text-gray-400" />
                Order History
              </h3>
              <span className="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-xs font-medium">
                {orders.length} Orders
              </span>
            </div>
            
            {orders.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <Package size={48} className="text-gray-300 mb-4" />
                <h4 className="text-lg font-medium text-gray-900">No orders yet</h4>
                <p className="text-gray-500 mt-1">This user hasn't placed any orders.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-medium">Order ID</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Total</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          ₹{(order.totalAmount || order.totalPrice || order.total || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
