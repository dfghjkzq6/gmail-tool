import { db } from "@/lib/db";
import { getGmailClient } from "@/lib/gmail";

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams?.userId || resolvedParams?.['userId'];
    
    if (!userId) {
      return Response.json({ error: "No userId provided" }, { status: 400 });
    }

    // Get user from database
    const user = await db.findById(userId);
    
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has tokens
    if (!user.access_token) {
      return Response.json({
        userId: user.id,
        email: user.email,
        hasTokens: false,
        status: "no_tokens",
        message: "User has never authenticated"
      });
    }

    // Test if tokens are valid by making a simple Gmail API call
    try {
      const gmail = getGmailClient(user.access_token, user.refresh_token);
      await gmail.users.getProfile({ userId: "me" });
      
      return Response.json({
        userId: user.id,
        email: user.email,
        hasTokens: true,
        status: "valid",
        message: "Tokens are valid and working"
      });
    } catch (error) {
      // Check if it's a token expiration error
      if (error.message?.includes('invalid_grant') || error.message?.includes('401') || error.code === 401) {
        return Response.json({
          userId: user.id,
          email: user.email,
          hasTokens: true,
          status: "expired",
          message: "Tokens have expired, re-authentication required"
        });
      }
      
      // Other Gmail API errors
      return Response.json({
        userId: user.id,
        email: user.email,
        hasTokens: true,
        status: "error",
        message: "Gmail API error: " + error.message
      });
    }

  } catch (error) {
    console.error('Token status check failed:', error);
    return Response.json({ error: "Failed to check token status" }, { status: 500 });
  }
}
