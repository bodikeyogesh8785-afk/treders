import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import DailySale from '@/models/DailySale';
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
    const orders = await Order.find({}).populate('products.product').sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Reduce stock and log daily sales for products ordered
    for (const item of body.products) {
      const product = await Product.findById(item.product);
      if (product) {
        // Log as an online sale for profit tracking
        await DailySale.create({
          product: item.product,
          quantitySold: item.quantity,
          sellingPrice: product.price,
          purchasePrice: product.purchasePrice,
          paymentMethod: 'UPI',
          notes: `Order from ${body.customerName}`,
        });
        
        // Update stock
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }
    }

    const newOrder = await Order.create(body);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
