// electron/trackingManager.js
import { uIOhook } from 'uiohook-napi';

export class TrackingManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.isTrackingEnabled = true;
    this.isHookRunning = false;
    
    // Simplified tracking data - only store what we need for 5-minute intervals
    this.trackingData = {
      // We'll accumulate data for 5 minutes, then reset
      keyboard: {
        totalKeystrokes: 0,
        lastResetTime: Date.now()
      },
      mouse: {
        totalClicks: 0,
        totalDistance: 0, // in pixels
        scrollDistance: 0,
        lastResetTime: Date.now()
      }
    };

    // Configuration
    this.config = {
      mouse: {
        minimumMovement: 2, // pixels to consider as intentional movement
      },
      tracking: {
        sendInterval: 300000 // Send data every 5 minutes (300,000ms)
      }
    };

    // Send interval
    this.sendInterval = null;
  }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  initialize() {
    try {
      console.log('🔧 Initializing simplified input tracking...');
      
      if (!uIOhook || typeof uIOhook !== 'object') {
        console.error('❌ uIOhook module not properly loaded');
        this.sendTrackingStatus('error', 'uIOhook module not loaded');
        return false;
      }
      
      this.setupEventListeners();
      this.startUIOhook();
      
      // Note: SimpleSyncManager in main.js handles periodic sending
      // Don't start internal interval to avoid duplicate sends
      // this.startSendInterval();
      
      return true;
      
    } catch (error) {
      console.error('❌ Error initializing tracking:', error);
      this.sendTrackingStatus('error', error.message);
      return false;
    }
  }

  startTracking() {
    if (!this.isHookRunning) {
      this.initialize();
    }
    this.isTrackingEnabled = true;
    console.log('🔧 Tracking enabled');
  }

  stopTracking() {
    this.isTrackingEnabled = false;
    console.log('🔧 Tracking disabled');
  }

  stop() {
    try {
      if (this.isHookRunning) {
        console.log('🛑 Stopping tracking...');
        
        uIOhook.stop();
        uIOhook.removeAllListeners();
        
        // Clear intervals
        if (this.sendInterval) {
          clearInterval(this.sendInterval);
        }
        
        this.isHookRunning = false;
        console.log('✅ Tracking stopped');
      }
    } catch (error) {
      console.error('❌ Error stopping tracking:', error);
    }
  }

  // Get and reset tracking data for the 5-minute period
  getAndResetTrackingData() {
    const now = Date.now();
    
    // Calculate durations
    const keyboardDuration = now - this.trackingData.keyboard.lastResetTime;
    const mouseDuration = now - this.trackingData.mouse.lastResetTime;
    
    // Prepare data to send
    const dataToSend = {
      keyboard: {
        totalKeystrokes: this.trackingData.keyboard.totalKeystrokes,
        duration: keyboardDuration,
        keystrokesPerMinute: (this.trackingData.keyboard.totalKeystrokes / (keyboardDuration / 60000)).toFixed(2)
      },
      mouse: {
        totalClicks: this.trackingData.mouse.totalClicks,
        totalDistance: Math.round(this.trackingData.mouse.totalDistance),
        scrollDistance: Math.round(this.trackingData.mouse.scrollDistance),
        duration: mouseDuration,
        clicksPerMinute: (this.trackingData.mouse.totalClicks / (mouseDuration / 60000)).toFixed(2)
      },
      timestamp: now,
      startTime: this.trackingData.keyboard.lastResetTime,
      endTime: now
    };
    
    // Reset counters
    this.resetCounters();
    
    return dataToSend;
  }

  // Reset just the counters (not the lastResetTime)
  resetCounters() {
    const now = Date.now();
    
    this.trackingData.keyboard.totalKeystrokes = 0;
    this.trackingData.keyboard.lastResetTime = now;
    
    this.trackingData.mouse.totalClicks = 0;
    this.trackingData.mouse.totalDistance = 0;
    this.trackingData.mouse.scrollDistance = 0;
    this.trackingData.mouse.lastResetTime = now;
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Keyboard events - only care about keydown
    uIOhook.on('keydown', this.handleKeyDown.bind(this));
    
    // Mouse events
    uIOhook.on('mousemove', this.handleMouseMove.bind(this));
    uIOhook.on('click', this.handleClick.bind(this));
    uIOhook.on('wheel', this.handleWheel.bind(this));
    
    console.log('✅ Event listeners registered');
  }

  startUIOhook() {
    console.log('🔄 Starting input tracking...');
    
    try {
      uIOhook.start();
      this.isHookRunning = true;
      
      this.sendTrackingStatus('success', 'Tracking started successfully');
      
      console.log('✅ uIOhook started successfully!');
    } catch (error) {
      console.error('❌ Failed to start uIOhook:', error);
      this.sendTrackingStatus('error', error.message);
    }
  }

  startSendInterval() {
    // Send data every 5 minutes
    this.sendInterval = setInterval(() => {
      if (!this.isTrackingEnabled) return;
      
      const data = this.getAndResetTrackingData();
      this.sendPeriodicData(data);
      
    }, this.config.tracking.sendInterval);
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  handleKeyDown(event) {
    if (!this.isTrackingEnabled) return;
    
    // Count all keydown events
    this.trackingData.keyboard.totalKeystrokes++;
  }

  handleMouseMove(event) {
    if (!this.isTrackingEnabled) return;
    
    // Calculate movement distance
    const lastPos = this.trackingData.mouse.lastPosition || { x: event.x, y: event.y };
    const distance = Math.sqrt(
      Math.pow(event.x - lastPos.x, 2) +
      Math.pow(event.y - lastPos.y, 2)
    );
    
    // Only track if movement is significant
    if (distance >= this.config.mouse.minimumMovement) {
      this.trackingData.mouse.totalDistance += distance;
    }
    
    // Update last position
    this.trackingData.mouse.lastPosition = { x: event.x, y: event.y };
  }

  handleClick(event) {
    if (!this.isTrackingEnabled) return;
    
    // Count all clicks
    this.trackingData.mouse.totalClicks++;
  }

  handleWheel(event) {
    if (!this.isTrackingEnabled) return;
    
    // Track scroll distance (absolute value)
    this.trackingData.mouse.scrollDistance += Math.abs(event.rotation);
  }

  // ============================================
  // COMMUNICATION METHODS
  // ============================================

  sendTrackingStatus(status, message = '') {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('tracking-initialized', {
        timestamp: Date.now(),
        status: status,
        message: message
      });
    }
  }

  sendPeriodicData(data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      console.log('📤 Sending 5-minute activity data:', data);
      this.mainWindow.webContents.send('periodic-activity-data', data);
    }
  }
}