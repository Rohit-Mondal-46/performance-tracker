
// electron/main.js
import { app, BrowserWindow, ipcMain, session, shell, desktopCapturer } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { screenshotManager } from './screenshotManager.js';
import { uIOhook } from 'uiohook-napi';
import fs from 'fs/promises';
import fsSync from 'fs';
import os from 'os';
import * as ort from 'onnxruntime-node'; // Add this import

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add ONNX model state variables
let onnxSession = null;
let modelConfig = null;

// Debug: Log the current directory and file structure
console.log('Current directory:', __dirname);
console.log('App path:', app.getAppPath());
console.log('Files in directory:', fsSync.readdirSync(__dirname));

// Check if preload.js exists
const preloadPath = path.join(__dirname, 'preload.js');
console.log('Preload path:', preloadPath);
console.log('Preload exists:', fsSync.existsSync(preloadPath));

let mainWindow;
let isTrackingEnabled = true;
let isHookRunning = false;

// Store token globally for access
let authToken = null;

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

// electron/main.js - UPDATE createWindow function
function createWindow() {
  console.log('🔧 Creating BrowserWindow...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      preload: preloadPath, // Use the validated preload path
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Required for ONNX native modules
      webSecurity: false, // Required for local file access
      allowRunningInsecureContent: true,
      enableRemoteModule: false,
      nativeWindowOpen: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false
    },
    icon: path.join(__dirname, '..', 'public', 'icon.ico'),
    show: true, // Changed to true - show window immediately
    backgroundColor: '#f8fafc'
  });

  console.log('✅ BrowserWindow created');

  // Show window when ready (redundant since show: true but kept for safety)
  mainWindow.once('ready-to-show', () => {
    console.log('📺 Window ready to show');
    mainWindow.show();
    
    // Focus the window
    if (process.platform === 'darwin') {
      app.focus();
    }
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
    
    // Try to show an error page
    mainWindow.loadURL(`data:text/html;charset=utf-8,
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0;">
          <h1>❌ Failed to Load Application</h1>
          <p><strong>Error:</strong> ${errorDescription}</p>
          <p><strong>URL:</strong> ${validatedURL}</p>
          <p><strong>Error Code:</strong> ${errorCode}</p>
          <hr>
          <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px;">
            Reload
          </button>
        </body>
      </html>
    `);
  });

  // Log when page starts loading
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('🔄 Started loading page...');
  });

  // Log when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Page finished loading');
    mainWindow.show(); // Ensure window is shown after load
  });

  // Log when DOM is ready
  mainWindow.webContents.on('dom-ready', () => {
    console.log('📄 DOM is ready');
  });

  // Load the app
  console.log('📦 Loading application...');
  
  if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    console.log('🔧 Development mode, loading:', devUrl);
    
    mainWindow.loadURL(devUrl).then(() => {
      console.log('✅ Dev server loaded successfully');
      mainWindow.webContents.openDevTools();
    }).catch(err => {
      console.error('❌ Failed to load dev server:', err);
    });
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    console.log('🏭 Production mode, loading:', indexPath);
    
    mainWindow.loadFile(indexPath).then(() => {
      console.log('✅ Production build loaded successfully');
    }).catch(err => {
      console.error('❌ Failed to load production build:', err);
      
      // Try alternative paths
      const alternatives = [
        path.join(__dirname, 'dist', 'index.html'),
        path.join(__dirname, '..', 'public', 'index.html'),
        path.join(__dirname, 'index.html')
      ];
      
      console.log('🔍 Trying alternative paths...');
      alternatives.forEach((altPath, index) => {
        console.log(`  ${index + 1}. ${altPath}`);
        mainWindow.loadFile(altPath).then(() => {
          console.log(`✅ Loaded from alternative: ${altPath}`);
        }).catch(e => {
          console.log(`❌ Failed: ${altPath}`);
        });
      });
    });
  }

  mainWindow.on('closed', () => {
    console.log('🔒 Window closed');
    screenshotManager.stop();
    stopUIOhook();
    mainWindow = null;
  });

  // Maximize window on creation (optional)
  mainWindow.maximize();
}

app.whenReady().then(() => {
  console.log('🚀 Electron app is ready');
  
  // Configure session for file access
  session.defaultSession.protocol.registerFileProtocol('file', (request, callback) => {
    const url = request.url.substr(7);
    callback({ path: path.normalize(url) });
  });

  // Set content security policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: file: http://localhost:*",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: file: blob:",
          "connect-src 'self' http://localhost:* ws://localhost:*",
          "media-src 'self' blob:",
          "font-src 'self' data:"
        ].join('; ')
      }
    });
  });

  createWindow();
  
  // Wait a bit before initializing uIOhook to ensure window is ready
  setTimeout(() => {
    console.log('⏰ Initializing uIOhook after delay...');
    initializeUIOhook();
  }, 1000);

  app.on("activate", () => {
    console.log('🔄 App activated');
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      setTimeout(() => {
        initializeUIOhook();
      }, 1000);
    }
  });
  
  // Add global error handler
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    if (mainWindow) {
      mainWindow.webContents.send('app-error', error.message);
    }
  });

  process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
    if (mainWindow) {
      mainWindow.webContents.send('app-error', error.message);
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

        // Store token globally
        authToken = token;
        
        // Set token for screenshot manager and start
        screenshotManager.setAuthToken(token);
        screenshotManager.start();

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
    screenshotManager.stop();
    stopUIOhook();
    authToken = null;
    await session.defaultSession.cookies.remove("http://localhost", "authToken");
    return { success: true };
  });

  ipcMain.handle("ping", () => {
    return { success: true, message: 'pong', timestamp: Date.now() };
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

  // SCREENSHOT HANDLERS
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

  ipcMain.handle('screenshot:setToken', async (_, token) => {
    screenshotManager.setAuthToken(token);
    return { success: true };
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
  ipcMain.handle('debug:getToken', () => {
    return { 
      hasToken: !!authToken,
      tokenPreview: authToken ? `${authToken.substring(0, 20)}...` : null,
      length: authToken?.length || 0
    };
  });

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

  // ONNX MODEL HANDLERS (NEW)
  ipcMain.handle('model:load', async () => {
    try {
      if (onnxSession) {
        console.log('✅ ONNX model already loaded in main process.');
        return { success: true, config: modelConfig };
      }

      const modelPath = path.join(__dirname, '..', 'public', 'models', 'ObjectDetector', 'best.onnx');
      const configPath = path.join(__dirname, '..', 'public', 'models', 'ObjectDetector', 'model-config.json');
      
      // Check if files exist before trying to load
      if (!fsSync.existsSync(modelPath)) {
        throw new Error(`Model file not found: ${modelPath}`);
      }
      if (!fsSync.existsSync(configPath)) {
        throw new Error(`Config file not found: ${configPath}`);
      }

      console.log('🔧 Loading ONNX model from:', modelPath);

      // Load model config
      const configData = await fs.readFile(configPath, 'utf-8');
      modelConfig = JSON.parse(configData);
      // Ensure classes are defined, fallback if not in config
      modelConfig.classes = modelConfig.classes || ['phone'];

      // Create ONNX inference session
      onnxSession = await ort.InferenceSession.create(modelPath);
      
      console.log('✅ ONNX model loaded successfully in main process');
      return { success: true, config: modelConfig };

    } catch (error) {
      console.error('❌ Failed to load ONNX model in main process:', error);
      return { success: false, error: error.message };
    }
  });

  // IPC Handler to run inference
  ipcMain.handle('model:detect', async (event, imageData) => {
    try {
      if (!onnxSession) {
        throw new Error('Model is not loaded. Please load the model first.');
      }

      // imageData is an object with { tensorData, width, height }
      const { tensorData, width, height } = imageData;
      
      // Create a tensor from the raw data sent from the renderer
      const inputTensor = new ort.Tensor('float32', new Float32Array(tensorData), [1, 3, 640, 640]);

      const inputs = { [onnxSession.inputNames[0]]: inputTensor };
      const outputs = await onnxSession.run(inputs);

      // Convert ONNX output to a simple JSON-serializable format to send back to renderer
      const outputData = outputs.output0.data;
      const outputDims = outputs.output0.dims;

      return {
        success: true,
        output: {
          data: Array.from(outputData), // Convert TypedArray to regular array for JSON serialization
          dims: outputDims
        },
        originalWidth: width,
        originalHeight: height
      };

    } catch (error) {
      console.error('❌ Inference failed in main process:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('model:get-path', async (event, relativePath) => {
    try {
      // Handle different path formats
      let modelPath;
      if (relativePath.startsWith('/')) {
        // Absolute path from app root
        modelPath = path.join(app.getAppPath(), relativePath.substring(1));
      } else if (relativePath.startsWith('./')) {
        // Relative path from app root
        modelPath = path.join(app.getAppPath(), relativePath.substring(2));
      } else {
        // Direct relative path
        modelPath = path.join(app.getAppPath(), relativePath);
      }

      console.log('🔍 Model path requested:', relativePath);
      console.log('📁 Full model path:', modelPath);
      
      // Check if file exists
      try {
        await fs.access(modelPath);
        console.log('✅ Model file exists');
        return { 
          success: true, 
          path: modelPath,
          exists: true
        };
      } catch (error) {
        console.log('❌ Model file not found:', modelPath);
        
        // Try alternative locations
        const alternatives = [
          path.join(app.getAppPath(), 'public', relativePath),
          path.join(app.getAppPath(), 'dist', relativePath),
          path.join(app.getAppPath(), relativePath)
        ];
        
        for (const altPath of alternatives) {
          try {
            await fs.access(altPath);
            console.log('✅ Found model at alternative location:', altPath);
            return { 
              success: true, 
              path: altPath,
              exists: true,
              alternative: true
            };
          } catch (e) {
            // Continue to next alternative
          }
        }
        
        return { 
          success: false, 
          path: modelPath,
          exists: false,
          error: 'Model file not found at any location'
        };
      }
    } catch (error) {
      console.error('❌ Error getting model path:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  });

  ipcMain.handle('model:read-config', async (event, configPath) => {
    try {
      let fullPath;
      if (configPath.startsWith('/')) {
        fullPath = path.join(app.getAppPath(), configPath.substring(1));
      } else {
        fullPath = path.join(app.getAppPath(), configPath);
      }
      
      const content = await fs.readFile(fullPath, 'utf-8');
      return {
        success: true,
        content: content,
        path: fullPath
      };
    } catch (error) {
      console.error('❌ Error reading config:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('model:get-gpu-info', () => {
    try {
      const gpuInfo = {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: Math.round(os.totalmem() / (1024 * 1024 * 1024)), // GB
        freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024)), // GB
        gpu: 'Unknown'
      };

      // Try to get GPU info
      if (os.platform() === 'win32') {
        try {
          const { execSync } = require('child_process');
          const result = execSync('wmic path win32_VideoController get name', { encoding: 'utf-8' });
          const lines = result.split('\n').filter(line => line.trim());
          if (lines.length > 1) {
            gpuInfo.gpu = lines[1].trim();
          }
        } catch (e) {
          gpuInfo.gpu = 'Unknown (failed to query)';
        }
      } else if (os.platform() === 'darwin') {
        try {
          const { execSync } = require('child_process');
          const result = execSync('system_profiler SPDisplaysDataType | grep "Chipset Model"', { encoding: 'utf-8' });
          const match = result.match(/Chipset Model: (.+)/);
          if (match) {
            gpuInfo.gpu = match[1].trim();
          }
        } catch (e) {
          gpuInfo.gpu = 'Unknown (failed to query)';
        }
      } else if (os.platform() === 'linux') {
        try {
          const { execSync } = require('child_process');
          const result = execSync('lspci | grep -i vga', { encoding: 'utf-8' });
          gpuInfo.gpu = result.trim() || 'Unknown';
        } catch (e) {
          gpuInfo.gpu = 'Unknown (failed to query)';
        }
      }

      return {
        success: true,
        ...gpuInfo,
        electronVersion: process.versions.electron,
        nodeVersion: process.version,
        chromeVersion: process.versions.chrome,
        onnxAvailable: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Update the existing model:check-onnx handler
  ipcMain.handle('model:check-onnx', () => {
    try {
      // Check if ONNX is available
      // We're importing it at the top of the file, so we know it's available
      return {
        success: true,
        available: true,
        message: 'ONNX Runtime is available in main process'
      };
    } catch (error) {
      return {
        success: false,
        available: false,
        error: error.message,
        message: 'ONNX Runtime not available in main process'
      };
    }
  });

  // Update the existing model:test-inference handler
  ipcMain.handle('model:test-inference', async (event) => {
    try {
      // Check if ONNX is available
      // We're importing it at the top of the file, so we know it's available
      
      // Create a simple test tensor
      const testData = new Float32Array(1 * 3 * 640 * 640).fill(0.5);
      const tensor = new ort.Tensor('float32', testData, [1, 3, 640, 640]);
      
      return {
        success: true,
        onnxAvailable: true,
        tensorCreated: true,
        tensorShape: tensor.dims,
        message: 'ONNX Runtime test successful in main process'
      };
    } catch (error) {
      return {
        success: false,
        onnxAvailable: false,
        error: error.message,
        message: 'ONNX Runtime test failed in main process'
      };
    }
  });

  // File system handlers
  ipcMain.handle('fs:read-file', async (event, filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('fs:exists', async (event, filePath) => {
    try {
      await fs.access(filePath);
      return { success: true, exists: true };
    } catch (error) {
      return { success: true, exists: false };
    }
  });
});

app.on("window-all-closed", () => {
  screenshotManager.stop();
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