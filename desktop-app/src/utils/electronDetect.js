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

export const logEnvironment = () => {
  console.log('=== ENVIRONMENT CHECK ===');
  console.log('Is Electron:', isElectron());
  console.log('window.electron available:', !!window.electron);
  console.log('User Agent:', navigator.userAgent);
  
  if (isElectron()) {
    console.log('✅ Running in Electron');
    console.log('Electron API:', window.electron);
  } else {
    console.log('🌐 Running in Web Browser');
  }
  console.log('========================');
};
