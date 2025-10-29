// utils/mediapipeBypass.js
export const bypassHandsInitialization = () => {
  if (!window.process?.versions?.electron) return;

  console.log('Bypassing Hands initialization...');

  // Completely override the Hands constructor to prevent initialization
  if (window.Hands) {
    const OriginalHands = window.Hands;
    
    window.Hands = function(...args) {
      const instance = new OriginalHands(...args);
      
      // Override the initialize method to prevent actual initialization
      const originalInitialize = instance.initialize;
      instance.initialize = async function() {
        console.log('Hands initialization bypassed');
        // Return a mock successful initialization
        return Promise.resolve();
      };
      
      // Override send method to prevent frame processing
      const originalSend = instance.send;
      instance.send = async function() {
        console.log('Hands frame processing bypassed');
        return Promise.resolve();
      };
      
      return instance;
    };

    // Copy static properties
    Object.assign(window.Hands, OriginalHands);
  }

  // Patch the specific asset loader that's causing issues
  if (window.runWithFS) {
    const originalRunWithFS = window.runWithFS;
    window.runWithFS = function(...args) {
      // Check if this is a hands-related operation
      if (args[0] && typeof args[0] === 'function') {
        const funcString = args[0].toString();
        if (funcString.includes('hands') || funcString.includes('Hands')) {
          console.log('Bypassing hands file system operation');
          return Promise.resolve();
        }
      }
      return originalRunWithFS.apply(this, args);
    };
  }
};

// Completely disable hands asset loading
export const disableHandsAssets = () => {
  // Store reference to the problematic asset loader
  const originalProcessPackageData = window.processPackageData;
  
  if (originalProcessPackageData) {
    window.processPackageData = function(packageData, packageName, packageSize, callback) {
      // Check if this is hands assets and bypass
      if (packageName && packageName.includes('hands')) {
        console.log('Bypassing hands asset loading:', packageName);
        if (typeof callback === 'function') {
          callback({});
        }
        return;
      }
      return originalProcessPackageData.apply(this, arguments);
    };
  }

  // Patch XMLHttpRequest specifically for hands assets
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (url && url.includes('hands_solution_packed_assets')) {
      console.log('Blocking hands asset request:', url);
      
      // Completely prevent the request
      this._blocked = true;
      this.addEventListener('load', () => {
        console.log('Hands asset load prevented');
      }, true);
      
      return;
    }
    return originalXHROpen.apply(this, [method, url, ...args]);
  };

  const originalXHRSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(...args) {
    if (this._blocked) {
      console.log('Blocked hands asset request');
      return;
    }
    return originalXHRSend.apply(this, args);
  };
};

export const setupMediaPipeBypass = () => {
  if (!window.process?.versions?.electron) return;

  console.log('Setting up MediaPipe bypass system...');
  bypassHandsInitialization();
  disableHandsAssets();
};

// Make available globally
window.setupMediaPipeBypass = setupMediaPipeBypass;



//isise implement krna tha from deepseek chat