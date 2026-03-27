import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
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

export async function PUT(req: Request, context: any) {
  try {
    const params = await context.params;
    const { id } = params;
    
    if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    await connectDB();
    
    const { status } = await req.json();
    console.log(`[ORDER_UPDATE] ID: ${id}, New Status: ${status}`);
    
    if (!status) return NextResponse.json({ error: 'Status is required' }, { status: 400 });

    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
