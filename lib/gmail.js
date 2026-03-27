import { google } from "googleapis";
import { debugLog } from "./debug.js";

export function getGmailClient(accessToken, refreshToken, onTokenRefresh = null) {
  debugLog('Creating Gmail client', {
    hasAccessToken: !!accessToken,
    accessTokenLength: accessToken?.length,
    hasRefreshToken: !!refreshToken,
    refreshTokenLength: refreshToken?.length
  });

  if (!accessToken) {
    throw new Error("Access token is required");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/api/auth/callback/google"
  );

  debugLog('OAuth2 client created', {
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET
  });

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // Set up automatic token refresh
  oauth2Client.on('tokens', (tokens) => {
    debugLog('Tokens refreshed', {
      hasNewAccessToken: !!tokens.access_token,
      hasNewRefreshToken: !!tokens.refresh_token
    });
    
    if (onTokenRefresh && tokens.access_token) {
      onTokenRefresh(tokens);
    }
  });

  debugLog('Credentials set on OAuth2 client with auto-refresh');

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  debugLog('Gmail client created successfully');
  
  return gmail;
}

export async function refreshTokens(refreshToken) {
  try {
    debugLog('Manually refreshing tokens');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost:3000/api/auth/callback/google"
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    
    debugLog('Tokens refreshed successfully', {
      hasAccessToken: !!credentials.access_token,
      hasRefreshToken: !!credentials.refresh_token
    });

    return credentials;
  } catch (error) {
    debugLog('Token refresh failed', error);
    throw error;
  }
}
