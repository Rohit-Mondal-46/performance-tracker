// electron/preload.js
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
      if (document.head) {
        document.head.appendChild(script);
      } else {
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

  // Tracking Manager API
  tracking: {
    toggleTracking: (enabled) => {
      ipcRenderer.send('toggle-tracking', enabled);
    },
    
    getCurrentData: () => {
      return ipcRenderer.invoke('tracking:getCurrentData');
    },
    
    getDetailedStats: () => {
      return ipcRenderer.invoke('get-detailed-stats');
    },
    
    reset: () => {
      return ipcRenderer.invoke('tracking:reset');
    },
    
    resetStats: () => {
      return ipcRenderer.invoke('reset-stats');
    },
    
    getActivityPattern: () => {
      return ipcRenderer.invoke('get-activity-pattern');
    },
    
    updateConfig: (config) => {
      ipcRenderer.send('update-config', config);
    },
    
    onTrackingInitialized: (callback) => {
      ipcRenderer.on('tracking-initialized', (event, data) => callback(data));
      return () => ipcRenderer.removeListener('tracking-initialized', callback);
    },
    
    onPeriodicData: (callback) => {
      ipcRenderer.on('periodic-activity-data', (event, data) => callback(data));
      return () => ipcRenderer.removeListener('periodic-activity-data', callback);
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
  
  // Simple Sync Manager (no sessions)
  sync: {
    start: () => ipcRenderer.invoke('sync:start'),
    stop: () => ipcRenderer.invoke('sync:stop'),
    status: () => ipcRenderer.invoke('sync:status'),
    setToken: (token) => ipcRenderer.invoke('sync:setToken', token),
    forceReset: () => ipcRenderer.invoke('sync:forceReset'),
    forceSend: () => ipcRenderer.invoke('sync:forceSend'),
    onSyncCompleted: (callback) => {
      ipcRenderer.on('sync-completed', (event, data) => callback(data));
      return () => ipcRenderer.removeListener('sync-completed', callback);
    },
  },
  
  // MediaPipe
  mediaPipe: {
    isReady: () => mediaPipeLoaded,
    load: loadMediaPipeScripts,
  },
  
  // Utilities
  openExternal: (url) => ipcRenderer.invoke("shell:openExternal", url),
});

// Automatically start loading MediaPipe when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadMediaPipeScripts);
} else {
  loadMediaPipeScripts();
}