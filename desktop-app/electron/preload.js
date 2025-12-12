// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');


let mediaPipeLoaded = false;
let mediaPipeLoadPromise = null;

/**
 * Safe loader for MediaPipe scripts
 */
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
        console.log(`✅ Loaded: ${src}`);
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
contextBridge.exposeInMainWorld("electron", {
  // General
  ping: async () => await ipcRenderer.invoke("ping"),

  // Tracking
  tracking: {
    sendData: (data) => ipcRenderer.send("tracking-data", data),
    onResponse: (callback) => ipcRenderer.on("tracking-response", callback),
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

  // Open external URL in browser
  openExternal: (url) => ipcRenderer.invoke("shell:openExternal", url),
});

// Automatically start loading MediaPipe when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("🔧 Preload: DOM loaded, starting MediaPipe scripts");
    loadMediaPipeScripts();
  });
} else {
  console.log("🔧 Preload: DOM already ready, starting MediaPipe scripts");
  loadMediaPipeScripts();
}

console.log("🔧 Preload script initialized");
