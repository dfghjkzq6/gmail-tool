import { getServerSession } from "next-auth";
import { getGmailClient } from "@/lib/gmail";

export async function GET() {
  const session = await getServerSession();
  const gmail = getGmailClient(session.accessToken, session.refreshToken);

  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults: 10,
  });

  return Response.json(res.data);
}
