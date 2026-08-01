import { useState, useEffect } from 'react';
import { catalogApi, orderApi } from '../api/client';
import { Users, Package, ShoppingCart, IndianRupee, Download, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const adminRole = localStorage.getItem('adminRole') || 'support';
  if (adminRole === 'support') {
    return <Navigate to="/tickets" replace />;
  }
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    users: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const [productsRes, usersRes, reportsRes] = await Promise.all([
        catalogApi.get('/products?limit=1'),
        catalogApi.get('/admin/users').catch(() => ({ data: { data: { count: 0 } } })),
        orderApi.get(`/admin/reports/summary?${params.toString()}`)
      ]);
      
      const summary = reportsRes.data.data.summary;
      
      setStats({
        products: productsRes.data.total || 0,
        orders: summary.totalOrders || 0,
        revenue: summary.totalRevenue || 0,
        users: usersRes.data?.data?.count || 0,
      });

      setChartData(reportsRes.data.data.dailyChartData || []);
      setTopProducts(reportsRes.data.data.topProducts || []);

    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams({ limit: '10000' });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const res = await orderApi.get(`/admin/orders?${params.toString()}`);
      const orders = res.data.data.orders;
      
      if (!orders || orders.length === 0) {
        alert('No orders found for this date range.');
        setIsExporting(false);
        return;
      }
      
      // Build CSV
      const headers = ['Order Number', 'Date', 'Status', 'User Name', 'User Email', 'Total Amount', 'Items Count'];
      const rows = orders.map((o: any) => [
        o.orderNumber,
        new Date(o.createdAt).toISOString(),
        o.status,
        o.userName || 'N/A',
        o.userEmail || 'N/A',
        o.total,
        o.items?.length || 0
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map((row: any) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_export_${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Failed to export CSV', err);
      alert('Failed to export CSV. See console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const statCards = [
    { name: 'Total Revenue', value: `₹${stats.revenue.toFixed(2)}`, icon: <IndianRupee size={24} className="text-emerald-500" /> },
    { name: 'Total Orders', value: stats.orders, icon: <ShoppingCart size={24} className="text-blue-500" /> },
    { name: 'Active Products', value: stats.products, icon: <Package size={24} className="text-purple-500" /> },
    { name: 'Active Users', value: stats.users, icon: <Users size={24} className="text-orange-500" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Here is what's happening in your store.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
            <Filter size={16} className="text-gray-400" />
            <input 
              type="date" 
              className="text-sm border-none focus:ring-0 p-0 text-gray-600 bg-transparent"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <span className="text-gray-300">-</span>
            <input 
              type="date" 
              className="text-sm border-none focus:ring-0 p-0 text-gray-600 bg-transparent"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-xs text-red-500 font-medium ml-2">Clear</button>
            )}
          </div>
          
          <button 
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
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
      
      {/* Top Products Section */}
      {topProducts.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Top Selling Products</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Product</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Units Sold</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Revenue generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProducts.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      <span className="font-medium text-gray-900">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.unitsSold}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">₹{p.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
