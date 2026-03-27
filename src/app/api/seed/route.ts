import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const existing = await User.findOne({ email: 'admin@srijagruthi.com' });
    if (existing) {
      // FORCE PASSWORD RESET TO admin123
      existing.password = hashedPassword;
      await existing.save();
      return NextResponse.json({ 
          message: 'Admin password RESET successful.',
          email: 'admin@srijagruthi.com',
          password: 'admin123'
      });
    }

    await User.create({
      name: 'Super Admin',
      email: 'admin@srijagruthi.com',
      password: hashedPassword,
      role: 'Admin',
    });
    
    return NextResponse.json({ 
        message: 'New Admin created successfully.',
        email: 'admin@srijagruthi.com',
        password: 'admin123' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
