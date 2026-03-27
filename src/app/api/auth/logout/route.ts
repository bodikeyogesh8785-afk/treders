import { NextResponse } from 'next/dist/server/web/spec-extension/response';

export async function POST(req: Request) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('token');
  return response;
}
