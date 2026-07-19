import { useState, useEffect } from 'react';
import { catalogApi } from '../api/client';
import { Plus, MoreVertical, X } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    sellerName: '',
    stock: '100',
    colors: '',
    sizes: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await catalogApi.get('/products?limit=50');
      setProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        sellerName: formData.sellerName,
        stock: Number(formData.stock),
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : [],
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : [],
        images: ['https://via.placeholder.com/400'], // Default placeholder image
      };

      await catalogApi.post('/products', payload);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', category: '', price: '', sellerName: '', stock: '100', colors: '', sizes: '' });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your catalog and inventory.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl transition-colors shadow-sm font-medium text-sm"
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-1">Get started by adding a new product to your catalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">?</div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 line-clamp-1">{product.title}</div>
                          <div className="text-xs text-gray-400">{product.sellerName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${product.stock < 10 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-900 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Add New Product</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input required name="title" value={formData.title} onChange={handleInputChange} type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input required name="category" value={formData.category} onChange={handleInputChange} type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input required name="price" value={formData.price} onChange={handleInputChange} type="number" min="0" step="0.01" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seller Name</label>
                    <input required name="sellerName" value={formData.sellerName} onChange={handleInputChange} type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input required name="stock" value={formData.stock} onChange={handleInputChange} type="number" min="0" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Colors (comma separated)</label>
                    <input name="colors" value={formData.colors} onChange={handleInputChange} type="text" placeholder="Red, Blue, Green" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma separated)</label>
                    <input name="sizes" value={formData.sizes} onChange={handleInputChange} type="text" placeholder="S, M, L, XL" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                form="productForm" 
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl font-medium text-white bg-primary-600 hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? 'Saving...' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
