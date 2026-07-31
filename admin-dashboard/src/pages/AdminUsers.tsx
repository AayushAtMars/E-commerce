import { useState, useEffect } from 'react';
import { catalogApi } from '../api/client';
import { Shield, Plus, X, UserCheck, UserX } from 'lucide-react';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  super_admin:   { label: 'Super Admin',   color: 'bg-purple-100 text-purple-800' },
  order_manager: { label: 'Order Manager', color: 'bg-blue-100 text-blue-800' },
  support:       { label: 'Support',       color: 'bg-gray-100 text-gray-700' },
};

const currentRole = () => localStorage.getItem('adminRole') || '';

export default function AdminUsers() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'support' });

  // Only super_admin can access this page
  const isSuperAdmin = currentRole() === 'super_admin';

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      const res = await catalogApi.get('/admin/auth/admins');
      setAdmins(res.data.data?.admins || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load admin users.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await catalogApi.post('/admin/auth/admins', formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'support' });
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create admin user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (admin: any) => {
    const action = admin.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} "${admin.name}"?`)) return;
    try {
      await catalogApi.patch(`/admin/auth/admins/${admin._id}`, { isActive: !admin.isActive });
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${action} user.`);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Shield size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Access Restricted</h3>
        <p className="text-gray-500 mt-1 text-sm">Only Super Admins can manage admin users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Admin Users</h2>
          <p className="text-sm text-gray-500 mt-1">Manage admin accounts and roles.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> Create Admin
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center">
            <Shield size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No admin users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Admin</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Last Login</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => {
                  const roleCfg = ROLE_LABELS[admin.role] || ROLE_LABELS.support;
                  return (
                    <tr key={admin._id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{admin.name}</div>
                        <div className="text-xs text-gray-400">{admin.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleCfg.color}`}>
                          {roleCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${admin.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleActive(admin)}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${admin.isActive ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        >
                          {admin.isActive ? <><UserX size={14} /> Deactivate</> : <><UserCheck size={14} /> Activate</>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Create Admin User</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                <input required type="password" minLength={8} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm">
                  <option value="support">Support</option>
                  <option value="order_manager">Order Manager</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-primary-600 hover:bg-primary-500 transition-colors disabled:opacity-50 text-sm shadow-sm">
                  {isSubmitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
