import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import connectDB from '@/lib/db';
import DailySale from '@/models/DailySale';
import Product from '@/models/Product';
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
    const sales = await DailySale.find({}).populate('product').sort({ saleDate: -1, createdAt: -1 });
    const normalized = sales.map(s => {
      const data = s.toObject();
      let m = String(data.paymentMethod || 'Cash').trim().toUpperCase();
      const notes = String(data.notes || '').toLowerCase();
      const name = String(data.customerName || '').toLowerCase();
      
      // If ANY part of the record mentions UPI, it counts as UPI
      if (m === 'UPI' || notes.includes('upi') || name.includes('upi')) {
        m = 'UPI';
      } else {
        m = 'Cash';
      }
      return { ...data, paymentMethod: m };
    });
    return NextResponse.json(normalized);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    await connectDB();
    const body = await req.json();
    console.log(`[POST /api/sales] BODY:`, JSON.stringify(body));
    
    // FORENSIC LOG: Write payload to file for inspection
    try {
      const fs = require('fs');
      const logData = `[${new Date().toISOString()}] BODY: ${JSON.stringify(body)}\n`;
      fs.appendFileSync('c:\\Users\\BODIKE YOUGESH\\OneDrive\\Desktop\\shop\\payload_debug.log', logData);
    } catch (e) {}

    let { productId, quantitySold, notes, paymentMethod, customerName, sellingPrice } = body;
    
    let finalPayment = String(paymentMethod || 'Cash').trim().toUpperCase() === 'UPI' ? 'UPI' : 'Cash';
    if (notes?.toLowerCase().includes('upi') || customerName?.toLowerCase().includes('upi')) {
      finalPayment = 'UPI';
    }

    if (!finalPayment) return NextResponse.json({ error: 'Payment Method is Required' }, { status: 400 });
    if (!customerName || !customerName.trim()) return NextResponse.json({ error: 'Customer Name is Required' }, { status: 400 });

    // Fetch product to get current prices
    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Create daily sale using Mongoose
    const sale = await DailySale.create({
      product: productId,
      quantitySold: Number(quantitySold),
      sellingPrice: Number(sellingPrice) || product.price,
      purchasePrice: product.purchasePrice || 0,
      notes: String(notes || '').trim(),
      paymentMethod: finalPayment,
      customerName: String(customerName || 'Walk-in').trim(),
      saleDate: new Date(),
    });

    // Reduce stock automatically (Still using Mongoose here as it works)
    const updatedProduct = await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -quantitySold }
    }, { new: true });

    // Force a small delay to ensure DB consistency before UI refresh
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({ sale, updatedProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
