/**
 * Utility to detect and interact with Electron environment
 */

export const isElectron = () => {
  return typeof window !== 'undefined' && window.electron !== undefined;
};

export const getElectronAPI = () => {
  if (!isElectron()) {
    return null;
  }
  return window.electron;
};
