import { Router } from 'express';
import * as controller from '../controllers/product.controller';
import { internalAuthMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { productIdParamsSchema, searchProductsQuerySchema, paginationQuerySchema } from '../validators/product.validators';

const router = Router();

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
