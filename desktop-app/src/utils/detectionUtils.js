export function nonMaximumSuppression(detections, iouThreshold = 0.5) {
  if (detections.length === 0) return [];
  
  // Sort by confidence
  detections.sort((a, b) => b.confidence - a.confidence);
  
  const selected = [];
  
  while (detections.length > 0) {
    const current = detections[0];
    selected.push(current);
    
    detections = detections.slice(1).filter(det => {
      const iou = calculateIOU(current.bbox, det.bbox);
      return iou < iouThreshold;
    });
  }
  
  return selected;
}

export function calculateIOU(box1, box2) {
  const [x1, y1, x2, y2] = box1;
  const [x1g, y1g, x2g, y2g] = box2;
  
  const xmin = Math.max(x1, x1g);
  const ymin = Math.max(y1, y1g);
  const xmax = Math.min(x2, x2g);
  const ymax = Math.min(y2, y2g);
  
  if (xmax <= xmin || ymax <= ymin) return 0;
  
  const intersection = (xmax - xmin) * (ymax - ymin);
  const area1 = (x2 - x1) * (y2 - y1);
  const area2 = (x2g - x1g) * (y2g - y1g);
  const union = area1 + area2 - intersection;
  
  return intersection / union;
}