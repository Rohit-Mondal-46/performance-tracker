
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


// // electron/preload.js
// const { contextBridge, ipcRenderer } = require("electron");

// let mediaPipeLoaded = false;
// let mediaPipeLoadPromise = null;

// /**
//  * Safe loader for MediaPipe scripts
//  */
// function loadMediaPipeScripts() {
//   if (mediaPipeLoaded) return Promise.resolve(true);
//   if (mediaPipeLoadPromise) return mediaPipeLoadPromise;

//   mediaPipeLoadPromise = new Promise((resolve) => {
//     const scripts = [
//       'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
//       'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js', 
//       'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
//       'https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js'
//     ];

//     let loadedCount = 0;
//     const totalScripts = scripts.length;

//     const checkDone = () => {
//       if (loadedCount === totalScripts) {
//         mediaPipeLoaded = true;
//         resolve(true);
//       }
//     };

//     scripts.forEach(src => {
//       const script = document.createElement('script');
//       script.src = src;
//       script.onload = () => {
//         loadedCount++;
//         console.log(`✅ Loaded: ${src}`);
//         checkDone();
//       };
//       script.onerror = () => {
//         loadedCount++;
//         console.warn(`❌ Failed to load: ${src}`);
//         checkDone();
//       };
//       // Append script safely
//       if (document.head) {
//         document.head.appendChild(script);
//       } else {
//         console.warn("⚠️ Document.head not ready, retrying on DOMContentLoaded");
//         document.addEventListener('DOMContentLoaded', () => document.head.appendChild(script));
//       }
//     });
//   });

//   return mediaPipeLoadPromise;
// }

// // --------------------------------------------------
// // Expose API to renderer
// // --------------------------------------------------
// contextBridge.exposeInMainWorld("electronAPI", {
//   // General
//   ping: async () => await ipcRenderer.invoke("ping"),

//   // Tracking
//   sendTrackingData: (data) => ipcRenderer.send("tracking-data", data),
//   onTrackingResponse: (callback) => ipcRenderer.on("tracking-response", callback),

//   // MediaPipe
//   isMediaPipeReady: () => mediaPipeLoaded,
//   loadMediaPipe: loadMediaPipeScripts,

//   // Authentication
//   login: (credentials) => ipcRenderer.invoke("auth:login", credentials),
//   logout: () => ipcRenderer.invoke("auth:logout"),
//   getToken: () => ipcRenderer.invoke("auth:getToken")
// });

// // Automatically start loading MediaPipe when DOM is ready
// if (document.readyState === "loading") {
//   document.addEventListener("DOMContentLoaded", () => {
//     console.log("🔧 Preload: DOM loaded, starting MediaPipe scripts");
//     loadMediaPipeScripts();
//   });
// } else {
//   console.log("🔧 Preload: DOM already ready, starting MediaPipe scripts");
//   loadMediaPipeScripts();
// }

// console.log("🔧 Preload script initialized");
