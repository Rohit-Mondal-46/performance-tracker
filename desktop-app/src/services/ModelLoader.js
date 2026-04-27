
// src/services/ModelLoader.js

class ModelLoader {
  constructor() {
    this.config = null;
    this.classes = ['phone']; // Default, will be updated from main process
  }

  async loadModel() {
    try {
      if (!window.electronAPI) {
        throw new Error("electronAPI is not available. Is the preload script correct?");
      }

      console.log('Requesting model load from main process...');
      const result = await window.electronAPI.model.load();
      
      if (result.success) {
        this.config = result.config;
        this.classes = result.config.classes;
        console.log('Model loaded successfully via IPC');
        return true;
      } else {
        console.error('Failed to load model via IPC:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error calling model:load via IPC:', error);
      return false;
    }
  }

  getModelInfo() {
    return {
      name: this.config?.model || 'YOLOv8',
      inputSize: this.config?.inputSize || 640,
      classes: this.classes,
      confidence: this.config?.confidenceThreshold || 0.25,
      iou: this.config?.iouThreshold || 0.7
    };
  }

  // This method now returns the API object for IPC communication, not a session
  getSession() {
    if (!window.electronAPI) {
        throw new Error("electronAPI is not available.");
    }
    return window.electronAPI.model;
  }
}

export default new ModelLoader();