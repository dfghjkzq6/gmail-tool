import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Debug endpoint working",
    timestamp: new Date().toISOString(),
    env: {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
    }
  });
}
