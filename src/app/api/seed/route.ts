import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await connectDB();
    const existing = await User.findOne({ email: 'admin@srijagruthi.com' });
    if (existing) {
      return NextResponse.json({ message: 'Seed already complete' });
    }
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Super Admin',
      email: 'admin@srijagruthi.com',
      password: hashedPassword,
      role: 'Admin',
    });
    return NextResponse.json({ message: 'Admin created successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
