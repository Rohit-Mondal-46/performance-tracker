// electron/main.js
import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { screenshotManager } from './screenshotManager.js';
import { TrackingManager } from './trackingManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let trackingManager;
let authToken = null;

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// =====================================================
// SIMPLE SYNC MANAGER - No session logic
// =====================================================
class SimpleSyncManager {
  constructor() {
    this.INTERVAL_MS = 60 * 1000; // 5 minutes
    this.timer = null;
    this.running = false;
    this.authToken = null;
  }

  setAuthToken(token) {
    this.authToken = token;
    console.log('[SimpleSync] 🔑 Auth token set');
  }

  async sendDataToBackend(data) {
    if (!this.authToken) {
      console.error('[SimpleSync] Cannot send data: No auth token');
      return false;
    }

    try {
      console.log('[SimpleSync] 📤 Sending 5-minute data to backend:', {
        keystrokes: data.keyboard.totalKeystrokes,
        clicks: data.mouse.totalClicks,
        distance: data.mouse.totalDistance
      });

      // Send simple data to backend
      const response = await axios.post(
        `${API_BASE_URL}/input-activity/ingest`, 
        {
          timestamp: data.timestamp,
          startTime: data.startTime,
          endTime: data.endTime,
          keyboard: data.keyboard,
          mouse: data.mouse
        },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data.success) {
        console.log('[SimpleSync] ✅ Data sent successfully');
        return true;
      } else {
        console.error('[SimpleSync] ❌ Backend returned error:', response.data.message);
        return false;
      }

    } catch (error) {
      console.error('[SimpleSync] ❌ Failed to send data:', error.message);
      return false;
    }
  }

  async start() {
    if (this.running) {
      console.log('[SimpleSync] ⚠️ Already running');
      return false;
    }

    if (!this.authToken) {
      console.error('[SimpleSync] ❌ Cannot start: No auth token');
      return false;
    }

    console.log('[SimpleSync] ✅ Starting - will send data every 5 minutes');

    this.running = true;

    // Set up 5-minute interval
    this.timer = setInterval(async () => {
      if (!this.running || !trackingManager) return;
      
      // Get and reset tracking data
      const periodicData = trackingManager.getAndResetTrackingData();
      
      // Send to backend
      const success = await this.sendDataToBackend(periodicData);
      
      // Notify renderer
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('sync-completed', {
          timestamp: Date.now(),
          success: success,
          data: periodicData,
          message: success ? 'Data sent successfully' : 'Failed to send data'
        });
      }
      
    }, this.INTERVAL_MS);

    return true;
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.running = false;
    console.log('[SimpleSync] 🛑 Stopped');
  }

  getStatus() {
    return {
      running: this.running,
      hasToken: !!this.authToken,
      interval: this.INTERVAL_MS
    };
  }
}

// Create global sync manager instance
const syncManager = new SimpleSyncManager();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
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
  if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html')).catch(err => {
      console.error('❌ Failed to load index.html:', err);
    });
  }

  mainWindow.on('closed', () => {
    screenshotManager.stop();
    syncManager.stop();
    if (trackingManager) {
      trackingManager.stop();
    }
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  
  // Initialize tracking manager
  trackingManager = new TrackingManager(mainWindow);
  
  // Wait a bit before initializing tracking to ensure window is ready
  setTimeout(() => {
    trackingManager.initialize();
  }, 1000);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      trackingManager = new TrackingManager(mainWindow);
      setTimeout(() => {
        trackingManager.initialize();
      }, 1000);
    }
  });

  // Note: SimpleSyncManager handles sending data to backend
  // No need to listen to periodic-activity-data events

  // AUTH LOGIC (ELECTRON SIDE)
  ipcMain.handle("auth:login", async (event, creds) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/employee/login`, {
        email: creds.email,
        password: creds.password,
      });

      if (res.data && res.data.success && res.data.data) {
        const { token, user, role } = res.data.data;

        // Store token globally
        authToken = token;
        
        // Set token for screenshot manager and start
        screenshotManager.setAuthToken(token);
        screenshotManager.start();

        // Set token for sync manager and start
        syncManager.setAuthToken(token);
        syncManager.start();

        await session.defaultSession.cookies.set({
          url: "http://localhost",
          name: "authToken",
          value: token,
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        });
        
        return { 
          success: true, 
          user: { ...user, role: role || user.role || 'employee' }
        };
      }

      return { success: false, message: res.data?.message || "Invalid credentials" };
    } catch (err) {
      console.error("❌ Login failed:", err.message);
      const errorMessage = err.response?.data?.message || err.message || "Invalid credentials";
      return { success: false, message: errorMessage };
    }
  });

  ipcMain.handle("auth:getToken", async () => {
    if (authToken) {
      return authToken;
    }
    
    try {
      const cookies = await session.defaultSession.cookies.get({ name: "authToken" });
      if (cookies.length > 0) {
        authToken = cookies[0].value;
        return authToken;
      }
    } catch (error) {
      console.error('Error retrieving token from cookies:', error);
    }
    
    return null;
  });

  ipcMain.handle("auth:logout", async () => {
    screenshotManager.stop();
    syncManager.stop();
    if (trackingManager) {
      trackingManager.stop();
    }
    authToken = null;
    await session.defaultSession.cookies.remove("http://localhost", "authToken");
    return { success: true };
  });

  // TRACKING MANAGER IPC HANDLERS
  ipcMain.on('toggle-tracking', (event, enabled) => {
    if (enabled) {
      trackingManager.startTracking();
    } else {
      trackingManager.stopTracking();
    }
  });

  ipcMain.handle('tracking:getCurrentData', () => {
    // Create a snapshot of current data without resetting
    const now = Date.now();
    const keyboardDuration = now - trackingManager.trackingData.keyboard.lastResetTime;
    const mouseDuration = now - trackingManager.trackingData.mouse.lastResetTime;
    
    return {
      keyboard: {
        totalKeystrokes: trackingManager.trackingData.keyboard.totalKeystrokes,
        duration: keyboardDuration,
        keystrokesPerMinute: (trackingManager.trackingData.keyboard.totalKeystrokes / (keyboardDuration / 60000)).toFixed(2)
      },
      mouse: {
        totalClicks: trackingManager.trackingData.mouse.totalClicks,
        totalDistance: Math.round(trackingManager.trackingData.mouse.totalDistance),
        scrollDistance: Math.round(trackingManager.trackingData.mouse.scrollDistance),
        duration: mouseDuration,
        clicksPerMinute: (trackingManager.trackingData.mouse.totalClicks / (mouseDuration / 60000)).toFixed(2)
      },
      timestamp: now,
      startTime: trackingManager.trackingData.keyboard.lastResetTime,
      isTrackingEnabled: trackingManager.isTrackingEnabled,
      isHookRunning: trackingManager.isHookRunning
    };
  });

  ipcMain.handle('tracking:reset', () => {
    trackingManager.resetCounters();
    return { success: true };
  });

  ipcMain.handle('get-detailed-stats', () => {
    return {
      trackingData: trackingManager.trackingData,
      config: trackingManager.config,
      isTrackingEnabled: trackingManager.isTrackingEnabled,
      isHookRunning: trackingManager.isHookRunning,
      timestamp: Date.now()
    };
  });

  ipcMain.handle('reset-stats', () => {
    trackingManager.resetCounters();
    return { success: true, message: 'Statistics reset' };
  });

  // Simple activity pattern detection
  ipcMain.handle('get-activity-pattern', () => {
    const now = Date.now();
    const keyboardDuration = now - trackingManager.trackingData.keyboard.lastResetTime;
    const mouseDuration = now - trackingManager.trackingData.mouse.lastResetTime;
    
    const kpm = trackingManager.trackingData.keyboard.totalKeystrokes / (keyboardDuration / 60000);
    const cpm = trackingManager.trackingData.mouse.totalClicks / (mouseDuration / 60000);
    
    let activityType = 'idle';
    
    if (kpm > 20) {
      activityType = 'fast_typing';
    } else if (kpm > 5) {
      activityType = 'typing';
    } else if (cpm > 10) {
      activityType = 'clicking';
    } else if (trackingManager.trackingData.mouse.totalDistance > 1000) {
      activityType = 'moving';
    }
    
    return activityType;
  });

  ipcMain.on('update-config', (event, newConfig) => {
    if (newConfig.mouse) {
      Object.assign(trackingManager.config.mouse, newConfig.mouse);
    }
    if (newConfig.tracking) {
      Object.assign(trackingManager.config.tracking, newConfig.tracking);
    }
    console.log('🔧 Tracking config updated:', trackingManager.config);
  });

  // SYNC MANAGER HANDLERS
  ipcMain.handle('sync:start', async () => {
    const started = await syncManager.start();
    return { success: started, status: syncManager.getStatus() };
  });

  ipcMain.handle('sync:stop', async () => {
    syncManager.stop();
    return { success: true, status: syncManager.getStatus() };
  });

  ipcMain.handle('sync:status', () => {
    return syncManager.getStatus();
  });

  ipcMain.handle('sync:setToken', (_, token) => {
    syncManager.setAuthToken(token);
    return { success: true };
  });

  ipcMain.handle('sync:forceReset', () => {
    console.log('[SyncManager] 🔄 Manual reset requested');
    trackingManager.resetCounters();
    return { success: true, message: 'Tracking data manually reset' };
  });

  ipcMain.handle('sync:forceSend', async () => {
    console.log('[SyncManager] 🔄 Manual sync requested');
    if (syncManager.running && trackingManager) {
      const data = trackingManager.getAndResetTrackingData();
      const success = await syncManager.sendDataToBackend(data);
      return { success, message: success ? 'Manual sync completed' : 'Manual sync failed' };
    } else {
      return { success: false, message: 'Sync manager not running' };
    }
  });

  // SCREENSHOT MANAGER HANDLERS
  ipcMain.handle('screenshot:test', async () => {
    try {
      const testResult = await screenshotManager.captureNow();
      return { success: true, result: testResult };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('screenshot:start', async () => {
    const started = await screenshotManager.start();
    return { success: started, running: screenshotManager.running };
  });

  ipcMain.handle('screenshot:stop', async () => {
    await screenshotManager.stop();
    return { success: true, running: false };
  });

  ipcMain.handle('screenshot:status', () => {
    return { 
      running: screenshotManager.running,
      hasToken: !!screenshotManager.authToken 
    };
  });

  ipcMain.handle('screenshot:setToken', (_, token) => {
    screenshotManager.setAuthToken(token);
    authToken = token;
    return { success: true };
  });

  // SYSTEM STATUS HANDLERS
  ipcMain.handle('ping', () => {
    return { success: true, message: 'pong', timestamp: Date.now() };
  });

  ipcMain.handle('shell:openExternal', (_, url) => {
    const { shell } = require('electron');
    shell.openExternal(url);
  });
});

app.on("window-all-closed", () => {
  screenshotManager.stop();
  syncManager.stop();
  if (trackingManager) {
    trackingManager.stop();
  }
  if (process.platform !== "darwin") app.quit();
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
});