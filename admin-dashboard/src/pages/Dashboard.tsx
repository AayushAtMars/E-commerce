import { useState, useEffect } from 'react';
import { catalogApi, orderApi } from '../api/client';
import { Users, Package, ShoppingCart, IndianRupee } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    users: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          catalogApi.get('/products?limit=1'),
          orderApi.get('/admin/orders'),
          catalogApi.get('/admin/users').catch(() => ({ data: { data: { count: 0 } } })) // Fallback if still deploying
        ]);
        
        const orders = ordersRes.data.data?.orders || [];
        const revenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || order.totalPrice || order.total || 0), 0);

        setStats({
          products: productsRes.data.total || 0,
          orders: orders.length,
          revenue,
          users: usersRes.data?.data?.count || 0,
        });

        // Group orders by date for chart
        const grouped = orders.reduce((acc: any[], order: any) => {
          const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const existing = acc.find(item => item.date === date);
          const orderRev = order.totalAmount || order.totalPrice || order.total || 0;
          if (existing) {
            existing.revenue += orderRev;
            existing.orders += 1;
          } else {
            acc.push({ date, revenue: orderRev, orders: 1 });
          }
          return acc;
        }, []);
        setChartData(grouped.reverse()); // Show chronological

      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Revenue', value: `₹${stats.revenue.toFixed(2)}`, icon: <IndianRupee size={24} className="text-emerald-500" /> },
    { name: 'Total Orders', value: stats.orders, icon: <ShoppingCart size={24} className="text-blue-500" /> },
    { name: 'Active Products', value: stats.products, icon: <Package size={24} className="text-purple-500" /> },
    { name: 'Active Users', value: stats.users, icon: <Users size={24} className="text-orange-500" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Here is what's happening in your store today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-gray-50 rounded-xl">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Chart Section */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-[450px] flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Over Time</h3>
        <div className="flex-1 w-full min-h-0">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  tickFormatter={(val) => `₹${val}`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2 }} 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-400">Not enough data to display chart.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
