import { Router } from 'express';
import * as controller from '../controllers/product.controller';
import { internalAuthMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { productIdParamsSchema, searchProductsQuerySchema, paginationQuerySchema, createProductBodySchema } from '../validators/product.validators';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware';
import { updateProduct, toggleProductVisibility, bulkToggleVisibility } from '../services/product.service';
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';

const router = Router();

// Admin: create product (protected)
router.post('/', adminAuthMiddleware, validate({ body: createProductBodySchema }), controller.createProduct);

// Admin: update product fields
const updateProductSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().min(0).optional(),
  discountPrice: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  sellerName: z.string().optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  isFlashSale: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
});

router.patch('/:id', adminAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Validation error', code: 'VALIDATION_ERROR', issues: parsed.error.issues });
      return;
    }
    const product = await updateProduct(String(req.params.id), parsed.data);
    res.json({ success: true, data: { product } });
  } catch (err) { next(err); }
});

// Admin: toggle product visibility
router.patch('/:id/visibility', adminAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await toggleProductVisibility(String(req.params.id));
    res.json({ success: true, data: { product }, message: `Product is now ${product.isVisible ? 'visible' : 'hidden'}.` });
  } catch (err) { next(err); }
});

// Admin: bulk visibility toggle
router.post('/bulk-visibility', adminAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productIds, isVisible } = req.body as { productIds: string[]; isVisible: boolean };
    if (!Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({ success: false, message: 'productIds array required.', code: 'VALIDATION_ERROR' });
      return;
    }
    const result = await bulkToggleVisibility(productIds, isVisible);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// Admin: list ALL products including hidden
router.get('/admin/all', adminAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(String(req.query.page ?? '1'), 10);
    const limit = parseInt(String(req.query.limit ?? '50'), 10);
    const products = await Product.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await Product.countDocuments();
    res.json({ success: true, data: products, total, page, limit });
  } catch (err) { next(err); }
});

// Public routes
router.get('/', validate({ query: paginationQuerySchema }), controller.listProducts);
router.get('/search', validate({ query: searchProductsQuerySchema }), controller.searchProducts);
router.get('/featured', controller.getFeatured);
router.get('/categories', controller.getCategories);
router.get('/:id', validate({ params: productIdParamsSchema }), controller.getProduct);

export default router;

// Internal router (mounted separately under /internal)
export const internalProductRouter = Router();
internalProductRouter.get('/products/:id/price', internalAuthMiddleware, validate({ params: productIdParamsSchema }), controller.getProductPrice);

import * as couponController from '../controllers/coupon.controller';
internalProductRouter.post('/coupons/validate', internalAuthMiddleware, couponController.validateCoupon);
internalProductRouter.post('/coupons/record-usage', internalAuthMiddleware, couponController.recordCouponUsage);
