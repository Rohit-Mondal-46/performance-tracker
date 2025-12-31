
// desktop-app/electron/main.js
import { app, BrowserWindow, ipcMain, session, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { uIOhook } from 'uiohook-napi'; // Fixed import

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let isTrackingEnabled = true;
let isHookRunning = false;

// Enhanced tracking data structures
const trackingData = {
  keyboard: {
    totalKeystrokes: 0,
    keystrokesPerMinute: 0,
    activeKeystrokes: 0,
    lastKeystrokeTime: null,
    keystrokeHistory: [], // Stores last 1000 keystrokes with timestamps
    keyFrequency: new Map(), // Tracks frequency of each key
    typingSessions: [], // Tracks typing bursts
    currentTypingSession: { start: null, keystrokes: 0 }
  },
  mouse: {
    totalClicks: 0,
    totalDistance: 0,
    clicksPerMinute: 0,
    averageSpeed: 0,
    lastPosition: { x: 0, y: 0 },
    lastClickTime: null,
    movementHistory: [], // Stores last 1000 movements with timestamps
    clickFrequency: new Map(), // Tracks frequency of each button
    idleTime: 0,
    lastMovementTime: null,
    activityZones: new Map(), // Tracks which screen areas are most active
    scrollDistance: 0
  },
  combined: {
    overallActivity: 0, // 0-100 score
    lastActivityTime: null,
    activityPattern: [] // History of activity patterns
  }
};

// Configuration for intelligent detection
const config = {
  mouse: {
    minimumMovement: 2, // pixels to consider as intentional movement
    idleThreshold: 30000, // 30 seconds of no movement = idle
    speedThreshold: 1000, // px/sec to consider as fast movement
    zoneSize: 100, // pixel grid for activity zones
    clickDebounce: 100 // ms between clicks to count as separate
  },
  keyboard: {
    typingThreshold: 5, // keystrokes per second to consider as typing
    burstThreshold: 10, // keystrokes in sequence to consider a burst
    idleThreshold: 60000, // 1 minute of no keystrokes = idle
    sessionTimeout: 2000, // ms between keystrokes to end a session
  },
  tracking: {
    historySize: 1000,
    updateInterval: 1000, // Update every second for more responsive UI
    sendInterval: 300000 // Send data to renderer every 5 minutes (300,000ms)
  }
};

// Analytics calculations
function calculateKeyboardAnalytics() {
  const now = Date.now();
  const recentKeystrokes = trackingData.keyboard.keystrokeHistory.filter(
    k => now - k.timestamp < 60000
  );
  
  // Calculate KPM
  trackingData.keyboard.keystrokesPerMinute = recentKeystrokes.length;
  
  // Detect if currently typing
  if (recentKeystrokes.length > 0) {
    const lastKeystroke = recentKeystrokes[recentKeystrokes.length - 1];
    const timeSinceLast = now - lastKeystroke.timestamp;
    trackingData.keyboard.activeKeystrokes = timeSinceLast < 5000 ? recentKeystrokes.length : 0;
  }

  // Update typing session
  if (trackingData.keyboard.currentTypingSession.start) {
    const sessionTime = now - trackingData.keyboard.currentTypingSession.start;
    if (sessionTime > config.keyboard.sessionTimeout) {
      // End session
      if (trackingData.keyboard.currentTypingSession.keystrokes > 0) {
        trackingData.keyboard.typingSessions.push({
          start: trackingData.keyboard.currentTypingSession.start,
          end: now,
          keystrokes: trackingData.keyboard.currentTypingSession.keystrokes,
          duration: sessionTime
        });
      }
      trackingData.keyboard.currentTypingSession = { start: null, keystrokes: 0 };
    }
  }
}

function calculateMouseAnalytics() {
  const now = Date.now();
  
  // Calculate mouse speed
  if (trackingData.mouse.movementHistory.length >= 2) {
    const recentMovements = trackingData.mouse.movementHistory.slice(-10);
    let totalDistance = 0;
    let totalTime = 0;
    
    for (let i = 1; i < recentMovements.length; i++) {
      const prev = recentMovements[i-1];
      const curr = recentMovements[i];
      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );
      const time = curr.timestamp - prev.timestamp;
      
      if (time > 0) {
        totalDistance += distance;
        totalTime += time;
      }
    }
    
    if (totalTime > 0) {
      trackingData.mouse.averageSpeed = (totalDistance / totalTime) * 1000; // px/sec
    }
  }
  
  // Calculate CPM
  const recentClicks = trackingData.mouse.movementHistory.filter(
    m => m.type === 'click' && now - m.timestamp < 60000
  );
  trackingData.mouse.clicksPerMinute = recentClicks.length;
  
  // Update idle time
  if (trackingData.mouse.lastMovementTime) {
    trackingData.mouse.idleTime = now - trackingData.mouse.lastMovementTime;
  }
}

function calculateCombinedActivity() {
  const now = Date.now();
  
  // Recent activity score (last 30 seconds)
  const recentKeyboard = trackingData.keyboard.keystrokeHistory.filter(
    k => now - k.timestamp < 30000
  ).length;
  
  const recentMouse = trackingData.mouse.movementHistory.filter(
    m => now - m.timestamp < 30000 && (m.type === 'move' || m.type === 'click')
  ).length;
  
  // Weighted activity score
  const keyboardScore = Math.min(recentKeyboard * 10, 50); // Max 50 points
  const mouseScore = Math.min(recentMouse * 5, 50); // Max 50 points
  
  trackingData.combined.overallActivity = keyboardScore + mouseScore;
  trackingData.combined.lastActivityTime = now;
  
  // Store activity pattern
  trackingData.combined.activityPattern.push({
    timestamp: now,
    activity: trackingData.combined.overallActivity,
    keyboard: recentKeyboard,
    mouse: recentMouse
  });
  
  // Keep only last 60 entries (5 minutes at 5-second intervals)
  if (trackingData.combined.activityPattern.length > 60) {
    trackingData.combined.activityPattern.shift();
  }
}

function detectActivityPattern() {
  const now = Date.now();
  const pattern = {
    isTyping: false,
    isScrolling: false,
    isClicking: false,
    isIdle: false,
    activityType: 'idle'
  };
  
  // Check keyboard activity
  if (trackingData.keyboard.keystrokesPerMinute > config.keyboard.typingThreshold * 2) {
    pattern.isTyping = true;
    pattern.activityType = 'fast_typing';
  } else if (trackingData.keyboard.keystrokesPerMinute > config.keyboard.typingThreshold) {
    pattern.isTyping = true;
    pattern.activityType = 'typing';
  }
  
  // Check mouse activity
  if (trackingData.mouse.clicksPerMinute > 10) {
    pattern.isClicking = true;
    pattern.activityType = pattern.isTyping ? 'typing_clicking' : 'clicking';
  } else if (trackingData.mouse.scrollDistance > 500) {
    pattern.isScrolling = true;
    pattern.activityType = 'scrolling';
  } else if (trackingData.mouse.averageSpeed > config.mouse.speedThreshold) {
    pattern.activityType = 'fast_movement';
  } else if (trackingData.mouse.averageSpeed > config.mouse.speedThreshold / 2) {
    pattern.activityType = 'movement';
  }
  
  // Check idle
  if (trackingData.mouse.idleTime > config.mouse.idleThreshold && 
      trackingData.keyboard.activeKeystrokes === 0) {
    pattern.isIdle = true;
    pattern.activityType = 'idle';
  }
  
  return pattern;
}

// Intelligent event processors
function processKeystroke(event, type) {
  const now = Date.now();
  
  // Update basic stats
  trackingData.keyboard.totalKeystrokes++;
  trackingData.keyboard.lastKeystrokeTime = now;
  
  // Store in history
  trackingData.keyboard.keystrokeHistory.push({
    keycode: event.keycode,
    keychar: event.keychar,
    timestamp: now,
    type: type,
    modifiers: {
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey
    }
  });
  
  // Keep history size limited
  if (trackingData.keyboard.keystrokeHistory.length > config.tracking.historySize) {
    trackingData.keyboard.keystrokeHistory.shift();
  }
  
  // Update key frequency
  const key = event.keychar || `key${event.keycode}`;
  trackingData.keyboard.keyFrequency.set(
    key, 
    (trackingData.keyboard.keyFrequency.get(key) || 0) + 1
  );
  
  // Manage typing session
  if (!trackingData.keyboard.currentTypingSession.start) {
    trackingData.keyboard.currentTypingSession.start = now;
  }
  trackingData.keyboard.currentTypingSession.keystrokes++;
  
  // Calculate analytics
  calculateKeyboardAnalytics();
}

function processMouseEvent(event, type) {
  const now = Date.now();
  
  // Calculate movement distance for mousemove
  if (type === 'mousemove') {
    const distance = Math.sqrt(
      Math.pow(event.x - trackingData.mouse.lastPosition.x, 2) +
      Math.pow(event.y - trackingData.mouse.lastPosition.y, 2)
    );
    
    // Only track if movement is significant
    if (distance >= config.mouse.minimumMovement) {
      trackingData.mouse.totalDistance += distance;
      trackingData.mouse.lastPosition = { x: event.x, y: event.y };
      trackingData.mouse.lastMovementTime = now;
      
      // Store movement
      trackingData.mouse.movementHistory.push({
        x: event.x,
        y: event.y,
        distance: distance,
        timestamp: now,
        type: 'move'
      });
      
      // Update activity zones
      const zoneX = Math.floor(event.x / config.mouse.zoneSize);
      const zoneY = Math.floor(event.y / config.mouse.zoneSize);
      const zoneKey = `${zoneX},${zoneY}`;
      trackingData.mouse.activityZones.set(
        zoneKey,
        (trackingData.mouse.activityZones.get(zoneKey) || 0) + 1
      );
    }
  }
  
  // Handle clicks
  else if (type === 'click' || type === 'mousedown') {
    // Debounce clicks
    if (!trackingData.mouse.lastClickTime || 
        now - trackingData.mouse.lastClickTime > config.mouse.clickDebounce) {
      trackingData.mouse.totalClicks++;
      trackingData.mouse.lastClickTime = now;
      trackingData.mouse.lastMovementTime = now;
      
      // Store click
      trackingData.mouse.movementHistory.push({
        x: event.x,
        y: event.y,
        button: event.button,
        clicks: event.clicks,
        timestamp: now,
        type: 'click'
      });
      
      // Update click frequency
      const buttonKey = `button${event.button}`;
      trackingData.mouse.clickFrequency.set(
        buttonKey,
        (trackingData.mouse.clickFrequency.get(buttonKey) || 0) + 1
      );
    }
  }
  
  // Handle wheel
  else if (type === 'wheel') {
    trackingData.mouse.scrollDistance += Math.abs(event.rotation);
    trackingData.mouse.lastMovementTime = now;
    
    trackingData.mouse.movementHistory.push({
      rotation: event.rotation,
      direction: event.direction,
      timestamp: now,
      type: 'wheel'
    });
  }
  
  // Keep history size limited
  if (trackingData.mouse.movementHistory.length > config.tracking.historySize) {
    trackingData.mouse.movementHistory.shift();
  }
  
  // Calculate analytics
  calculateMouseAnalytics();
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  // disable CORS + CSP in dev
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: details.responseHeaders });
  });

  // Load the app
  if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, "..", "dist", "index.html");
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('❌ Failed to load index.html:', err);
    });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
    stopUIOhook();
  });
};

// Helper function to send tracking status
function sendTrackingStatus(status, message = '') {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('tracking-initialized', {
      timestamp: Date.now(),
      status: status,
      message: message
    });
  }
}

// Event handler functions
function handleKeyDown(event) {
  if (!isTrackingEnabled) return;
  
  console.log('Keydown event:', event.keycode, event.keychar);
  processKeystroke(event, 'keydown');
  
  const specialCombos = detectSpecialCombinations(event);
  if (specialCombos.length > 0) {
    console.log('🔍 Special combination detected:', specialCombos);
  }
  
  sendKeyboardEvent('keydown', event, specialCombos);
}

function handleKeyUp(event) {
  if (!isTrackingEnabled) return;
  
  console.log('Keyup event:', event.keycode, event.keychar);
  processKeystroke(event, 'keyup');
  sendKeyboardEvent('keyup', event);
}

function handleMouseMove(event) {
  if (!isTrackingEnabled) return;
  
  processMouseEvent(event, 'mousemove');
  const pattern = detectActivityPattern();
  
  sendMouseEvent('mousemove', event, pattern);
}

function handleMouseDown(event) {
  if (!isTrackingEnabled) return;
  
  console.log('Mousedown event:', event.button, event.x, event.y);
  processMouseEvent(event, 'mousedown');
  sendMouseEvent('mousedown', event);
}

function handleMouseUp(event) {
  if (!isTrackingEnabled) return;
  
  console.log('Mouseup event:', event.button, event.x, event.y);
  processMouseEvent(event, 'mouseup');
  sendMouseEvent('mouseup', event);
}

function handleWheel(event) {
  if (!isTrackingEnabled) return;
  
  console.log('Wheel event:', event.rotation, event.direction);
  processMouseEvent(event, 'wheel');
  sendMouseEvent('wheel', event);
}

function handleClick(event) {
  if (!isTrackingEnabled) return;
  
  console.log('Click event:', event.button, event.clicks, event.x, event.y);
  processMouseEvent(event, 'click');
  const clickType = getClickType(event);
  
  sendMouseEvent('click', event, null, clickType);
}

// Helper functions to send events to renderer
function sendKeyboardEvent(type, event, specialCombos = []) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('keyboard-event', {
      type: type,
      keycode: event.keycode,
      keychar: event.keychar,
      timestamp: Date.now(),
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      isSpecial: specialCombos.length > 0,
      specialCombos: specialCombos
    });
  }
}

function sendMouseEvent(type, event, pattern = null, clickType = null) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const baseEvent = {
      type: type,
      timestamp: Date.now()
    };
    
    // Add properties based on event type
    if (['mousemove', 'mousedown', 'mouseup', 'click'].includes(type)) {
      baseEvent.x = event.x;
      baseEvent.y = event.y;
    }
    
    if (['mousedown', 'mouseup', 'click'].includes(type)) {
      baseEvent.button = event.button;
    }
    
    if (type === 'click') {
      baseEvent.clicks = event.clicks || 1;
      baseEvent.clickType = clickType;
    }
    
    if (type === 'wheel') {
      baseEvent.rotation = event.rotation;
      baseEvent.direction = event.direction;
    }
    
    if (type === 'mousemove' && pattern) {
      baseEvent.speed = Math.round(trackingData.mouse.averageSpeed);
      baseEvent.distance = Math.round(trackingData.mouse.totalDistance);
      baseEvent.activityPattern = pattern;
    }
    
    mainWindow.webContents.send('mouse-event', baseEvent);
  }
}

// Setup event listeners using the correct uIOhook API
function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Keyboard events
  uIOhook.on('keydown', handleKeyDown);
  uIOhook.on('keyup', handleKeyUp);
  
  // Mouse events
  uIOhook.on('mousemove', handleMouseMove);
  uIOhook.on('mousedown', handleMouseDown);
  uIOhook.on('mouseup', handleMouseUp);
  uIOhook.on('wheel', handleWheel);
  uIOhook.on('click', handleClick);
  
  console.log('✅ Event listeners registered');
}

// Start uIOhook
function startUIOhook() {
  console.log('🔄 Starting intelligent input tracking...');
  
  try {
    uIOhook.start();
    isHookRunning = true;
    startAnalyticsInterval();
    
    // Send success status
    sendTrackingStatus('success', 'Tracking started successfully');
    
    // Initialize last position
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('mouse-position', {
        x: 0,
        y: 0,
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('❌ Failed to start uIOhook:', error);
    sendTrackingStatus('error', error.message);
  }
}

// Initialize uIOhook for intelligent tracking
function initializeUIOhook() {
  try {
    console.log('🔧 Initializing intelligent input tracking...');
    console.log('uIOhook object structure:', Object.keys(uIOhook));
    
    // Check if uIOhook is properly loaded
    if (!uIOhook || typeof uIOhook !== 'object') {
      console.error('❌ uIOhook module not properly loaded');
      sendTrackingStatus('error', 'uIOhook module not loaded');
      return;
    }
    
    // Check if event emitter methods exist
    if (typeof uIOhook.on === 'function') {
      console.log('✅ Using uIOhook.on method');
      setupEventListeners();
      startUIOhook();
    } else {
      console.error('❌ uIOhook.on method not found');
      
      // Try to log available methods
      const methods = Object.getOwnPropertyNames(uIOhook).filter(
        prop => typeof uIOhook[prop] === 'function'
      );
      console.log('Available methods:', methods);
      
      sendTrackingStatus('error', 'uIOhook.on method not available');
    }
    
  } catch (error) {
    console.error('❌ Error initializing intelligent tracking:', error);
    sendTrackingStatus('error', error.message);
  }
}

// Helper functions for intelligent detection
function detectSpecialCombinations(event) {
  const combos = [];
  const now = Date.now();
  
  // Check for common shortcuts
  if (event.ctrlKey) {
    switch (event.keycode) {
      case 46: // C
        combos.push('CTRL+C');
        trackingData.keyboard.keyFrequency.set('copy', (trackingData.keyboard.keyFrequency.get('copy') || 0) + 1);
        break;
      case 47: // V
        combos.push('CTRL+V');
        trackingData.keyboard.keyFrequency.set('paste', (trackingData.keyboard.keyFrequency.get('paste') || 0) + 1);
        break;
      case 48: // B
        combos.push('CTRL+B');
        break;
      case 49: // N
        combos.push('CTRL+N');
        break;
      case 50: // M
        combos.push('CTRL+M');
        break;
      case 20: // T
        combos.push('CTRL+T');
        break;
      case 24: // W
        combos.push('CTRL+W');
        break;
    }
  }
  
  if (event.altKey) {
    switch (event.keycode) {
      case 15: // Tab
        combos.push('ALT+TAB');
        break;
      case 1: // F4
        combos.push('ALT+F4');
        break;
    }
  }
  
  // Track shift combinations
  if (event.shiftKey && event.keycode >= 16 && event.keycode <= 25) {
    // Function keys with shift
    combos.push(`SHIFT+F${event.keycode - 15}`);
  }
  
  return combos;
}

function getClickType(event) {
  const now = Date.now();
  
  if (event.clicks >= 3) return 'triple_click';
  if (event.clicks === 2) return 'double_click';
  
  // Detect click patterns
  const recentClicks = trackingData.mouse.movementHistory.filter(
    m => m.type === 'click' && now - m.timestamp < 1000
  );
  
  if (recentClicks.length > 5) return 'rapid_clicking';
  if (recentClicks.length > 2) return 'multiple_clicks';
  
  return 'single_click';
}

// Analytics interval
function startAnalyticsInterval() {
  // Send comprehensive analytics to renderer every second
  const analyticsInterval = setInterval(() => {
    if (!isTrackingEnabled) return;
    
    calculateCombinedActivity();
    
    // Send comprehensive analytics to renderer
    if (mainWindow && !mainWindow.isDestroyed()) {
      const analytics = {
        timestamp: Date.now(),
        keyboard: {
          totalKeystrokes: trackingData.keyboard.totalKeystrokes,
          keystrokesPerMinute: trackingData.keyboard.keystrokesPerMinute,
          activeKeystrokes: trackingData.keyboard.activeKeystrokes,
          isTyping: trackingData.keyboard.keystrokesPerMinute > config.keyboard.typingThreshold,
          topKeys: Array.from(trackingData.keyboard.keyFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([key, count]) => ({ key, count })),
          typingSessions: trackingData.keyboard.typingSessions.slice(-5)
        },
        mouse: {
          totalClicks: trackingData.mouse.totalClicks,
          clicksPerMinute: trackingData.mouse.clicksPerMinute,
          totalDistance: Math.round(trackingData.mouse.totalDistance),
          averageSpeed: Math.round(trackingData.mouse.averageSpeed),
          scrollDistance: Math.round(trackingData.mouse.scrollDistance),
          idleTime: trackingData.mouse.idleTime,
          isMoving: trackingData.mouse.averageSpeed > 0,
          lastPosition: trackingData.mouse.lastPosition,
          topZones: Array.from(trackingData.mouse.activityZones.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([zone, count]) => ({ zone, count }))
        },
        combined: {
          overallActivity: trackingData.combined.overallActivity,
          activityType: detectActivityPattern().activityType,
          isActive: trackingData.combined.overallActivity > 20
        }
      };
      
      mainWindow.webContents.send('analytics-update', analytics);
    }
  }, config.tracking.updateInterval); // Send every second
  
  // Send 5-minute summary to backend
  const summaryInterval = setInterval(() => {
    if (!isTrackingEnabled) return;
    
    // This is where you would send the 5-minute summary to your backend
    console.log('5-minute summary:', {
      keyboard: trackingData.keyboard,
      mouse: trackingData.mouse,
      combined: trackingData.combined
    });
  }, config.tracking.sendInterval); // Every 5 minutes
  
  // Store intervals for cleanup
  global.analyticsIntervals = [analyticsInterval, summaryInterval];
}

function stopUIOhook() {
  try {
    if (isHookRunning) {
      console.log('🛑 Stopping intelligent tracking...');
      
      uIOhook.stop();
      uIOhook.removeAllListeners();
      
      // Clear intervals
      if (global.analyticsIntervals) {
        global.analyticsIntervals.forEach(interval => clearInterval(interval));
        global.analyticsIntervals = null;
      }
      
      isHookRunning = false;
      console.log('✅ Intelligent tracking stopped');
    }
  } catch (error) {
    console.error('❌ Error stopping tracking:', error);
  }
}

app.whenReady().then(() => {
  createWindow();
  
  // Wait a bit before initializing uIOhook to ensure window is ready
  setTimeout(() => {
    initializeUIOhook();
  }, 1000);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      setTimeout(() => {
        initializeUIOhook();
      }, 1000);
    }
  });

  // AUTH LOGIC (ELECTRON SIDE)
  ipcMain.handle("auth:login", async (event, creds) => {
    try {
      const res = await axios.post(`http://localhost:3000/api/auth/employee/login`, {
        email: creds.email,
        password: creds.password,
      });

      if (res.data && res.data.success && res.data.data) {
        const { token, user, role } = res.data.data;

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
    const cookies = await session.defaultSession.cookies.get({ name: "authToken" });
    if (cookies.length === 0) return null;
    return cookies[0].value;
  });

  ipcMain.handle("auth:logout", async () => {
    await session.defaultSession.cookies.remove("http://localhost", "authToken");
    return { success: true };
  });

  ipcMain.handle("shell:openExternal", async (event, url) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      console.error("❌ Failed to open external URL:", error);
      return { success: false, error: error.message };
    }
  });

  // ENHANCED TRACKING IPC HANDLERS
  ipcMain.on('toggle-tracking', (event, enabled) => {
    isTrackingEnabled = enabled;
    console.log(`🔧 Tracking ${enabled ? 'enabled' : 'disabled'}`);
    
    if (enabled && !isHookRunning) {
      initializeUIOhook();
    }
  });

  ipcMain.handle('get-detailed-stats', () => {
    return {
      ...trackingData,
      config: config,
      isTrackingEnabled,
      isHookRunning,
      timestamp: Date.now()
    };
  });

  ipcMain.handle('reset-stats', () => {
    // Reset all tracking data
    Object.keys(trackingData.keyboard).forEach(key => {
      if (Array.isArray(trackingData.keyboard[key])) {
        trackingData.keyboard[key] = [];
      } else if (typeof trackingData.keyboard[key] === 'number') {
        trackingData.keyboard[key] = 0;
      } else if (trackingData.keyboard[key] === null) {
        trackingData.keyboard[key] = null;
      }
    });
    
    Object.keys(trackingData.mouse).forEach(key => {
      if (Array.isArray(trackingData.mouse[key])) {
        trackingData.mouse[key] = [];
      } else if (typeof trackingData.mouse[key] === 'number') {
        trackingData.mouse[key] = 0;
      } else if (trackingData.mouse[key] === null) {
        trackingData.mouse[key] = null;
      } else if (key === 'lastPosition') {
        trackingData.mouse.lastPosition = { x: 0, y: 0 };
      }
    });
    
    Object.keys(trackingData.combined).forEach(key => {
      if (Array.isArray(trackingData.combined[key])) {
        trackingData.combined[key] = [];
      } else if (typeof trackingData.combined[key] === 'number') {
        trackingData.combined[key] = 0;
      } else if (trackingData.combined[key] === null) {
        trackingData.combined[key] = null;
      }
    });
    
    trackingData.keyboard.keyFrequency.clear();
    trackingData.mouse.activityZones.clear();
    trackingData.mouse.clickFrequency.clear();
    
    return { success: true, message: 'Statistics reset' };
  });

  ipcMain.handle('get-activity-pattern', () => {
    return detectActivityPattern();
  });

  ipcMain.handle('get-recent-activity', (event, seconds = 60) => {
    const now = Date.now();
    const cutoff = now - (seconds * 1000);
    
    const recentKeyboard = trackingData.keyboard.keystrokeHistory.filter(
      k => k.timestamp >= cutoff
    );
    
    const recentMouse = trackingData.mouse.movementHistory.filter(
      m => m.timestamp >= cutoff
    );
    
    return {
      keyboard: recentKeyboard,
      mouse: recentMouse,
      pattern: detectActivityPattern(),
      timestamp: now
    };
  });

  ipcMain.on('update-config', (event, newConfig) => {
    Object.assign(config, newConfig);
    console.log('🔧 Tracking configuration updated:', newConfig);
  });

  // DEBUG IPC HANDLERS
  ipcMain.handle('debug-uiohook', () => {
    const methods = Object.getOwnPropertyNames(uIOhook).filter(
      prop => typeof uIOhook[prop] === 'function'
    );
    
    const properties = Object.keys(uIOhook).filter(
      prop => typeof uIOhook[prop] !== 'function'
    );
    
    return {
      isUIOhookLoaded: !!uIOhook,
      uIOhookType: typeof uIOhook,
      uIOhookMethods: methods,
      uIOhookProperties: properties,
      hasOnMethod: typeof uIOhook.on === 'function',
      hasStartMethod: typeof uIOhook.start === 'function',
      hasStopMethod: typeof uIOhook.stop === 'function',
      isHookRunning,
      isTrackingEnabled,
      trackingData: {
        keyboardEvents: trackingData.keyboard.keystrokeHistory.length,
        mouseEvents: trackingData.mouse.movementHistory.length,
        totalKeystrokes: trackingData.keyboard.totalKeystrokes,
        totalClicks: trackingData.mouse.totalClicks
      },
      timestamp: Date.now()
    };
  });
});

app.on("window-all-closed", () => {
  stopUIOhook();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  stopUIOhook();
});

app.on("will-quit", () => {
  stopUIOhook();
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
});
