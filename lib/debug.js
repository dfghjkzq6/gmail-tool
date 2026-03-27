export function debugLog(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] DEBUG: ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

export function logSession(session) {
  debugLog('Session data', {
    hasSession: !!session,
    user: session?.user?.email,
    hasAccessToken: !!session?.accessToken,
    hasRefreshToken: !!session?.refreshToken,
    accessTokenLength: session?.accessToken?.length,
    refreshTokenLength: session?.refreshToken?.length,
    expires: session?.expires,
    fullSession: session
  });
}

export function logEnvVars() {
  debugLog('Environment variables', {
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL
  });
}
