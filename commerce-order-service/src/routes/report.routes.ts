import { Router, Request, Response, NextFunction } from 'express';
import { adminAuthMiddleware, requireRole } from '../middlewares/adminAuth.middleware';
import { Order } from '../models/Order';

const router = Router();

router.get('/summary', adminAuthMiddleware, requireRole('super_admin', 'order_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage: any = {};
    
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
    }

    const [summaryResult, dailyRevenueResult, topProductsResult] = await Promise.all([
      // Overall Summary
      Order.aggregate([
        { $match: matchStage },
        { 
          $group: { 
            _id: null, 
            totalRevenue: { $sum: "$total" },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: "$total" }
          }
        }
      ]),
      // Daily Revenue Chart Data
      Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Top Products
      Order.aggregate([
        { $match: matchStage },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            title: { $first: "$items.title" },
            image: { $first: "$items.image" },
            unitsSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
          }
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 10 }
      ])
    ]);

    const summary = summaryResult[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    
    // Format daily revenue
    const dailyChartData = dailyRevenueResult.map(item => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orders
    }));

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: summary.totalRevenue,
          totalOrders: summary.totalOrders,
          avgOrderValue: summary.avgOrderValue || 0
        },
        dailyChartData,
        topProducts: topProductsResult
      }
    });

  } catch (err) {
    next(err);
  }
});

export default router;
