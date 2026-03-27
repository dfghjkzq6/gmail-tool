import { getServerSession } from "next-auth";
import { getGmailClient } from "@/lib/gmail";
import { debugLog, logSession, logEnvVars } from "@/lib/debug";

export async function GET() {
  debugLog('=== Gmail Messages API Called ===');
  
  try {
    logEnvVars();
    
    const session = await getServerSession();
    logSession(session);
    
    if (!session) {
      debugLog('ERROR: No session found');
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!session.accessToken) {
      debugLog('ERROR: No access token in session');
      return Response.json({ error: "No access token available" }, { status: 401 });
    }

    debugLog('Creating Gmail client...');
    const gmail = getGmailClient(session.accessToken, session.refreshToken);

    debugLog('Calling Gmail API...');
    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });

    debugLog('Gmail API response successful', {
      messagesCount: res.data.messages?.length || 0,
      hasNextPage: !!res.data.nextPageToken
    });

    return Response.json(res.data);
  } catch (error) {
    debugLog('ERROR: Gmail API failed', {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack
    });
    
    return Response.json({ 
      error: "Failed to fetch messages", 
      details: error.message,
      code: error.code,
      stack: error.stack 
    }, { status: 500 });
  }
}
