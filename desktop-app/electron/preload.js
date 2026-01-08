
// electron/preload.js
import { contextBridge, ipcRenderer } from 'electron';

let mediaPipeLoaded = false;
let mediaPipeLoadPromise = null;

function loadMediaPipeScripts() {
  if (mediaPipeLoaded) return Promise.resolve(true);
  if (mediaPipeLoadPromise) return mediaPipeLoadPromise;

  mediaPipeLoadPromise = new Promise((resolve) => {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js', 
      'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js'
    ];

    let loadedCount = 0;
    const totalScripts = scripts.length;

    const checkDone = () => {
      if (loadedCount === totalScripts) {
        mediaPipeLoaded = true;
        resolve(true);
      }
    };

    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        loadedCount++;
        checkDone();
      };
      script.onerror = () => {
        loadedCount++;
        console.warn(`❌ Failed to load: ${src}`);
        checkDone();
      };
      // Append script safely
      if (document.head) {
        document.head.appendChild(script);
      } else {
        console.warn("⚠️ Document.head not ready, retrying on DOMContentLoaded");
        document.addEventListener('DOMContentLoaded', () => document.head.appendChild(script));
      }
    });
  });

  return mediaPipeLoadPromise;
}

// --------------------------------------------------
// Expose API to renderer
// --------------------------------------------------

contextBridge.exposeInMainWorld("electronAPI", {
  // General
  ping: async () => await ipcRenderer.invoke("ping"),

  // Tracking
  tracking: {
    sendData: (data) => ipcRenderer.send("tracking-data", data),
    onResponse: (callback) => ipcRenderer.on("tracking-response", callback),
    
    // Keyboard & Mouse events
    onKeyboardEvent: (callback) => {
      ipcRenderer.on('keyboard-event', (event, data) => callback(data));
      return () => ipcRenderer.removeListener('keyboard-event', callback);
    },
    onMouseEvent: (callback) => {
      ipcRenderer.on('mouse-event', (event, data) => callback(data));
      return () => ipcRenderer.removeListener('mouse-event', callback);
    },
    
    // Analytics updates
    onAnalyticsUpdate: (callback) => {
      ipcRenderer.on('analytics-update', (event, data) => callback(data));
      return () => ipcRenderer.removeListener('analytics-update', callback);
    },
    
    // Tracking initialization status
    onTrackingInitialized: (callback) => {
      ipcRenderer.on('tracking-initialized', (event, data) => callback(data));
      return () => ipcRenderer.removeListener('tracking-initialized', callback);
    },
    
    // Control functions
    toggleTracking: (enabled) => {
      ipcRenderer.send('toggle-tracking', enabled);
    },
    
    getDetailedStats: () => {
      return ipcRenderer.invoke('get-detailed-stats');
    },
    
    resetStats: () => {
      return ipcRenderer.invoke('reset-stats');
    },
    
    getActivityPattern: () => {
      return ipcRenderer.invoke('get-activity-pattern');
    },
    
    getRecentActivity: (seconds) => {
      return ipcRenderer.invoke('get-recent-activity', seconds);
    }
  },

  // Authentication
  auth: {
    login: (credentials) => ipcRenderer.invoke("auth:login", credentials),
    logout: () => ipcRenderer.invoke("auth:logout"),
    getToken: () => ipcRenderer.invoke("auth:getToken"),
  },
  
  // Screenshot Management
  screenshot: {
    test: () => ipcRenderer.invoke('screenshot:test'),
    start: () => ipcRenderer.invoke('screenshot:start'),
    stop: () => ipcRenderer.invoke('screenshot:stop'),
    status: () => ipcRenderer.invoke('screenshot:status'),
    setToken: (token) => ipcRenderer.invoke('screenshot:setToken', token),
  },
  
  // MediaPipe
  mediaPipe: {
    isReady: () => mediaPipeLoaded,
    load: loadMediaPipeScripts,
  },
  
  // Utilities
  openExternal: (url) => ipcRenderer.invoke("shell:openExternal", url),
  
  // Debug
  debug: {
    getToken: () => ipcRenderer.invoke('debug:getToken'),
    debugUiohook: () => ipcRenderer.invoke('debug-uiohook'),
  },

  // ONNX Model Handling (UPDATED)
  model: {
    // Load the model via IPC
    load: () => ipcRenderer.invoke('model:load'),
    
    // Run inference via IPC
    detect: (imageData) => ipcRenderer.invoke('model:detect', imageData),
    
    // Get model file path
    getPath: (relativePath) => ipcRenderer.invoke('model:get-path', relativePath),
    
    // Read configuration files
    readConfig: (configPath) => ipcRenderer.invoke('model:read-config', configPath),
    
    // Get system GPU info
    getGpuInfo: () => ipcRenderer.invoke('model:get-gpu-info'),
    
    // Check if ONNX is available
    checkOnnx: () => ipcRenderer.invoke('model:check-onnx'),
    
    // Test ONNX inference
    testInference: () => ipcRenderer.invoke('model:test-inference'),
    
    // Path utilities - using IPC instead of direct require
    path: {
      join: (...args) => ipcRenderer.invoke('path:join', args),
      resolve: (...args) => ipcRenderer.invoke('path:resolve', args),
      dirname: (p) => ipcRenderer.invoke('path:dirname', p),
      basename: (p, ext) => ipcRenderer.invoke('path:basename', p, ext),
      extname: (p) => ipcRenderer.invoke('path:extname', p),
      isAbsolute: (p) => ipcRenderer.invoke('path:isAbsolute', p)
    },
    
    // File system utilities
    fs: {
      exists: async (path) => {
        try {
          await ipcRenderer.invoke('fs:exists', path);
          return true;
        } catch {
          return false;
        }
      },
      readFile: async (path) => {
        return ipcRenderer.invoke('fs:read-file', path);
      }
    },
    
    // Environment info - expose process.env through IPC
    env: {
      isDev: () => ipcRenderer.invoke('env:get', 'NODE_ENV') === 'development',
      platform: () => ipcRenderer.invoke('env:get', 'platform'),
      electronVersion: () => ipcRenderer.invoke('env:get', 'electronVersion'),
      nodeVersion: () => ipcRenderer.invoke('env:get', 'nodeVersion')
    }
  },

  // File system utilities
  fs: {
    readFile: (path) => ipcRenderer.invoke('fs:read-file', path),
    exists: (path) => ipcRenderer.invoke('fs:exists', path),
  }
});

// Add missing IPC handlers for file system
contextBridge.exposeInMainWorld('nodeAPI', {
  // Use IPC to get process information instead of direct access
  process: {
    platform: () => ipcRenderer.invoke('process:get', 'platform'),
    arch: () => ipcRenderer.invoke('process:get', 'arch'),
    versions: () => ipcRenderer.invoke('process:get', 'versions'),
    env: {
      NODE_ENV: () => ipcRenderer.invoke('process:env:get', 'NODE_ENV')
    }
  }
});

// Prevent context menu in production
document.addEventListener('contextmenu', (e) => {
  // Use IPC to check environment instead of direct process access
  ipcRenderer.invoke('env:get', 'NODE_ENV').then(nodeEnv => {
    if (nodeEnv !== 'development') {
      e.preventDefault();
    }
  });
});

// Add missing IPC handlers
ipcRenderer.on('mouse-position', (event, data) => {
  // Forward mouse position events if needed
  window.dispatchEvent(new CustomEvent('electron-mouse-position', { detail: data }));
});

ipcRenderer.on('analytics-update', (event, data) => {
  // Forward analytics updates
  window.dispatchEvent(new CustomEvent('electron-analytics-update', { detail: data }));
});

// Automatically start loading MediaPipe when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    loadMediaPipeScripts();
  });
} else {
  loadMediaPipeScripts();
}