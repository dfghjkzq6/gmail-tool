"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const THEMES = {
  light: {
    bg: "#f2f2f7", card: "#ffffff", sidebar: "#f8f8fa",
    text: "#000000", sub: "#6e6e73", border: "#e5e5ea",
    accent: "#007aff", topbar: "#ffffff", hover: "#f5f5f7",
    selected: "#e8f0fe", inputBg: "#e8e8ed", unread: "#007aff",
  },
  dark: {
    bg: "#0d0d0f", card: "#1c1c1e", sidebar: "#161618",
    text: "#ffffff", sub: "#8e8e93", border: "#2c2c2e",
    accent: "#0a84ff", topbar: "#1c1c1e", hover: "#2c2c2e",
    selected: "#1a3a5c", inputBg: "#2c2c2e", unread: "#0a84ff",
  },
};

function useTheme() {
  const [mode, setMode] = useState("light");
  return { t: THEMES[mode], mode, toggle: () => setMode(m => m === "light" ? "dark" : "light") };
}

function Avatar({ name, size = 38 }) {
  const letter = (name || "?")[0].toUpperCase();
  const colors = ["#007aff","#34c759","#ff9500","#ff2d55","#af52de","#5ac8fa","#ff6b35","#30b0c7"];
  const color = colors[letter.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color,
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
    }}>{letter}</div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (d.getFullYear() === now.getFullYear())
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "2-digit" });
}

function extractName(from = "") {
  const match = from.match(/^"?([^"<]+)"?\s*</);
  return match ? match[1].trim() : from.replace(/<.*?>/, "").trim() || from;
}

function getTokenStatusText(userId) {
  const status = tokenStatuses[userId];
  if (!status) return "⚠ No tokens";
  
  switch (status) {
    case 'valid': return "✓ Authenticated";
    case 'expired': return "⚠ Tokens expired";
    case 'error': return "❌ Error";
    default: return "⚠ Unknown status";
  }
}

function getTokenStatusColor(userId) {
  const status = tokenStatuses[userId];
  if (!status) return "#ff3b30";
  
  switch (status) {
    case 'valid': return "#34c759";
    case 'expired': return "#ff9500";
    case 'error': return "#ff3b30";
    default: return "#8e8e93";
  }
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { t, mode, toggle } = useTheme();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageDetail, setMessageDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [reauthNeeded, setReauthNeeded] = useState(null);
  const [tokenStatuses, setTokenStatuses] = useState({});

  useEffect(() => {
    if (session) loadUsers();
  }, [session]);

  useEffect(() => {
    if (selectedUser) loadMessages();
  }, [selectedUser]);

  async function loadUsers() {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      console.log('Loaded users:', data);
      setUsers(data.users || []);
      
      // Check token status for all users
      const statuses = {};
      for (const user of data.users || []) {
        if (user.hasTokens) {
          try {
            const statusRes = await fetch(`/api/users/${user.id}/token-status`);
            const statusData = await statusRes.json();
            statuses[user.id] = statusData.status;
          } catch (error) {
            console.error(`Failed to check token status for ${user.email}:`, error);
            statuses[user.id] = 'error';
          }
        }
      }
      setTokenStatuses(statuses);
      
      if (data.users?.length > 0 && !selectedUser) {
        // Find first user with a valid ID
        const validUser = data.users.find(user => user && user.id);
        if (validUser) {
          console.log('Setting selected user:', validUser);
          setSelectedUser(validUser);
        } else {
          console.warn('No users with valid IDs found');
        }
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }

  async function loadMessages(pageToken = null) {
    if (!selectedUser || !selectedUser.id) {
      console.log('No valid selected user, skipping message load');
      setMessages([]);
      setNextPageToken(null);
      return;
    }
    
    console.log('Loading messages for user:', selectedUser.email);
    setLoading(true);
    try {
      const url = `/api/admin/users/${selectedUser.id}/messages${pageToken ? `?pageToken=${pageToken}` : ""}`;
      console.log('Fetching from URL:', url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      console.log('Messages response:', data);
      console.log('Response status:', res.status);
      
      if (data.error) {
        console.error('API Error:', data.error);
        if (data.requiresReauth) {
          setReauthNeeded(selectedUser);
        }
        return;
      }
      
      setMessages(prev => pageToken ? [...prev, ...(data.messages || [])] : (data.messages || []));
      setNextPageToken(data.nextPageToken || null);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function openMessage(msg) {
    if (!selectedUser || !selectedUser.id) {
      console.error('No valid selected user for message detail');
      return;
    }
    
    setSelectedMessage(msg);
    setDetailLoading(true);
    setMessageDetail(null);
    
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/messages?id=${msg.id}`);
      const data = await res.json();
      
      if (data.error) {
        console.error('API Error:', data.error);
        return;
      }
      
      setMessageDetail(data);
    } catch (error) {
      console.error('Failed to load message detail:', error);
    } finally {
      setDetailLoading(false);
    }
  }

  // Re-authentication component
  const ReauthModal = () => {
    if (!reauthNeeded) return null;
    
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}>
        <div style={{
          background: t.card,
          padding: "32px",
          borderRadius: "16px",
          maxWidth: "400px",
          width: "90%",
          border: `1px solid ${t.border}`,
          textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔄</div>
          <h3 style={{ margin: "0 0 16px", color: t.text, fontSize: "18px", fontWeight: "600" }}>
            Re-authentication Required
          </h3>
          <p style={{ margin: "0 0 24px", color: t.sub, fontSize: "14px", lineHeight: "1.5" }}>
            User <strong>{reauthNeeded.email}</strong> needs to re-authenticate with Gmail. 
            Please have them sign in again to refresh their access tokens.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button onClick={() => setReauthNeeded(null)} style={{
              background: t.inputBg,
              border: `1px solid ${t.border}`,
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              cursor: "pointer",
              color: t.text
            }}>
              Dismiss
            </button>
            <button onClick={() => {
              window.open(`/`, '_blank');
              setReauthNeeded(null);
            }} style={{
              background: t.accent,
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              cursor: "pointer",
              color: "#fff",
              fontWeight: "500"
            }}>
              Open Sign-in Page
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!session) {
    return (
      <div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: THEMES.light.bg }}>
        <div style={{ color: THEMES.light.sub, fontSize: 14 }}>Please sign in to access admin dashboard</div>
      </div>
    );
  }

  return (
    <div style={{
      height: "100dvh", display: "flex", background: t.bg,
      color: t.text, fontFamily: "-apple-system, BlinkMacSystemFont, system-ui",
      overflow: "hidden",
    }}>
      {/* User Sidebar */}
      <div style={{
        width: 280, background: t.sidebar, borderRight: `1px solid ${t.border}`,
        display: "flex", flexDirection: "column", padding: "16px",
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, padding: "8px 0 16px", color: t.text }}>
          👥 Users
        </div>
        
        {users.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: t.sub }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>👤</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>No Users Found</div>
            <div style={{ fontSize: 12, marginBottom: 16 }}>
              No users have authenticated yet.
            </div>
            <a 
              href="/"
              style={{
                display: "inline-block",
                padding: "8px 16px",
                background: t.accent,
                color: "#fff",
                textDecoration: "none",
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              Authenticate First User
            </a>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto" }}>
            {users.filter(user => user && user.id).map(user => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px", borderRadius: 10, cursor: "pointer",
                  background: selectedUser?.id === user.id ? t.selected : "none",
                  marginBottom: 4,
                }}
              >
                <Avatar name={user.name} />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: t.text }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 12, color: t.sub, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.email}
                  </div>
                  <div style={{ fontSize: 11, color: getTokenStatusColor(user.id), fontWeight: 500 }}>
                    {getTokenStatusText(user.id)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div style={{ paddingTop: 16, borderTop: `1px solid ${t.border}` }}>
          <button onClick={toggle} style={{
            background: t.inputBg, border: "none", borderRadius: 8,
            padding: "8px 12px", fontSize: 13, cursor: "pointer", color: t.text, width: "100%",
          }}>
            {mode === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Message List */}
        <div style={{
          flex: "0 0 380px", background: t.bg, borderRight: `1px solid ${t.border}`,
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          <div style={{
            padding: "16px", background: t.topbar, borderBottom: `1px solid ${t.border}`,
          }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: t.text }}>
              {selectedUser ? `${selectedUser.name}'s Inbox` : "Select a user"}
            </h2>
            {selectedUser && (
              <div style={{ fontSize: 12, color: t.sub, marginTop: 4 }}>
                {selectedUser.email}
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 48, textAlign: "center", color: t.sub, fontSize: 14 }}>
                Loading messages...
              </div>
            ) : !selectedUser ? (
              <div style={{ padding: 48, textAlign: "center", color: t.sub, fontSize: 14 }}>
                Select a user to view their emails
              </div>
            ) : messages.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: t.sub, fontSize: 14 }}>
                No messages found
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  style={{
                    display: "flex", gap: 12, padding: "12px 16px",
                    borderBottom: `1px solid ${t.border}`, cursor: "pointer",
                    background: selectedMessage?.id === msg.id ? t.selected : t.card,
                    borderLeft: msg.unread ? `3px solid ${t.accent}` : "3px solid transparent",
                  }}
                >
                  <Avatar name={extractName(msg.from)} />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                      {extractName(msg.from)}
                    </div>
                    <div style={{ fontSize: 13, color: t.text, fontWeight: msg.unread ? 600 : 400 }}>
                      {msg.subject || "(no subject)"}
                    </div>
                    <div style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>
                      {formatDate(msg.date)}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {nextPageToken && (
              <div style={{ padding: 16, textAlign: "center" }}>
                <button onClick={() => loadMessages(nextPageToken)} style={{
                  background: t.inputBg, border: "none", borderRadius: 8,
                  padding: "8px 16px", fontSize: 12, cursor: "pointer", color: t.accent,
                }}>
                  Load more
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div style={{
          flex: 1, background: t.bg, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {!selectedMessage ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: "100%", color: t.sub, fontSize: 14,
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
                Select an email to read
              </div>
            </div>
          ) : (
            <>
              <div style={{
                padding: "16px 20px", background: t.topbar,
                borderBottom: `1px solid ${t.border}`,
              }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: t.text }}>
                  {selectedMessage.subject || "(no subject)"}
                </h3>
                <div style={{ fontSize: 12, color: t.sub, marginTop: 4 }}>
                  From: {extractName(selectedMessage.from)} • {formatDate(selectedMessage.date)}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                {detailLoading ? (
                  <div style={{ textAlign: "center", padding: 48, color: t.sub, fontSize: 14 }}>
                    Loading message...
                  </div>
                ) : messageDetail ? (
                  <div>
                    <div dangerouslySetInnerHTML={{ __html: messageDetail.body }} />
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Re-authentication Modal */}
      <ReauthModal />
    </div>
  );
}
