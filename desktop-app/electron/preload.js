
const { contextBridge, ipcRenderer } = require('electron');

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
    
    getKeyboardStats: () => {
      return new Promise((resolve) => {
        ipcRenderer.once('keyboard-stats-response', (event, data) => resolve(data));
        ipcRenderer.send('get-keyboard-stats');
      });
    },
    
    getMouseStats: () => {
      return new Promise((resolve) => {
        ipcRenderer.once('mouse-stats-response', (event, data) => resolve(data));
        ipcRenderer.send('get-mouse-stats');
      });
    },
    
    getDetailedStats: () => {
      return ipcRenderer.invoke('get-detailed-stats');
    },
    
    resetStats: () => {
      return ipcRenderer.invoke('reset-stats');
    }
  },

  // MediaPipe
  mediaPipe: {
    isReady: () => mediaPipeLoaded,
    load: loadMediaPipeScripts,
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
  },
});



// Automatically start loading MediaPipe when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    loadMediaPipeScripts();
  });
} else {
  loadMediaPipeScripts();
}

