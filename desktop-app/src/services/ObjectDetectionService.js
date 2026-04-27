
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
    
    // Prepare image data for IPC - ensure it's a plain array
    const imageData = {
      tensorData: Array.isArray(tensor.data) ? tensor.data : Array.from(tensor.data),
      width: canvas.width,
      height: canvas.height
    };
    
    console.log('📤 Sending data to main process for inference...');
    console.log('   - Tensor data length:', imageData.tensorData.length);
    console.log('   - Canvas size:', imageData.width, 'x', imageData.height);
    
    const result = await api.detect(imageData);

    if (!result.success) {
      throw new Error(result.error || 'Inference failed via IPC');
    }

    console.log('📥 Received detection result from main process');
    console.log('   - Output data length:', result.output?.data?.length);
    console.log('   - Output dims:', result.output?.dims);

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

    console.log('✅ Post-processing complete:', detections.length, 'detections found');

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
    console.log('🔄 Post-processing detections...');
    console.log('   - Original size:', originalWidth, 'x', originalHeight);
    console.log('   - Confidence threshold:', confidenceThreshold);
    console.log('   - IoU threshold:', iouThreshold);
    
    const predictions = outputs.output0.data;
    const dims = outputs.output0.dims;
    
    console.log('   - Output dimensions:', dims);
    
    // YOLOv8 output format: [batch, features, detections]
    // e.g., [1, 5, 8400] for single-class or [1, 5+num_classes, 8400] for multi-class
    let batchSize, numFeatures, numDetections;
    
    if (dims.length === 3) {
      [batchSize, numFeatures, numDetections] = dims;
    } else if (dims.length === 2) {
      // Fallback for [features, detections] format
      batchSize = 1;
      [numFeatures, numDetections] = dims;
    } else {
      console.error('Unexpected output dimensions:', dims);
      return [];
    }
    
    console.log('   - Batch size:', batchSize);
    console.log('   - Features per detection:', numFeatures);
    console.log('   - Number of detections to check:', numDetections);
    
    const detections = [];
    const numClasses = numFeatures - 5; // First 5 are [x, y, w, h, confidence]
    const isSingleClass = numClasses === 0; // Single-class model (only objectness score)
    
    console.log('   - Number of classes:', numClasses);
    console.log('   - Single-class model:', isSingleClass);
    
    // Sample ALL feature values to find where confidence scores actually are
    // Diagnostic: Sample both possible data layouts
    console.log('   - 🔍 DATA LAYOUT DIAGNOSTIC:');
    console.log('   - First 10 raw values:', predictions.slice(0, 10).map(v => v.toFixed(4)));
    console.log('   - Values at positions 8400-8409:', predictions.slice(8400, 8410).map(v => v.toFixed(4)));
    
    console.log('   - 📊 LAYOUT A: [features, detections] - Row-major [5, 8400]');
    console.log('     Detection 0: x=' + predictions[0].toFixed(4) + ' y=' + predictions[8400].toFixed(4) + 
                ' w=' + predictions[16800].toFixed(4) + ' h=' + predictions[25200].toFixed(4) + ' conf=' + predictions[33600].toFixed(4));
    console.log('     Detection 1: x=' + predictions[1].toFixed(4) + ' y=' + predictions[8401].toFixed(4) + 
                ' w=' + predictions[16801].toFixed(4) + ' h=' + predictions[25201].toFixed(4) + ' conf=' + predictions[33601].toFixed(4));
    
    console.log('   - 📊 LAYOUT B: [detections, features] - Transposed [8400, 5]');
    console.log('     Detection 0: x=' + predictions[0].toFixed(4) + ' y=' + predictions[1].toFixed(4) + 
                ' w=' + predictions[2].toFixed(4) + ' h=' + predictions[3].toFixed(4) + ' conf=' + predictions[4].toFixed(4));
    console.log('     Detection 1: x=' + predictions[5].toFixed(4) + ' y=' + predictions[6].toFixed(4) + 
                ' w=' + predictions[7].toFixed(4) + ' h=' + predictions[8].toFixed(4) + ' conf=' + predictions[9].toFixed(4));
    
    // Count high confidence values in BOTH layouts
    let highConfCountA = 0, highConfCountB = 0;
    let maxConfA = 0, maxConfB = 0;
    for (let i = 0; i < numDetections; i++) {
      const confA = predictions[4 * numDetections + i]; // Layout A
      const confB = predictions[i * numFeatures + 4];    // Layout B
      if (confA >= confidenceThreshold) highConfCountA++;
      if (confB >= confidenceThreshold) highConfCountB++;
      maxConfA = Math.max(maxConfA, confA);
      maxConfB = Math.max(maxConfB, confB);
    }
    console.log('   - High confidence (>=' + confidenceThreshold + ') count in Layout A:', highConfCountA);
    console.log('   - High confidence (>=' + confidenceThreshold + ') count in Layout B:', highConfCountB);
    console.log('   - Max confidence in Layout A:', maxConfA.toFixed(4));
    console.log('   - Max confidence in Layout B:', maxConfB.toFixed(4));
    
    // ONNX uses row-major ordering: [1, 5, 8400] means Layout A is correct
    // Layout A: features are contiguous - predictions[feature*8400 + detection]
    const useLayoutA = true;  // Force correct ONNX layout
    console.log('   - ✅ Using Layout A [features, detections] - ONNX row-major format');
    
    if (maxConfA < 0.01) {
      console.log('   - ⚠️ WARNING: Model confidence extremely low (max=' + maxConfA.toFixed(4) + ')');
      console.log('   - Possible issues: bad input preprocessing, wrong model, or model needs retraining');
    }
    
    // Process detections based on detected layout
    let passedThresholdCount = 0;
    for (let i = 0; i < numDetections; i++) {
      let x_center, y_center, width, height, confidence;
      
      if (useLayoutA) {
        // Layout A: [features, detections] - predictions[feature * numDetections + detection]
        x_center = predictions[0 * numDetections + i];
        y_center = predictions[1 * numDetections + i];
        width = predictions[2 * numDetections + i];
        height = predictions[3 * numDetections + i];
        confidence = predictions[4 * numDetections + i];
      } else {
        // Layout B: [detections, features] - predictions[detection * numFeatures + feature]
        const offset = i * numFeatures;
        x_center = predictions[offset + 0];
        y_center = predictions[offset + 1];
        width = predictions[offset + 2];
        height = predictions[offset + 3];
        confidence = predictions[offset + 4];
      }
      
      if (confidence >= confidenceThreshold) {
        passedThresholdCount++;
      }
      
      if (confidence < confidenceThreshold) continue;
      
      // For single-class model, confidence is the final score
      const finalConfidence = confidence;
      const classId = 0;
      const className = 'phone';
      
      // Convert normalized coordinates to pixel coordinates
      const x_center_px = x_center * originalWidth;
      const y_center_px = y_center * originalHeight;
      const width_px = width * originalWidth;
      const height_px = height * originalHeight;
      
      detections.push({
        bbox: [
          x_center_px - width_px / 2,  // x1
          y_center_px - height_px / 2, // y1
          x_center_px + width_px / 2,  // x2
          y_center_px + height_px / 2  // y2
        ],
        confidence: finalConfidence,
        class: classId,
        class_name: className
      });
    }
    
    console.log('   - Detections passed confidence threshold:', passedThresholdCount);
    console.log('   - Detections after filtering:', detections.length);
    
    if (detections.length > 0) {
      console.log('   - Sample detection:', detections[0]);
    }
    
    // Apply Non-Maximum Suppression
    const finalDetections = nonMaximumSuppression(detections, iouThreshold);
    console.log('   - Final detections after NMS:', finalDetections.length);
    
    return finalDetections;
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