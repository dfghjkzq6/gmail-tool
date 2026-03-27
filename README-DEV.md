# Gmail Tool - Development Helper

## Quick Start Commands

```bash
# Start development server with auto-debug
npm run dev:start

# Stop development server  
npm run dev:stop

# Check server status
npm run dev:status

# Run debug checks
npm run dev:debug

# Or use the helper directly
node dev-helper.js start
node dev-helper.js stop
node dev-helper.js status
node dev-helper.js debug
```

## Development Helper Features

### 🚀 `npm run dev:start`
- Installs dependencies if needed
- Checks environment variables
- Starts Next.js dev server
- Auto-opens debug page in browser
- Shows helpful status messages

### 🛑 `npm run dev:stop`
- Gracefully stops development server
- Force kills if needed after 5 seconds

### 📊 `npm run dev:status`
- Shows if server is running
- Provides debug page URL

### 🔍 `npm run dev:debug`
- Checks environment variables
- Validates module loading
- Verifies API routes exist
- Provides quick start command

## Debug Workflow

1. **Initial Setup:**
   ```bash
   npm run dev:debug  # Check everything is ready
   ```

2. **Start Development:**
   ```bash
   npm run dev:start  # Starts server + opens debug page
   ```

3. **Test API:**
   - Use the debug page at `http://localhost:3000/debug-test.html`
   - Check terminal logs for detailed debugging

4. **Stop When Done:**
   ```bash
   npm run dev:stop
   ```

## File Structure

```
/home/zam/gmail-tool/
├── dev-helper.js          # Main development helper script
├── lib/
│   ├── debug.js           # Debug logging utilities
│   └── gmail.js           # Gmail client with debug logging
├── app/
│   ├── api/
│   │   └── gmail/
│   │       └── messages/
│   │           └── route.js    # Enhanced with debug logging
│   └── page.js            # Frontend with error handling
├── debug-test.html        # Interactive testing interface
├── DEBUG.md              # Detailed debugging guide
└── README-DEV.md         # This file
```

## Common Issues

### Server won't start
- Run `npm run dev:debug` to check environment
- Ensure `.env.local` exists with required variables

### API calls failing
- Check terminal logs for detailed error messages
- Use debug-test.html to test authentication
- Verify Google OAuth scopes are correct

### Debug page not working
- Ensure server is running: `npm run dev:status`
- Clear browser cache and reload
- Check browser console for JavaScript errors

## Environment Variables Required

Create `.env.local` with:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```
