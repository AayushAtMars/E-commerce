import { useState, useEffect } from 'react';
import { catalogApi } from '../api/client';
import { Plus, Edit, LayoutList } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', imageUrl: '', displayOrder: 0 });
  const [formMsg, setFormMsg] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await catalogApi.get('/admin/categories');
      setCategories(res.data.data?.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await catalogApi.patch(`/admin/categories/${id}/visibility`);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const openNew = () => {
    setEditingCat(null);
    setFormData({ name: '', slug: '', description: '', imageUrl: '', displayOrder: 0 });
    setFormMsg('');
    setShowModal(true);
  };

  const openEdit = (cat: any) => {
    setEditingCat(cat);
    setFormData({ name: cat.name, slug: cat.slug, description: cat.description || '', imageUrl: cat.imageUrl || '', displayOrder: cat.displayOrder || 0 });
    setFormMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMsg('');
    try {
      if (editingCat) {
        await catalogApi.patch(`/admin/categories/${editingCat._id}`, formData);
      } else {
        await catalogApi.post('/admin/categories', formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      setFormMsg(err.response?.data?.message || 'Failed to save category');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading categories...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Categories</h2>
          <p className="text-sm text-gray-500 mt-1">Manage product categories</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus size={16} /> New Category
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <LayoutList size={16} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{cat.name}</p>
                      {cat.description && <p className="text-xs text-gray-400 truncate max-w-[200px]">{cat.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{cat.slug}</td>
                <td className="px-6 py-4 text-gray-500">{cat.displayOrder}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleToggle(cat._id)} className={`px-3 py-1 rounded-full text-xs font-medium ${cat.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    {cat.isActive ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(cat)} className="text-gray-400 hover:text-primary-600 p-2 rounded-lg hover:bg-primary-50 transition-colors">
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">{editingCat ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formMsg && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{formMsg}</div>}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Slug (URL friendly)</label>
                <input required type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Display Order</label>
                <input type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 disabled:opacity-50">
                  {formLoading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
