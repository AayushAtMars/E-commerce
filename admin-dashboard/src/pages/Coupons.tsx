import { useState, useEffect } from 'react';
import { catalogApi } from '../api/client';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    code: '', title: '', description: '', discountType: 'percent', 
    discountValue: 0, minOrderValue: 0, maxDiscount: 0, 
    usageLimit: 100, expiresAt: '' 
  });
  const [formMsg, setFormMsg] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await catalogApi.get('/admin/coupons');
      setCoupons(res.data.data?.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this coupon?')) return;
    try {
      await catalogApi.delete(`/admin/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const openNew = () => {
    setEditingCoupon(null);
    setFormData({ 
      code: '', title: '', description: '', discountType: 'percent', 
      discountValue: 0, minOrderValue: 0, maxDiscount: 0, 
      usageLimit: 100, expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16) 
    });
    setFormMsg('');
    setShowModal(true);
  };

  const openEdit = (c: any) => {
    setEditingCoupon(c);
    setFormData({ 
      code: c.code, title: c.title, description: c.description || '', discountType: c.discountType, 
      discountValue: c.discountValue, minOrderValue: c.minOrderValue, maxDiscount: c.maxDiscount || 0, 
      usageLimit: c.usageLimit, expiresAt: new Date(c.expiresAt).toISOString().slice(0, 16) 
    });
    setFormMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMsg('');
    try {
      const payload = { ...formData, expiresAt: new Date(formData.expiresAt) };
      if (editingCoupon) {
        await catalogApi.patch(`/admin/coupons/${editingCoupon._id}`, payload);
      } else {
        await catalogApi.post('/admin/coupons', payload);
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err: any) {
      setFormMsg(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading coupons...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Coupons</h2>
          <p className="text-sm text-gray-500 mt-1">Manage discount codes</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus size={16} /> New Coupon
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Usage</th>
              <th className="px-6 py-4">Expires</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {coupons.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                      <Tag size={16} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{c.code}</p>
                      <p className="text-xs text-gray-500">{c.title}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900 font-medium">
                  {c.discountType === 'percent' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  {c.minOrderValue > 0 && <span className="text-xs text-gray-400 font-normal ml-2">(Min: ₹{c.minOrderValue})</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="w-full max-w-[100px]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{c.usedCount} used</span>
                      <span className="text-gray-400">{c.usageLimit}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (c.usedCount / c.usageLimit) * 100)}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(c.expiresAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.isActive && new Date(c.expiresAt) > new Date() ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {c.isActive ? (new Date(c.expiresAt) > new Date() ? 'Active' : 'Expired') : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-primary-600 p-2 rounded-lg hover:bg-primary-50 transition-colors">
                    <Edit size={16} />
                  </button>
                  {c.isActive && (
                    <button onClick={() => handleDelete(c._id)} className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-gray-900">{editingCoupon ? 'Edit Coupon' : 'New Coupon'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {formMsg && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{formMsg}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Code</label>
                  <input required type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none uppercase" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Discount Type</label>
                  <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Discount Value</label>
                  <input required type="number" min="0" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Min Order Value (₹)</label>
                  <input type="number" min="0" value={formData.minOrderValue} onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max Discount (₹, for % type)</label>
                  <input type="number" min="0" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" disabled={formData.discountType === 'flat'} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input required type="number" min="1" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Expires At</label>
                  <input required type="datetime-local" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>

            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
              <button onClick={handleSubmit} disabled={formLoading} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 disabled:opacity-50">
                {formLoading ? 'Saving...' : 'Save Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
