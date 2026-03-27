import { getServerSession } from "next-auth";
import { getGmailClient } from "@/lib/gmail";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: messageId } = await params;
  console.log("Fetching message with ID:", messageId);

  try {
    const gmail = getGmailClient(session.accessToken, session.refreshToken);
    
    const res = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"]
    });

    const message = res.data;
    const headers = message.payload.headers;
    
    const getHeader = (name) => {
      const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : null;
    };

    console.log("Message fetched successfully:", { id: message.id, subject: getHeader('Subject') });

    return Response.json({
      id: message.id,
      from: getHeader('From'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      snippet: message.snippet
    });
  } catch (error) {
    console.error("Error fetching message:", error);
    return Response.json({ 
      error: "Failed to fetch message", 
      details: error.message 
    }, { status: 500 });
  }
}
