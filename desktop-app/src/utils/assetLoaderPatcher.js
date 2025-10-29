// utils/assetLoaderPatcher.js
export const patchMediaPipeAssetLoaders = () => {
  if (!window.process?.versions?.electron) return;

  console.log('Patching MediaPipe asset loaders...');

  // Patch the holistic asset loader
  if (window.createModal && window.createModal.assetLoader) {
    const originalLoad = window.createModal.assetLoader.load;
    window.createModal.assetLoader.load = function(...args) {
      try {
        return originalLoad.apply(this, args);
      } catch (error) {
        console.warn('Holistic asset loader error caught:', error);
        // Return a mock successful response
        return Promise.resolve({
          files: [],
          totalSize: 0,
          loaded: true
        });
      }
    };
  }

  // Patch hands asset loader by intercepting the global functions
  const originalRunWithFS = window.runWithFS;
  if (originalRunWithFS) {
    window.runWithFS = function(...args) {
      try {
        return originalRunWithFS.apply(this, args);
      } catch (error) {
        console.warn('runWithFS error caught:', error);
        return Promise.resolve();
      }
    };
  }

  // Patch the specific error in hands_solution_packed_assets_loader.js:58
  const originalCreatePreloadedFile = window.FS_createPreloadedFile;
  if (window.FS && window.FS.createPreloadedFile) {
    const originalCreatePreloadedFile = window.FS.createPreloadedFile;
    window.FS.createPreloadedFile = function(...args) {
      try {
        return originalCreatePreloadedFile.apply(this, args);
      } catch (error) {
        console.warn('FS.createPreloadedFile error caught:', error);
        // Return a mock file object
        return {
          stream: { position: 0 },
          usedBytes: 0
        };
      }
    };
  }

  // Patch XMLHttpRequest progress events that cause "Cannot set properties of undefined"
  const originalXHRSet = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'onprogress')?.set;
  if (originalXHRSet) {
    Object.defineProperty(XMLHttpRequest.prototype, 'onprogress', {
      set: function(callback) {
        try {
          return originalXHRSet.call(this, callback);
        } catch (error) {
          console.warn('XHR onprogress setter error caught:', error);
          // Don't set the callback to prevent further errors
          return undefined;
        }
      },
      get: function() {
        return null;
      },
      configurable: true
    });
  }

  console.log('MediaPipe asset loaders patched');
};

// Patch the specific error at hands_solution_packed_assets_loader.js:58
export const patchHandsAssetLoader = () => {
  // Store reference to the original DataRequest class if it exists
  if (window.DataRequest) {
    const OriginalDataRequest = window.DataRequest;
    window.DataRequest = function(...args) {
      const instance = new OriginalDataRequest(...args);
      
      // Patch the onprogress method
      const originalOnProgress = instance.onprogress;
      instance.onprogress = function(event) {
        try {
          if (originalOnProgress) {
            return originalOnProgress.call(this, event);
          }
        } catch (error) {
          console.warn('DataRequest.onprogress error caught:', error);
          // Prevent the error from propagating
        }
      };
      
      return instance;
    };
  }
};

export const setupAssetLoaderPatches = () => {
  if (!window.process?.versions?.electron) return;

  // Apply patches immediately
  patchMediaPipeAssetLoaders();
  patchHandsAssetLoader();

  // Also patch the specific line that's causing the error
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    if (prop === 'loaded' && obj && obj.constructor && obj.constructor.name === 'DataRequest') {
      try {
        return originalDefineProperty.apply(this, arguments);
      } catch (error) {
        console.warn('Object.defineProperty error caught for DataRequest.loaded:', error);
        // Set the property directly instead
        obj[prop] = descriptor.value;
        return obj;
      }
    }
    return originalDefineProperty.apply(this, arguments);
  };
};

// Make available globally
window.setupAssetLoaderPatches = setupAssetLoaderPatches;