import React, { useEffect, useState } from 'react';
import { orderApi } from '../api/client';
import { Mail, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  _id: string;
  orderNumber: string;
  userEmail?: string;
  userName?: string;
  statusHistory: { status: string; timestamp: string }[];
}

interface NotificationLog {
  id: string;
  orderId: string;
  orderNumber: string;
  recipient: string;
  email: string;
  type: string;
  timestamp: Date;
  status: 'Delivered';
}

export default function Notifications() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      // Fetch orders to reconstruct the notification log
      const res = await orderApi.get('/admin/orders?limit=100');
      const orders: Order[] = res.data.data.orders;
      
      const reconstructedLogs: NotificationLog[] = [];
      
      orders.forEach(order => {
        if (!order.userEmail) return; // Skip if no email is attached

        order.statusHistory.forEach((history, index) => {
          let type = 'Order Status Update';
          if (history.status === 'Placed') type = 'Order Placed';
          if (history.status === 'Cancelled') type = 'Order Cancelled';
          if (history.status === 'Delivered') type = 'Order Delivered';

          reconstructedLogs.push({
            id: `${order._id}-${index}`,
            orderId: order._id,
            orderNumber: order.orderNumber,
            recipient: order.userName || 'Customer',
            email: order.userEmail,
            type,
            timestamp: new Date(history.timestamp),
            status: 'Delivered'
          });
        });
      });

      // Sort by timestamp descending
      reconstructedLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setLogs(reconstructedLogs);
    } catch (err) {
      console.error('Failed to fetch notification logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Logs</h1>
          <p className="text-gray-500 mt-1">Transactional emails sent to customers</p>
        </div>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center font-medium">
          <CheckCircle className="w-5 h-5 mr-2" />
          Email Service Active
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Timestamp</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Recipient</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Type</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Related Order</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="animate-spin w-8 h-8 border-4 border-brown-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  Loading logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  No notification logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {format(log.timestamp, 'MMM d, yyyy HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{log.recipient}</div>
                    <div className="text-gray-500 text-sm">{log.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-medium">{log.orderNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center text-green-600 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {log.status}
                    </span>
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
