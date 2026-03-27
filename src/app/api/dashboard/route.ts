import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import DailySale from '@/models/DailySale';
import Settings from '@/models/Settings';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretkey123');
async function isAdmin(req: Request) {
  const cookieHeader = req.headers.get('cookie');
  const token = cookieHeader?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === 'Admin';
  } catch (err) {
    return false;
  }
}

export async function GET(req: Request) {
  try {
    if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    await connectDB();
    
    const totalOrdersCount = await Order.countDocuments();
    
    const orders = await Order.find({ status: { $ne: 'Cancelled' } });
    const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    
    const products = await Product.find({});
    let totalStock = 0;
    const lowStockAlerts: any[] = [];
    
    // Fetch user-defined threshold
    let settings = await Settings.findOne();
    const threshold = settings?.lowStockThreshold || 10;

    products.forEach(p => {
      totalStock += p.stock;
      const productThreshold = p.lowStockThreshold !== undefined ? p.lowStockThreshold : threshold;
      if (p.stock <= productThreshold) {
        lowStockAlerts.push(p);
      }
    });

    // Aggregate top selling products from all DailySale records
    const topSellingPipeline = [
      { $group: { _id: "$product", count: { $sum: "$quantitySold" } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ];
    const topSales = await DailySale.aggregate(topSellingPipeline as any);
    const populatedTop = await Product.find({ _id: { $in: topSales.map(t => t._id) } });
    
    // Sort populated products to match the topSales order
    const sortedTop = topSales.map(ts => {
      const p = populatedTop.find(prod => prod._id.toString() === ts._id.toString());
      return p ? { ...p.toObject(), count: ts.count } : null;
    }).filter(p => p !== null);
    
    const allSalesRecords = await DailySale.find({}).populate('product');
    const totalRevenue = allSalesRecords.reduce((acc, s) => {
      const sell = s.sellingPrice || s.product?.price || 0;
      return acc + (sell * (s.quantitySold || 0));
    }, 0);
    
    const totalProfit = allSalesRecords.reduce((acc, s) => {
      const sell = s.sellingPrice || s.product?.price || 0;
      const buy = s.purchasePrice || s.product?.purchasePrice || 0;
      return acc + ((sell - buy) * (s.quantitySold || 0));
    }, 0);

    const dashboardData = {
      totalOrders: totalOrdersCount,
      totalSales: totalRevenue, // Renamed to totalSales for frontend compatibility
      totalRevenue,
      totalProfit,
      totalStock,
      lowStockAlerts,
      topSelling: sortedTop
    };

    return NextResponse.json(dashboardData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
