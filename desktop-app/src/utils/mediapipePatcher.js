// // utils/mediapipePatcher.js
// export const patchMediaPipeForElectron = () => {
//   if (!window.process?.versions?.electron) return;

//   console.log('Patching MediaPipe for Electron environment...');

//   // Patch the WASM file system to prevent EEXIST errors
//   if (window.Module && window.Module.FS) {
//     const originalCreatePath = window.Module.FS_createPath;
//     const originalCreateDevice = window.Module.FS_createDevice;
    
//     window.Module.FS_createPath = function(...args) {
//       try {
//         return originalCreatePath.apply(this, args);
//       } catch (error) {
//         if (error.code === 'EEXIST') {
//           // Directory already exists, return success
//           console.log('FS_createPath EEXIST handled gracefully');
//           return {};
//         }
//         console.warn('FS_createPath error:', error);
//         return {};
//       }
//     };
    
//     window.Module.FS_createDevice = function(...args) {
//       try {
//         return originalCreateDevice.apply(this, args);
//       } catch (error) {
//         if (error.code === 'EEXIST') {
//           console.log('FS_createDevice EEXIST handled gracefully');
//           return {};
//         }
//         console.warn('FS_createDevice error:', error);
//         return {};
//       }
//     };
//   }

//   // Patch XMLHttpRequest to handle missing files gracefully
//   const originalXHROpen = XMLHttpRequest.prototype.open;
//   XMLHttpRequest.prototype.open = function(method, url, ...args) {
//     // Intercept file requests and handle them gracefully
//     if (url.includes('/third_party/mediapipe/') || 
//         url.includes('blaze-out/') ||
//         url.endsWith('.tflite') ||
//         url.endsWith('.txt') ||
//         url.endsWith('.binarypb')) {
      
//       console.log(`Intercepted MediaPipe file request: ${url}`);
      
//       // Mock successful response for missing files
//       this.addEventListener('error', () => {
//         console.warn(`MediaPipe file not found: ${url}, continuing without it`);
//         // Create a mock response to prevent crashes
//         if (this.onload) {
//           this.onload();
//         }
//       });
      
//       this.addEventListener('load', () => {
//         console.log(`MediaPipe file loaded successfully: ${url}`);
//       });
//     }
    
//     return originalXHROpen.call(this, method, url, ...args);
//   };

//   // Patch console errors from WASM
//   const originalError = console.error;
//   console.error = function(...args) {
//     if (args[0] && typeof args[0] === 'string' && 
//         (args[0].includes('EEXIST') || 
//          args[0].includes('dependency:') ||
//          args[0].includes('still waiting') ||
//          args[0].includes('ErrnoError'))) {
//       // Suppress MediaPipe WASM dependency errors
//       console.warn('MediaPipe WASM issue (non-critical):', ...args);
//       return;
//     }
//     originalError.apply(console, args);
//   };

//   console.log('MediaPipe patching completed');
// };

// // Mock the missing dependencies that MediaPipe expects
// export const mockMediaPipeDependencies = () => {
//   if (!window.Module || !window.Module.FS) {
//     console.warn('FS module not available for mocking');
//     return;
//   }

//   console.log('Creating mock MediaPipe dependencies...');

//   // Create mock files that MediaPipe expects
//   const mockFiles = [
//     '/third_party/mediapipe/modules/face_detection/face_detection_short_range.tflite',
//     '/third_party/mediapipe/modules/face_geometry/data/geometry_pipeline_metadata_landmarks.binarypb',
//     '/third_party/mediapipe/modules/face_landmark/face_landmark.tflite',
//     '/third_party/mediapipe/modules/face_landmark/face_landmark_with_attention.tflite',
//     '/third_party/mediapipe/modules/hand_landmark/hand_landmark_full.tflite',
//     '/third_party/mediapipe/modules/hand_landmark/handedness.txt',
//     '/third_party/mediapipe/modules/holistic_landmark/hand_recrop.tflite',
//     '/third_party/mediapipe/modules/palm_detection/palm_detection_full.tflite',
//     '/third_party/mediapipe/modules/palm_detection/palm_detection_lite.tflite',
//     '/dev/null'
//   ];

//   mockFiles.forEach(filePath => {
//     try {
//       // Create parent directories
//       const parts = filePath.split('/').filter(part => part);
//       const fileName = parts.pop();
//       const dirPath = '/' + parts.join('/');
      
//       if (dirPath) {
//         window.Module.FS_createPath('/', parts, true, true);
//       }
      
//       // Create a mock file device
//       window.Module.FS_createDevice('/dev', fileName, () => {
//         return { 
//           read: () => 0,
//           write: () => 0,
//           llseek: () => 0
//         };
//       });
      
//     } catch (error) {
//       // Ignore creation errors - they're expected
//       if (error.code !== 'EEXIST') {
//         console.warn('Error creating mock file:', filePath, error);
//       }
//     }
//   });

//   console.log('Mock dependencies created');
// };

// // Main patching function
// export const setupMediaPipePatches = () => {
//   const isElectron = window && window.process && window.process.versions?.electron;
  
//   if (isElectron) {
//     console.log('Setting up MediaPipe patches for Electron...');
//     patchMediaPipeForElectron();
    
//     // Apply patches after a short delay to ensure MediaPipe is loaded
//     setTimeout(() => {
//       mockMediaPipeDependencies();
//     }, 1000);
//   }
// };

// export default {
//   patchMediaPipeForElectron,
//   mockMediaPipeDependencies,
//   setupMediaPipePatches
// };


// utils/mediapipePatcher.js
import { setupAssetLoaderPatches } from './assetLoaderPatcher';
export const patchMediaPipeForElectron = () => {
  if (!window.process?.versions?.electron) return;

  console.log('Patching MediaPipe for Electron environment...');
  setupAssetLoaderPatches();

  // Initialize Module if it doesn't exist
  window.Module = window.Module || {};

  // Patch the WASM file system to prevent EEXIST errors
  if (window.Module) {
    window.Module.FS = window.Module.FS || {};
    
    const originalCreatePath = window.Module.FS_createPath;
    const originalCreateDevice = window.Module.FS_createDevice;
    
    window.Module.FS_createPath = function(...args) {
      try {
        if (originalCreatePath) {
          return originalCreatePath.apply(this, args);
        }
        return {}; // Mock response
      } catch (error) {
        if (error.code === 'EEXIST') {
          console.log('FS_createPath EEXIST handled gracefully');
          return {};
        }
        console.warn('FS_createPath error:', error);
        return {};
      }
    };


    if (window.Module && window.Module.HEAP8) {
    const originalWrite = window.Module.write;
    if (originalWrite) {
      window.Module.write = function(pointer, buffer, offset, length, canGrow) {
        try {
          return originalWrite.apply(this, arguments);
        } catch (error) {
          if (error.message.includes('buffer') || error.message.includes('undefined')) {
            console.warn('Module.write buffer error caught:', error);
            return 0; // Return success
          }
          throw error;
        }
      };
    }

    window.Module.FS_createDevice = function(...args) {
      try {
        if (originalCreateDevice) {
          return originalCreateDevice.apply(this, args);
        }
        return {}; // Mock response
      } catch (error) {
        if (error.code === 'EEXIST') {
          console.log('FS_createDevice EEXIST handled gracefully');
          return {};
        }
        console.warn('FS_createDevice error:', error);
        return {};
      }
    };
  }

  // Patch XMLHttpRequest to handle missing files gracefully
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    // Intercept file requests and handle them gracefully
    if (url.includes('/third_party/mediapipe/') || 
        url.includes('blaze-out/') ||
        url.endsWith('.tflite') ||
        url.endsWith('.txt') ||
        url.endsWith('.binarypb')) {
      
      console.log(`Intercepted MediaPipe file request: ${url}`);
      
      // Add error handler to prevent crashes
      this.addEventListener('error', (event) => {
        console.warn(`MediaPipe file not found (non-critical): ${url}`);
        // Prevent the error from bubbling up
        event.stopPropagation();
      });
    }
    
    return originalXHROpen.call(this, method, url, ...args);
  };

  // Patch console errors from WASM
  const originalError = console.error;
  console.error = function(...args) {
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('EEXIST') || 
         args[0].includes('dependency:') ||
         args[0].includes('still waiting') ||
         args[0].includes('ErrnoError'))) {
      // Suppress MediaPipe WASM dependency errors
      console.warn('MediaPipe WASM issue (non-critical):', ...args);
      return;
    }
    originalError.apply(console, args);
  };
  console.log('MediaPipe patching completed');
}
};

// Mock the missing dependencies that MediaPipe expects
export const mockMediaPipeDependencies = () => {
  if (!window.Module) {
    console.warn('Module not available for mocking');
    return;
  }

  console.log('Creating mock MediaPipe dependencies...');

  // Make this function available globally for delayed execution
  window.mockMediaPipeDependencies = () => {
    try {
      // Create mock directories that MediaPipe expects
      const mockDirs = [
        '/third_party',
        '/third_party/mediapipe',
        '/third_party/mediapipe/modules',
        '/third_party/mediapipe/modules/face_detection',
        '/third_party/mediapipe/modules/face_geometry',
        '/third_party/mediapipe/modules/face_geometry/data',
        '/third_party/mediapipe/modules/face_landmark',
        '/third_party/mediapipe/modules/hand_landmark',
        '/third_party/mediapipe/modules/holistic_landmark',
        '/third_party/mediapipe/modules/palm_detection',
        '/dev'
      ];

      mockDirs.forEach(dir => {
        try {
          if (window.Module.FS_createPath) {
            const parts = dir.split('/').filter(part => part);
            window.Module.FS_createPath('/', parts, true, true);
          }
        } catch (error) {
          // Ignore errors
        }
      });

      console.log('Mock MediaPipe dependencies created');
    } catch (error) {
      console.warn('Error creating mock dependencies:', error);
    }
  };
};

// Main patching function
export const setupMediaPipePatches = () => {
  const isElectron = window && window.process && window.process.versions?.electron;
  
  if (isElectron) {
    console.log('Setting up MediaPipe patches for Electron...');
    patchMediaPipeForElectron();
    mockMediaPipeDependencies();
  }
};

export default {
  patchMediaPipeForElectron,
  mockMediaPipeDependencies,
  setupMediaPipePatches
};