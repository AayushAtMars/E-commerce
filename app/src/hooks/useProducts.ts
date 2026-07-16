import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApiModule } from '../api/catalog.api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  colors: string[];
  sizes: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  sellerName: string;
  sellerAvatar?: string;
  sellerRole?: string;
  isFlashSale: boolean;
  isBestSeller: boolean;
  stock: number;
  createdAt: string;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sizes?: string;
  colors?: string;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useProducts(filter?: ProductFilter) {
  return useQuery({
    queryKey: ['products', filter],
    queryFn: async () => {
      const res = await catalogApiModule.getProducts(filter);
      return res.data as { data: Product[]; total: number; page: number; hasMore: boolean };
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useProductSearch(q: string, page = 1) {
  return useQuery({
    queryKey: ['products', 'search', q, page],
    queryFn: async () => {
      const res = await catalogApiModule.searchProducts(q, page);
      return res.data as { data: Product[]; total: number; hasMore: boolean };
    },
    enabled: q.trim().length > 0,
    staleTime: 60 * 1000,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const res = await catalogApiModule.getFeatured();
      return res.data.data as { flashSale: Product[]; bestSellers: Product[] };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await catalogApiModule.getCategories();
      return res.data.data.categories as string[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await catalogApiModule.getProduct(id);
      return res.data.data.product as Product;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}
