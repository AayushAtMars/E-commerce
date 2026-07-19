import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      category, minPrice, maxPrice, minRating,
      sizes, colors, sort, page, limit,
    } = req.query;

    const result = await productService.listProducts({
      category: category as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      sizes: sizes ? (sizes as string).split(',') : undefined,
      colors: colors ? (colors as string).split(',') : undefined,
      sort: sort as 'price_asc' | 'price_desc' | 'rating' | 'newest',
      page: page ? Number(page) : 1,
      limit: limit ? Math.min(Number(limit), 50) : 20,
    });

    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function searchProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const q = String(req.query.q ?? '').trim();
    const page = Number(req.query.page ?? 1);
    const limit = Math.min(Number(req.query.limit ?? 20), 50);

    if (!q) {
      res.json({ success: true, data: [], total: 0, page: 1, limit, hasMore: false });
      return;
    }

    const result = await productService.searchProducts(q, page, limit);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductById(String(req.params.id));
    res.json({ success: true, data: { product } });
  } catch (err) { next(err); }
}

export async function getFeatured(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await productService.getFeaturedProducts();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await productService.getCategories();
    res.json({ success: true, data: { categories } });
  } catch (err) { next(err); }
}

// Internal endpoint for Service B
export async function getProductPrice(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await productService.getProductPriceInternal(String(req.params.id));
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, message: 'Product created successfully', data: { product } });
  } catch (err) { next(err); }
}
