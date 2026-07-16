import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApiModule } from '../api/catalog.api';
import type { Product } from './useProducts';

export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await catalogApiModule.getWishlist();
      return res.data.data.products as Product[];
    },
    staleTime: 60 * 1000,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (productId: string) => catalogApiModule.addToWishlist(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => catalogApiModule.removeFromWishlist(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const toggle = (productId: string, isWishlisted: boolean) => {
    if (isWishlisted) {
      removeMutation.mutate(productId);
    } else {
      addMutation.mutate(productId);
    }
  };

  return {
    toggle,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
}
