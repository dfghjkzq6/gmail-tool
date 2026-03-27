"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div>
        <h1>Gmail Tool</h1>
        <button onClick={() => signIn("google")}>Login with Google</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome {session.user.email}</h1>
      <button onClick={() => signOut()}>Logout</button>

      <hr />

      <button onClick={() => fetch("/api/gmail/messages").then(r => r.json()).then(console.log)}>
        Fetch Emails (check console)
      </button>

      <button onClick={() => fetch("/api/gmail/labels").then(r => r.json()).then(console.log)}>
        Fetch Labels (check console)
      </button>
    </div>
  );
}
