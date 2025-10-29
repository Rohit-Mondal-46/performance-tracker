
// // utils/mediapipeLoader.js
// import { setupMediaPipePatches } from './mediapipePatcher';
// import { setupAssetLoaderPatches } from './assetLoaderPatcher';

// export const loadMediaPipeAssets = async () => {
//   const isElectron = window && window.process && window.process.versions?.electron;
  
//   if (!isElectron) {
//     console.log('Web environment - using CDN for MediaPipe assets');
//     return true; // Web environment uses CDN
//   }

//   try {
//     console.log('Electron environment detected - preparing MediaPipe assets');
    
//     // Check if Node.js modules are available in Electron
//     if (!window.require) {
//       console.warn('Node.js require not available in Electron context');
//       return false;
//     }

//     // Apply patches early to prevent WASM errors
//     setupMediaPipePatches();

//     // For Electron, we'll use CDN instead of local files to avoid WASM issues
//     console.log('Using CDN approach for Electron to avoid WASM file system issues');
//     return true;
    
//   } catch (error) {
//     console.warn('MediaPipe asset preparation failed:', error);
//     return false;
//   }
// };

// // Remove the ensureEssentialFiles and downloadFile functions since we're using CDN approach
// // These caused more problems than they solved in Electron

// // Alternative: Simple asset availability check
// export const checkMediaPipeAssets = () => {
//   const isElectron = window && window.process && window.process.versions?.electron;
  
//   if (!isElectron) {
//     return { available: true, reason: 'Web environment uses CDN' };
//   }

//   // For Electron, we consider assets "available" since we'll use CDN with patches
//   return { available: true, reason: 'Using CDN with patches' };
// };

// // Main initialization function
// export const initializeMediaPipe = async () => {
//   try {
//     const isElectron = window && window.process && window.process.versions?.electron;
    
//     // Apply patches early for Electron
//     if (isElectron) {
//       setupMediaPipePatches();
//     }

//     if (isElectron) {
//       console.log('Initializing MediaPipe for Electron with CDN approach...');
//       // Always use CDN for Electron - local files cause too many WASM issues
//       return await initializeMediaPipeFromCDN();
//     } else {
//       // Web environment
//       return await initializeMediaPipeFromCDN();
//     }
    
//   } catch (error) {
//     console.error('MediaPipe initialization failed:', error);
//     throw error;
//   }
// };

// // CDN-based initialization - UPDATED
// const initializeMediaPipeFromCDN = async () => {
//   console.log('Initializing MediaPipe from CDN...');
  
//   const isElectron = window && window.process && window.process.versions?.electron;
  
//   // Apply patches before loading for Electron
//   if (isElectron) {
//     setupMediaPipePatches();
//   }

//   // Load scripts from CDN with better error handling
//   const loadScriptWithRetry = async (url, retries = 3) => {
//     for (let attempt = 1; attempt <= retries; attempt++) {
//       try {
//         await new Promise((resolve, reject) => {
//           const script = document.createElement('script');
//           script.src = url;
//           script.onload = resolve;
//           script.onerror = () => reject(new Error(`Failed to load ${url}`));
//           document.head.appendChild(script);
//         });
//         console.log(`Successfully loaded: ${url}`);
//         return true;
//       } catch (error) {
//         if (attempt === retries) {
//           console.error(`Failed to load ${url} after ${retries} attempts:`, error);
//           throw error;
//         }
//         console.warn(`Attempt ${attempt} failed for ${url}, retrying...`);
//         await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
//       }
//     }
//   };

//   try {
//     await Promise.all([
//       loadScriptWithRetry('https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js'),
//       loadScriptWithRetry('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'),
//       loadScriptWithRetry('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'),
//       loadScriptWithRetry('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js')
//     ]);

//     console.log('All MediaPipe CDN scripts loaded successfully');

//     // Apply additional patches after loading for Electron
//     if (isElectron) {
//       // Give MediaPipe a moment to initialize, then apply final patches
//       setTimeout(() => {
//         if (window.mockMediaPipeDependencies) {
//           window.mockMediaPipeDependencies();
//         }
//       }, 1000);
//     }

//     return {
//       Holistic: window.Holistic,
//       Hands: window.Hands,
//       Camera: window.Camera,
//       DrawingUtils: window.DrawingUtils,
//       source: 'cdn'
//     };

//   } catch (error) {
//     console.error('Failed to load MediaPipe from CDN:', error);
//     throw new Error(`MediaPipe CDN loading failed: ${error.message}`);
//   }
// };

// // Remove local file initialization since it causes too many issues
// // const initializeMediaPipeFromLocal = async () => {
// //   // This causes WASM file system errors in Electron
// //   console.warn('Local file initialization disabled due to Electron WASM issues');
// //   return await initializeMediaPipeFromCDN();
// // };

// // Utility function to load scripts
// const loadScript = (src) => {
//   return new Promise((resolve, reject) => {
//     const script = document.createElement('script');
//     script.src = src;
//     script.onload = resolve;
//     script.onerror = reject;
//     document.head.appendChild(script);
//   });
// };

// export default {
//   loadMediaPipeAssets,
//   checkMediaPipeAssets,
//   initializeMediaPipe
// };


// utils/mediapipeLoader.js
import { setupMediaPipePatches } from './mediapipePatcher';
import { setupAssetLoaderPatches } from './assetLoaderPatcher';

// Apply patches as early as possible
if (window.process?.versions?.electron) {
  // Immediate execution for Electron
  (function() {
    try {
      setupAssetLoaderPatches();
      setupMediaPipePatches();
    } catch (patchError) {
      console.warn('Early patching failed:', patchError);
    }
  })();
}

export const loadMediaPipeAssets = async () => {
  const isElectron = window && window.process && window.process.versions?.electron;
  
  if (!isElectron) {
    console.log('Web environment - using CDN for MediaPipe assets');
    return true; // Web environment uses CDN
  }

  try {
    console.log('Electron environment detected - preparing MediaPipe assets');
    
    // Check if Node.js modules are available in Electron
    if (!window.require) {
      console.warn('Node.js require not available in Electron context');
      return false;
    }

    // Apply patches early to prevent WASM errors
    setupAssetLoaderPatches();
    setupMediaPipePatches();

    // For Electron, we'll use CDN instead of local files to avoid WASM issues
    console.log('Using CDN approach for Electron to avoid WASM file system issues');
    return true;
    
  } catch (error) {
    console.warn('MediaPipe asset preparation failed:', error);
    return false;
  }
};

// Alternative: Simple asset availability check
export const checkMediaPipeAssets = () => {
  const isElectron = window && window.process && window.process.versions?.electron;
  
  if (!isElectron) {
    return { available: true, reason: 'Web environment uses CDN' };
  }

  // For Electron, we consider assets "available" since we'll use CDN with patches
  return { available: true, reason: 'Using CDN with patches' };
};

// Main initialization function
export const initializeMediaPipe = async () => {
  try {
    const isElectron = window && window.process && window.process.versions?.electron;
    
    // Apply patches early for Electron
    if (isElectron) {
      setupAssetLoaderPatches();
      setupMediaPipePatches();
    }

    if (isElectron) {
      console.log('Initializing MediaPipe for Electron with CDN approach...');
      // Always use CDN for Electron - local files cause too many WASM issues
      return await initializeMediaPipeFromCDN();
    } else {
      // Web environment
      return await initializeMediaPipeFromCDN();
    }
    
  } catch (error) {
    console.error('MediaPipe initialization failed:', error);
    // Return partial results instead of throwing
    return {
      Holistic: window.Holistic,
      Hands: window.Hands,
      Camera: window.Camera,
      DrawingUtils: window.DrawingUtils,
      source: 'fallback'
    };
  }
};

// CDN-based initialization - UPDATED
const initializeMediaPipeFromCDN = async () => {
  console.log('Initializing MediaPipe from CDN...');
  
  const isElectron = window && window.process && window.process.versions?.electron;
  
  // Apply patches before loading for Electron
  if (isElectron) {
    setupAssetLoaderPatches();
    setupMediaPipePatches();
  }

  // Load scripts from CDN with better error handling
  const loadScriptWithRetry = async (url, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = url;
          
          // Add error handler to prevent complete failure
          script.onerror = (error) => {
            console.warn(`Script ${url} failed to load, but continuing:`, error);
            resolve(); // Resolve instead of reject to continue
          };
          
          script.onload = resolve;
          document.head.appendChild(script);
        });
        console.log(`Successfully loaded: ${url}`);
        return true;
      } catch (error) {
        if (attempt === retries) {
          console.warn(`Failed to load ${url} after ${retries} attempts:`, error);
          // Don't throw - continue without this script
          return false;
        }
        console.warn(`Attempt ${attempt} failed for ${url}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  try {
    // Load scripts without waiting for all to complete
    const results = await Promise.allSettled([
      loadScriptWithRetry('https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js'),
      loadScriptWithRetry('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js'),
      loadScriptWithRetry('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'),
      loadScriptWithRetry('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js')
    ]);

    // Check which scripts loaded successfully
    const successfulLoads = results.filter(result => result.status === 'fulfilled' && result.value);
    console.log(`MediaPipe CDN scripts loading completed: ${successfulLoads.length}/${results.length} successful`);

    // Apply additional patches after loading for Electron
    if (isElectron) {
      setTimeout(() => {
        if (window.mockMediaPipeDependencies) {
          window.mockMediaPipeDependencies();
        }
      }, 500);
    }

    return {
      Holistic: window.Holistic,
      Hands: window.Hands,
      Camera: window.Camera,
      DrawingUtils: window.DrawingUtils,
      source: 'cdn',
      loadedSuccessfully: successfulLoads.length === results.length
    };

  } catch (error) {
    console.error('Failed to load MediaPipe from CDN:', error);
    // Even if loading fails, return what we have
    return {
      Holistic: window.Holistic,
      Hands: window.Hands,
      Camera: window.Camera,
      DrawingUtils: window.DrawingUtils,
      source: 'partial',
      loadedSuccessfully: false
    };
  }
};

// Utility function to load scripts (for backward compatibility)
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default {
  loadMediaPipeAssets,
  checkMediaPipeAssets,
  initializeMediaPipe
};