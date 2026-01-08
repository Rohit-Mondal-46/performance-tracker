//import * as ort from 'onnxruntime-node';

export async function processImage(imageElement, targetSize = 640) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Maintain aspect ratio
  const { width, height } = calculateAspectRatioFit(
    imageElement.width,
    imageElement.height,
    targetSize,
    targetSize
  );
  
  canvas.width = targetSize;
  canvas.height = targetSize;
  
  // Draw image centered on canvas
  const offsetX = (targetSize - width) / 2;
  const offsetY = (targetSize - height) / 2;
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, targetSize, targetSize);
  ctx.drawImage(imageElement, offsetX, offsetY, width, height);
  
  // Convert to tensor
  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const tensor = await imageDataToTensor(imageData, targetSize);
  
  return { tensor, ctx: canvas.getContext('2d'), canvas, offsetX, offsetY, scale: width / imageElement.width };
}

export function drawDetections(ctx, detections, classes, options = {}) {
  const { 
    lineWidth = 2,
    fontSize = 14,
    fontFamily = 'Arial',
    colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']
  } = options;
  
  detections.forEach(det => {
    const [x1, y1, x2, y2] = det.bbox;
    const color = colors[det.class % colors.length];
    
    // Draw bounding box
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    
    // Draw label background
    const label = `${det.class_name} ${(det.confidence * 100).toFixed(1)}%`;
    ctx.font = `${fontSize}px ${fontFamily}`;
    const textWidth = ctx.measureText(label).width;
    
    ctx.fillStyle = color;
    ctx.fillRect(x1, y1 - fontSize - 4, textWidth + 8, fontSize + 4);
    
    // Draw label text
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(label, x1 + 4, y1 - 4);
  });
}

async function imageDataToTensor(imageData, size) {
  const { data, width, height } = imageData;
  const tensorData = new Float32Array(3 * size * size);
  
  // Normalize and convert RGB
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const idx = (i * width + j) * 4;
      const r = data[idx] / 255.0;
      const g = data[idx + 1] / 255.0;
      const b = data[idx + 2] / 255.0;
      
      // YOLO expects CHW format: [C, H, W]
      tensorData[i * width + j] = r;                    // R channel
      tensorData[size * size + i * width + j] = g;      // G channel
      tensorData[2 * size * size + i * width + j] = b;  // B channel
    }
  }
  
  return new ort.Tensor('float32', tensorData, [1, 3, size, size]);
}

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return {
    width: srcWidth * ratio,
    height: srcHeight * ratio
  };
}