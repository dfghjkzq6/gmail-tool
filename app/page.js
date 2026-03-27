"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]);

  async function fetchMessages() {
    try {
      console.log("Fetching messages...");
      const res = await fetch("/api/gmail/messages");
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API response not OK:", res.status, errorText);
        return;
      }
      
      const data = await res.json();
      console.log("Messages data received:", data);
      
      if (data.error) {
        console.error("API returned error:", data);
        return;
      }
      
      // Fetch full message details for each message ID
      const messagePromises = (data.messages || []).slice(0, 5).map(async (msg) => {
        try {
          console.log("Fetching details for message:", msg.id);
          const msgRes = await fetch(`/api/gmail/messages/${msg.id}`);
          
          if (!msgRes.ok) {
            const errorText = await msgRes.text();
            console.error(`Failed to fetch message ${msg.id}:`, msgRes.status, errorText);
            return { id: msg.id, subject: `Error (${msgRes.status})`, from: '', snippet: errorText };
          }
          
          const msgData = await msgRes.json();
          console.log("Message data received:", msgData);
          
          return {
            id: msg.id,
            subject: msgData.subject || 'No subject',
            from: msgData.from || 'Unknown sender',
            snippet: msgData.snippet || ''
          };
        } catch (error) {
          console.error(`Error fetching message ${msg.id}:`, error);
          return { id: msg.id, subject: 'Error loading', from: '', snippet: error.message };
        }
      });
      
      const fullMessages = await Promise.all(messagePromises);
      setMessages(fullMessages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }

  console.log("Session status:", status);
  console.log("Session data:", session);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div>
        <h1>Gmail Tool</h1>
        <button onClick={() => signIn("google", {}, { prompt: "select_account" })}>Login with Google</button>
        <button onClick={() => signIn()}>Login (Default)</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome {session.user?.email}</h1>
      <button onClick={() => signOut()}>Logout</button>

      <hr />

      <button onClick={fetchMessages}>Load My Emails</button>

      <ul>
        {messages.map((msg) => (
          <li key={msg.id} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            <div><strong>From:</strong> {msg.from}</div>
            <div><strong>Subject:</strong> {msg.subject}</div>
            <div><em>{msg.snippet}</em></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
