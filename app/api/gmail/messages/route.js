import { getServerSession } from "next-auth";
import { getGmailClient } from "@/lib/gmail";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  console.log("Session found:", {
    hasAccessToken: !!session.accessToken,
    hasRefreshToken: !!session.refreshToken,
    userEmail: session.user?.email
  });

  try {
    const gmail = getGmailClient(session.accessToken, session.refreshToken);

    console.log("Making Gmail API call...");
    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });

    console.log("Gmail API response:", res.data);
    return Response.json(res.data);
  } catch (error) {
    console.error("Gmail API error:", error);
    return Response.json({ 
      error: "Gmail API failed", 
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
