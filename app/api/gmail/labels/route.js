import { getServerSession } from "next-auth";
import { getGmailClient } from "@/lib/gmail";

export async function GET() {
  const session = await getServerSession();
  const gmail = getGmailClient(session.accessToken, session.refreshToken);

  const res = await gmail.users.labels.list({ userId: "me" });

  return Response.json(res.data);
}
