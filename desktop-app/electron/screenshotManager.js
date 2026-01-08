// electron/screenshotManager.js - IMPROVE
import { desktopCapturer, app } from 'electron';
import sharp from 'sharp';
import axios from 'axios';

class ScreenshotManager {
  constructor() {
    this.INTERVAL_MS = 60 * 1000; // 5 mins
    this.BLUR_RADIUS = 1;
    this.UPLOAD_URL = 'http://localhost:3000/api/screenshots/upload';
    
    this.authToken = null;
    this.timer = null;
    this.running = false;
    this.consecutiveErrors = 0;
    this.maxErrors = 5;
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  async captureAndUpload() {
    if (!this.authToken) {
      return;
    }

    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 },
      });

      if (!sources.length) {
        return;
      }

      const png = sources[0].thumbnail.toPNG();
      
      // Blur screenshot
      const blurred = await sharp(png)
        .blur(this.BLUR_RADIUS)
        .png({ quality: 80 })
        .toBuffer();

      // Upload
      await axios.post(
        this.UPLOAD_URL,
        {
          image: blurred.toString('base64'),
          timestamp: Date.now(),
        },
        {
          headers: { 
            Authorization: `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000,
        }
      );

      this.consecutiveErrors = 0; // Reset on success
      
    } catch (err) {
      this.consecutiveErrors++;
      console.error('[SSM] Error:', err.message);
      
      // Stop if too many consecutive errors
      if (this.consecutiveErrors >= this.maxErrors) {
        console.error('[SSM] Too many errors, stopping monitor');
        this.stop();
      }
    }
  }

  start() {
    if (this.running) {
      return;
    }
    
    if (!this.authToken) {
      console.error('[SSM] Cannot start: No auth token');
      return false;
    }

    this.running = true;
    this.timer = setInterval(() => this.captureAndUpload(), this.INTERVAL_MS);
    
    // Initial capture
    setTimeout(() => this.captureAndUpload(), 1000);
    
    return true;
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.running = false;
    this.consecutiveErrors = 0;
  }

  getStatus() {
    return {
      running: this.running,
      hasToken: !!this.authToken,
      interval: this.INTERVAL_MS,
      errors: this.consecutiveErrors,
    };
  }
}

export const screenshotManager = new ScreenshotManager();