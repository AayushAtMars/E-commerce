import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogApi } from '../api/client';
import { ArrowLeft, Package, IndianRupee, Tag, Info, Star } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await catalogApi.get(`/products/${id}`);
      setProduct(res.data.data?.product);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <Link to="/products" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Products
        </Link>
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Product not found</h3>
          <p className="text-gray-500 mt-1">The product you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/products" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4">
            <ArrowLeft size={16} className="mr-1" /> Back to Products
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Product Details</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
            <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden mb-4">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <Package size={64} className="text-gray-300" />
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
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

        {/* Right Column - Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-2xl font-bold text-gray-900">{product.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            
            <p className="text-sm text-gray-400 mb-6">Product ID: {product._id}</p>

            <div className="flex items-center space-x-2 mb-8">
              <IndianRupee className="text-gray-400" size={24} />
              <span className="text-3xl font-bold text-gray-900">{product.price?.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                  <Tag size={16} className="mr-1" /> Category
                </h4>
                <p className="text-gray-900 font-medium capitalize">{product.category || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                  <Package size={16} className="mr-1" /> Inventory Stock
                </h4>
                <p className="text-gray-900 font-medium">{product.stock} units available</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                  <Star size={16} className="mr-1" /> Ratings & Reviews
                </h4>
                <p className="text-gray-900 font-medium">
                  {product.averageRating?.toFixed(1) || '0.0'} ★ ({product.numReviews || 0} reviews)
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                  <Info size={16} className="mr-1" /> Seller Name
                </h4>
                <p className="text-gray-900 font-medium">{product.sellerName || 'N/A'}</p>
              </div>
            </div>

            {(product.colors?.length > 0 || product.sizes?.length > 0) && (
              <div className="pt-6 mt-6 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Variants</h4>
                <div className="flex flex-wrap gap-4">
                  {product.colors?.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-medium block mb-1">Colors</span>
                      <div className="flex flex-wrap gap-1">
                        {product.colors.map((color: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded-md text-gray-700">{color}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.sizes?.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-medium block mb-1">Sizes</span>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map((size: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded-md text-gray-700">{size}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Description</h4>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
              {product.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
