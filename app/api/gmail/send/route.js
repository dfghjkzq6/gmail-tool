import { getServerSession } from "next-auth";
import { getGmailClient } from "@/lib/gmail";

export async function POST(req) {
  const session = await getServerSession();
  const gmail = getGmailClient(session.accessToken, session.refreshToken);
  const { to, subject, body } = await req.json();

  const message = [`To: ${to}`, `Subject: ${subject}`, "", body].join("\n");
  const encoded = Buffer.from(message).toString("base64");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encoded },
  });

  return Response.json(res.data);
}
