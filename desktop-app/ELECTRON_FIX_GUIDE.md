# Electron App Fix - Testing Guide

## What Was Fixed

The desktop app was showing a blank screen in Electron because of authentication storage mismatches between web and Electron environments. Here's what was changed:

### 1. **Preload Script (electron/preload.js)**
- ✅ Changed from CommonJS `require` to ES6 `import`
- ✅ Exposed `window.electron` API with proper structure:
  - `window.electron.auth.login(credentials)`
  - `window.electron.auth.logout()`
  - `window.electron.auth.getToken()`
- ✅ Added MediaPipe and tracking APIs

### 2. **AuthContext (src/contexts/AuthContext.jsx)**
- ✅ Added Electron environment detection
- ✅ Uses IPC for authentication in Electron (secure cookie storage)
- ✅ Falls back to localStorage for web environment
- ✅ Separate login flows for Electron vs Web

### 3. **API Service (src/services/api.js)**
- ✅ Detects Electron environment
- ✅ Gets auth token from `window.electron.auth.getToken()` in Electron
- ✅ Uses localStorage in web environment
- ✅ Async token retrieval in request interceptor

### 4. **Main Process (electron/main.js)**
- ✅ Added console logging for debugging
- ✅ Added error handlers for page load failures
- ✅ Added renderer console message forwarding

### 5. **ESLint Configuration**
- ✅ Separate configs for Electron (Node.js) and React (Browser)
- ✅ Fixed process/require warnings

## How to Test

### Test 1: Development Mode (Web UI)
```powershell
cd desktop-app
npm run dev
# Open http://localhost:5173 in browser
# Login should work with localStorage
```

### Test 2: Electron Development Mode
```powershell
cd desktop-app
npm run electron:dev
# App should open in Electron window
# Login should use IPC/secure cookies
```

### Test 3: Production Build
```powershell
cd desktop-app

# Clean previous build
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Build the app
npm run build

# Run built Electron app
npm start
```

### Test 4: Full Electron Installer Build
```powershell
cd desktop-app
npm run electron:build
# Check dist/ folder for installer
```

## Debugging Tips

### Check Electron Console
When running `npm start`, watch the terminal for:
- `🚀 Loading dev server:` or `📦 Loading production build from:`
- `[Renderer Console]` messages showing React app logs
- Any error messages

### Check DevTools Console
In the Electron app window, the DevTools should show:
- `=== ENVIRONMENT CHECK ===`
- `✅ Running in Electron`
- `window.electron available: true`

### Verify Auth Flow
1. Open Electron app
2. Go to Login page
3. Enter credentials
4. Check console for:
   - `Is Electron: true`
   - `✅ ELECTRON LOGIN SUCCESS:` with user data

### Common Issues

**Issue: Blank white screen**
- Check: Is `dist/index.html` present after build?
- Check: Console errors in terminal
- Solution: Rebuild with `npm run build`

**Issue: Login doesn't work**
- Check: Is backend running on `http://localhost:3000`?
- Check: Console shows "Is Electron: true"
- Check: `window.electron` is defined
- Solution: Verify preload script is loading

**Issue: "Cannot find module" errors**
- Check: All dependencies installed (`npm install`)
- Check: `node_modules` folder exists
- Solution: Delete node_modules and reinstall

**Issue: "process is not defined"**
- These are ESLint warnings, not runtime errors
- The app will still work
- Already configured in eslint.config.js

## Environment Variables

Create/verify `.env` file:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Performance Tracker
VITE_APP_VERSION=1.0.0
VITE_ELECTRON_MODE=true
VITE_DEV_SERVER_URL=http://localhost:5173
```

## File Structure Check

Before testing, ensure these files exist:
```
desktop-app/
├── dist/                      # Created after 'npm run build'
│   └── index.html
├── electron/
│   ├── main.js               # ✅ Updated
│   └── preload.js            # ✅ Updated
├── src/
│   ├── contexts/
│   │   └── AuthContext.jsx   # ✅ Updated
│   ├── services/
│   │   └── api.js            # ✅ Updated
│   ├── utils/
│   │   └── electronDetect.js # ✅ New
│   ├── main.jsx              # ✅ Updated
│   └── App.jsx
├── index.html                 # ✅ Updated
├── vite.config.js            # ✅ Updated
├── eslint.config.js          # ✅ Updated
└── package.json
```

## Success Criteria

✅ App opens (not blank)  
✅ Login page visible  
✅ Can submit credentials  
✅ After login, dashboard loads  
✅ No console errors  
✅ Environment check shows "Running in Electron"

## Need Help?

If the app still shows blank:
1. Open DevTools in Electron (Ctrl+Shift+I)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Run: `npm run electron:dev` (auto-reloads on changes)
5. Verify backend is running on port 3000
