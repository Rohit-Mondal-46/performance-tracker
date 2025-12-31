// electron/main.js - Update the auth:login handler
import { app, BrowserWindow, ipcMain, session, shell, desktopCapturer } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { screenshotManager } from './screenshotManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

// electron/main.js - UPDATE createWindow function
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // Allow file:// protocol
    },
  });

  // Prevent file:// navigation errors
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('file://') && !url.includes('/dist/index.html')) {
      console.warn('⚠️ Blocked navigation to external file:', url);
      event.preventDefault();
    }
  });

  // Handle failed loads
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Failed to load:', validatedURL, errorDescription);
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    screenshotManager.stop();
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  screenshotManager.stop();
  if (process.platform !== 'darwin') app.quit();
});

// Store token globally for access
let authToken = null;

ipcMain.handle('auth:login', async (_, creds) => {
  try {
    
    const res = await axios.post(
      'http://localhost:3000/api/auth/employee/login',
      creds
    );


    if (res.data?.success) {
      const { token, user, role } = res.data.data;
      

      // ✅ CRITICAL: Store token globally
      authToken = token;
      
      // ✅ CRITICAL: Set token for screenshot manager
      screenshotManager.setAuthToken(token);
      
      // ✅ CRITICAL: Start screenshots AFTER auth
      screenshotManager.start();

      // Store token in cookies for API calls
      await session.defaultSession.cookies.set({
        url: 'http://localhost',
        name: 'authToken',
        value: token,
        httpOnly: true,
      });

      
      return {
        success: true,
        user: { ...user, role: role || 'employee' },
      };
    }

    return { success: false, message: 'Login failed - no success flag' };
  } catch (err) {
    console.error('🔐 Login error:', err.message);
    console.error('🔐 Error details:', err.response?.data || err.message);
    return {
      success: false,
      message: err.response?.data?.message || 'Login failed',
    };
  }
});

ipcMain.handle('auth:logout', async () => {
  screenshotManager.stop();
  authToken = null;
  await session.defaultSession.cookies.remove('http://localhost', 'authToken');
  return { success: true };
});

ipcMain.handle('ping', () => {
  return { success: true, message: 'pong', timestamp: Date.now() };
});

ipcMain.handle('auth:getToken', async () => {
  const cookies = await session.defaultSession.cookies.get({ name: 'authToken' });
  const token = cookies.length ? cookies[0].value : null;
  return token;
});

// Add this handler to manually set token for testing
ipcMain.handle('screenshot:setToken', async (_, token) => {
  screenshotManager.setAuthToken(token);
  return { success: true };
});

ipcMain.handle('shell:openExternal', (_, url) => shell.openExternal(url));

// Debugging handlers
ipcMain.handle('screenshot:test', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 800, height: 600 }
    });
    return { 
      success: true, 
      count: sources.length,
      names: sources.map(s => s.name)
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('screenshot:start', () => {
  screenshotManager.start();
  return screenshotManager.getStatus();
});

ipcMain.handle('screenshot:stop', () => {
  screenshotManager.stop();
  return screenshotManager.getStatus();
});

ipcMain.handle('screenshot:status', () => {
  const status = screenshotManager.getStatus();
  return status;
});

// Add this to help debug
ipcMain.handle('debug:getToken', () => {
  return { 
    hasToken: !!authToken,
    tokenPreview: authToken ? `${authToken.substring(0, 20)}...` : null,
    length: authToken?.length || 0
  };
});