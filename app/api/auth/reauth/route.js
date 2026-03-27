import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    console.log('🔄 Processing re-authentication request for:', email);

    // Find user in database
    const user = await db.findByEmail(email);
    
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Clear tokens to force re-authentication
    await db.updateTokens(email, null, null);
    
    console.log('✅ Tokens cleared for user:', email);

    return Response.json({ 
      success: true,
      message: "Tokens cleared. User needs to re-authenticate.",
      email: email
    });

  } catch (error) {
    console.error('Re-authentication error:', error);
    return Response.json({ 
      error: "Failed to process re-authentication" 
    }, { status: 500 });
  }
}
