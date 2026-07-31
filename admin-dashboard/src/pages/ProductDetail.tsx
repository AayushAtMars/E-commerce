import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogApi } from '../api/client';
import {
  ArrowLeft, Package, IndianRupee, Tag, Info, Star,
  Pencil, Save, X, Eye, EyeOff, Check
} from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visibilityLoading, setVisibilityLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [form, setForm] = useState<any>({});

  useEffect(() => { fetchProduct(); }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await catalogApi.get(`/products/${id}`);
      const p = res.data.data?.product;
      setProduct(p);
      setForm({
        title: p?.title ?? '',
        price: p?.price ?? 0,
        discountPrice: p?.discountPrice ?? '',
        stock: p?.stock ?? 0,
        category: p?.category ?? '',
        sellerName: p?.sellerName ?? '',
        isFlashSale: p?.isFlashSale ?? false,
        isBestSeller: p?.isBestSeller ?? false,
        description: p?.description ?? '',
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const payload: any = { ...form };
      if (payload.discountPrice === '' || payload.discountPrice === null) {
        delete payload.discountPrice;
      } else {
        payload.discountPrice = parseFloat(payload.discountPrice);
      }
      payload.price = parseFloat(payload.price);
      payload.stock = parseInt(payload.stock, 10);

      const res = await catalogApi.patch(`/products/${id}`, payload);
      setProduct(res.data.data?.product);
      setEditMode(false);
      setSaveMsg('✅ Product updated successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err: any) {
      setSaveMsg(`❌ ${err.response?.data?.message || 'Failed to save changes.'}`);
    } finally { setSaving(false); }
  };

  const handleToggleVisibility = async () => {
    setVisibilityLoading(true);
    try {
      const res = await catalogApi.patch(`/products/${id}/visibility`);
      setProduct(res.data.data?.product);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle visibility.');
    } finally { setVisibilityLoading(false); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading product details...</div>;

  if (!product) return (
    <div className="space-y-6">
      <Link to="/products" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
        <ArrowLeft size={16} className="mr-1" /> Back to Products
      </Link>
      <div className="bg-white p-12 text-center rounded-2xl border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">Product not found</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/products" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4">
            <ArrowLeft size={16} className="mr-1" /> Back to Products
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Product Details</h2>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Visibility toggle */}
          <button
            onClick={handleToggleVisibility}
            disabled={visibilityLoading}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              product.isVisible !== false
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {product.isVisible !== false ? <><Eye size={16} /> Visible</> : <><EyeOff size={16} /> Hidden</>}
          </button>

          {editMode ? (
            <>
              <button onClick={() => { setEditMode(false); setSaveMsg(''); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-50 transition-colors shadow-sm">
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-500 transition-colors shadow-sm">
              <Pencil size={16} /> Edit Product
            </button>
          )}
        </div>
      </div>

      {saveMsg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${saveMsg.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
          {saveMsg.startsWith('✅') ? <Check size={16} /> : <X size={16} />}
          {saveMsg.replace('✅ ', '').replace('❌ ', '')}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col — Images */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
            <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden mb-4">
              {product.images?.length > 0 ? (
                <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <Package size={64} className="text-gray-300" />
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1).map((img: string, i: number) => (
                  <div key={i} className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right col — Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">

            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Price (₹)</label>
                    <input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Discount Price (₹)</label>
                    <input type="number" min="0" value={form.discountPrice} onChange={e => setForm({ ...form, discountPrice: e.target.value })}
                      placeholder="Leave blank to remove"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Stock (units)</label>
                    <input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                    <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Seller Name</label>
                  <input type="text" value={form.sellerName} onChange={e => setForm({ ...form, sellerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFlashSale} onChange={e => setForm({ ...form, isFlashSale: e.target.checked })}
                      className="w-4 h-4 rounded text-primary-600" />
                    <span className="text-sm font-medium text-gray-700">Flash Sale</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isBestSeller} onChange={e => setForm({ ...form, isBestSeller: e.target.checked })}
                      className="w-4 h-4 rounded text-primary-600" />
                    <span className="text-sm font-medium text-gray-700">Best Seller</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{product.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-4">ID: {product._id}</p>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    <IndianRupee size={20} className="text-gray-500" />
                    <span className="text-3xl font-bold text-gray-900">{product.price?.toFixed(2)}</span>
                  </div>
                  {product.discountPrice && (
                    <span className="text-xl text-emerald-600 font-semibold">
                      Sale: ₹{product.discountPrice?.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1"><Tag size={14} /> Category</h4>
                    <p className="text-gray-900 font-medium capitalize">{product.category || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1"><Package size={14} /> Seller</h4>
                    <p className="text-gray-900 font-medium">{product.sellerName || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1"><Star size={14} /> Rating</h4>
                    <p className="text-gray-900 font-medium">
                      {product.rating?.toFixed(1) || '0.0'} ★ ({product.reviewCount || 0} reviews)
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1"><Info size={14} /> Flags</h4>
                    <div className="flex gap-1.5 flex-wrap">
                      {product.isFlashSale && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">Flash Sale</span>}
                      {product.isBestSeller && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">Best Seller</span>}
                      {!product.isFlashSale && !product.isBestSeller && <span className="text-gray-400 text-xs">None</span>}
                    </div>
                  </div>
                </div>

                {(product.colors?.length > 0 || product.sizes?.length > 0) && (
                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Variants</h4>
                    <div className="space-y-3">
                      {product.colors?.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-400 uppercase font-medium block mb-1">Colors</span>
                          <div className="flex flex-wrap gap-1">
                            {product.colors.map((c: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded-md text-gray-700">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {product.sizes?.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-400 uppercase font-medium block mb-1">Sizes</span>
                          <div className="flex flex-wrap gap-1">
                            {product.sizes.map((s: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded-md text-gray-700">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {!editMode && (
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Description</h4>
              <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                {product.description || 'No description provided.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
