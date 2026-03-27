import { getServerSession } from "next-auth";
import { getGmailClient } from "@/lib/gmail";

export async function GET(req) {
  const session = await getServerSession();
  const gmail = getGmailClient(session.accessToken, session.refreshToken);
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  const res = await gmail.users.messages.list({
    userId: "me",
    q: query, // e.g. "from:someone@gmail.com"
  });

  return Response.json(res.data);
}
