import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    const users = await db.getAll();
    
    return NextResponse.json({
      message: "Debug endpoint working",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        userCount: users.length,
        users: users.map(u => ({ id: u.id, name: u.name, email: u.email, createdAt: u.created_at }))
      },
      env: {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
      }
    });
  } catch (error) {
    return NextResponse.json({
      message: "Debug endpoint working",
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message
      },
      env: {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
      }
    });
  }
}
