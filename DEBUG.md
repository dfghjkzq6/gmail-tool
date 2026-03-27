# Gmail Tool Debug Guide

## Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the debug interface:**
   ```
   http://localhost:3000/debug-test.html
   ```

3. **Test the API:**
   - Click "Login with Google"
   - Click "Test Messages API" 
   - Check browser console and terminal for detailed logs

## Debug Features Added

### 1. Enhanced API Endpoint (`/api/gmail/messages`)
- ✅ Comprehensive error handling
- ✅ Detailed logging for each step
- ✅ Session validation
- ✅ Token verification

### 2. Debug Helper (`/lib/debug.js`)
- `debugLog()` - Timestamped logging
- `logSession()` - Session state inspection  
- `logEnvVars()` - Environment variable check

### 3. Debug Test Page (`debug-test.html`)
- Authentication status checker
- API testing buttons
- Real-time log display
- Session debug info

### 4. Improved Error Handling
- Frontend properly handles non-JSON responses
- Detailed error messages with stack traces
- HTTP status code checking

## Common Issues & Solutions

### Issue: "No access token available"
**Cause:** Session exists but no access token
**Debug:** Check session debug info in debug-test.html
**Fix:** Re-authenticate with Google

### Issue: "Access token is required" 
**Cause:** Missing or invalid access token
**Debug:** Check terminal logs for session details
**Fix:** Clear browser storage and re-login

### Issue: Google API errors
**Cause:** Invalid credentials, expired tokens, or API limits
**Debug:** Check Gmail API response in logs
**Fix:** Verify OAuth scopes and token validity

## Environment Variables Required

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret  
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

## Testing Checklist

- [ ] Environment variables are set
- [ ] Next.js dev server running
- [ ] Can access debug-test.html
- [ ] Google authentication works
- [ ] Session contains access token
- [ ] Gmail API calls succeed
- [ ] Debug logs appear in terminal

## Log Locations

- **Browser Console:** Frontend errors and API responses
- **Terminal:** Server-side debug logs and API calls
- **Debug Page:** Real-time API testing interface
