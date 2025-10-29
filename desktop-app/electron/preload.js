
// // electron/preload.js
// const { contextBridge, ipcRenderer } = require("electron");

// // Expose protected methods that allow the renderer process to use
// // the ipcRenderer without exposing the entire object
// contextBridge.exposeInMainWorld("electronAPI", {
//   ping: async () => await ipcRenderer.invoke("ping"),
//   sendTrackingData: (data) => ipcRenderer.send("tracking-data", data),
//   onTrackingResponse: (callback) => ipcRenderer.on("tracking-response", callback),
// });

// // Add loaded event
// window.addEventListener("DOMContentLoaded", () => {
//   console.log("Preload script loaded successfully");
// });


// electron/preload.js - FIXED VERSION
const { contextBridge, ipcRenderer } = require("electron");

let mediaPipeLoaded = false;
let mediaPipeLoadPromise = null;

// Safe script loader that waits for DOM
function loadMediaPipeScripts() {
  if (mediaPipeLoaded) return Promise.resolve(true);
  if (mediaPipeLoadPromise) return mediaPipeLoadPromise;

  mediaPipeLoadPromise = new Promise((resolve) => {
    const loadScripts = () => {
      console.log("Loading MediaPipe scripts...");
      
      const scripts = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js', 
        'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js'
      ];

      let loaded = 0;
      const total = scripts.length;

      scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          loaded++;
          console.log(`✅ Loaded: ${src}`);
          if (loaded === total) {
            mediaPipeLoaded = true;
            console.log("🎉 All MediaPipe scripts loaded successfully");
            resolve(true);
          }
        };
        script.onerror = () => {
          loaded++;
          console.warn(`❌ Failed to load: ${src}`);
          if (loaded === total) {
            mediaPipeLoaded = true;
            console.log("⚠️ MediaPipe scripts completed with some errors");
            resolve(true); // Still resolve to allow app to continue
          }
        };
        // SAFE: Only append if document.head exists
        if (document.head) {
          document.head.appendChild(script);
        } else {
          console.warn('Document head not available yet');
          resolve(false);
        }
      });
    };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadScripts);
    } else {
      loadScripts();
    }
  });

  return mediaPipeLoadPromise;
}

contextBridge.exposeInMainWorld("electronAPI", {
  ping: async () => await ipcRenderer.invoke("ping"),
  sendTrackingData: (data) => ipcRenderer.send("tracking-data", data),
  onTrackingResponse: (callback) => ipcRenderer.on("tracking-response", callback),
  isMediaPipeReady: () => mediaPipeLoaded,
  loadMediaPipe: loadMediaPipeScripts
});

// Start loading when preload is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("🔧 Preload script: DOM loaded, starting MediaPipe load");
    loadMediaPipeScripts();
  });
} else {
  console.log("🔧 Preload script: DOM already ready, starting MediaPipe load");
  loadMediaPipeScripts();
}

console.log("🔧 Preload script initialized");