
// src/services/ObjectDetectionService.js
import ModelLoader from './ModelLoader';
import { processImage, drawDetections } from '../utils/imageUtils';
import { nonMaximumSuppression } from '../utils/detectionUtils';

class ObjectDetectionService {
  constructor() {
    this.modelLoader = ModelLoader;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return true;
    
    const loaded = await this.modelLoader.loadModel();
    this.isInitialized = loaded;
    return loaded;
  }

  async detect(imageElement, options = {}) {
    if (!this.isInitialized) {
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        throw new Error("Failed to initialize the detection service.");
      }
    }

    const config = this.modelLoader.getModelInfo();
    const startTime = performance.now();

    // 1. Preprocess image in the renderer
    const { tensor, ctx, canvas } = await processImage(
      imageElement, 
      config.inputSize
    );

    // 2. Run inference via IPC
    const api = this.modelLoader.getSession();
    const imageData = {
      tensorData: tensor.data, // Send the raw Float32Array data
      width: canvas.width,
      height: canvas.height
    };
    
    console.log('Sending data to main process for inference...');
    const result = await api.detect(imageData);

    if (!result.success) {
      throw new Error(result.error || 'Inference failed via IPC');
    }

    // 3. Post-process results in the renderer
    // We need to recreate the output object structure expected by postProcess
    const outputs = { output0: result.output };
    const detections = this.postProcess(
      outputs, 
      result.originalWidth, 
      result.originalHeight,
      options.confidence || config.confidence,
      options.iou || config.iou
    );

    // 4. Draw on canvas (optional)
    if (options.drawOnCanvas) {
      drawDetections(ctx, detections, config.classes);
    }

    return {
      detections,
      processingTime: performance.now() - startTime,
      imageSize: { width: canvas.width, height: canvas.height }
    };
  }

  postProcess(outputs, originalWidth, originalHeight, confidenceThreshold = 0.25, iouThreshold = 0.7) {
    const predictions = outputs.output0.data;
    const [numDetections, numValues] = outputs.output0.dims;
    
    const detections = [];
    
    // YOLOv8 output format: [x_center, y_center, width, height, confidence, class_scores...]
    for (let i = 0; i < numDetections; i++) {
      const offset = i * numValues;
      const confidence = predictions[offset + 4];
      
      if (confidence < confidenceThreshold) continue;
      
      // Find class with highest score
      let maxClassScore = 0;
      let classId = 0;
      
      for (let c = 5; c < numValues; c++) {
        const score = predictions[offset + c];
        if (score > maxClassScore) {
          maxClassScore = score;
          classId = c - 5;
        }
      }
      
      const finalConfidence = confidence * maxClassScore;
      
      if (finalConfidence < confidenceThreshold) continue;
      
      // Convert normalized coordinates to pixel coordinates
      const x_center = predictions[offset] * originalWidth;
      const y_center = predictions[offset + 1] * originalHeight;
      const width = predictions[offset + 2] * originalWidth;
      const height = predictions[offset + 3] * originalHeight;
      
      detections.push({
        bbox: [
          x_center - width / 2,  // x1
          y_center - height / 2, // y1
          x_center + width / 2,  // x2
          y_center + height / 2  // y2
        ],
        confidence: finalConfidence,
        class: classId,
        class_name: this.modelLoader.classes[classId] || `class_${classId}`
      });
    }
    
    // Apply Non-Maximum Suppression
    return nonMaximumSuppression(detections, iouThreshold);
  }

  async detectFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
          try {
            const result = await this.detect(img);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}

export default new ObjectDetectionService();