import { initDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await initDatabase();
    return NextResponse.json({ 
      success: true, 
      message: "Database initialized successfully" 
    });
  } catch (error) {
    console.error('Database initialization failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
