import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DailySale from '@/models/DailySale';

export async function GET(req: Request) {
  try {
    await connectDB();
    const result = await DailySale.deleteMany({});
    return NextResponse.json({ 
      success: true, 
      message: `Successfully wiped ${result.deletedCount} sales from the database. The sales revenue is now 0.` 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
