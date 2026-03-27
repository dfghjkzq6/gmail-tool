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

      <button onClick={() => fetch("/api/gmail/messages")
        .then(r => {
          if (!r.ok) {
            return r.text().then(text => {
              throw new Error(`HTTP ${r.status}: ${text}`);
            });
          }
          return r.json();
        })
        .then(console.log)
        .catch(console.error)}>
        Fetch Emails (check console)
      </button>

      <button onClick={() => fetch("/api/gmail/labels")
        .then(r => {
          if (!r.ok) {
            return r.text().then(text => {
              throw new Error(`HTTP ${r.status}: ${text}`);
            });
          }
          return r.json();
        })
        .then(console.log)
        .catch(console.error)}>
        Fetch Labels (check console)
      </button>
    </div>
  );
}
