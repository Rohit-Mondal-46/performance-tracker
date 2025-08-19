// // faceUtils.js
// // Draw face, pose, and hands landmarks on canvas

// /**
//  * Draw MediaPipe Holistic results on canvas
//  * @param {Object} results Holistic results
//  * @param {CanvasRenderingContext2D} ctx Canvas context
//  */
// export const drawResults = (results, ctx) => {
//   if (!results || !ctx) return;

//   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

//   // Draw pose
//   if (results.poseLandmarks) drawPose(results.poseLandmarks, ctx);

//   // Draw hands
//   if (results.leftHandLandmarks) drawHand(results.leftHandLandmarks, ctx, 'red');
//   if (results.rightHandLandmarks) drawHand(results.rightHandLandmarks, ctx, 'blue');

//   // Draw face
//   if (results.faceLandmarks) drawFace(results.faceLandmarks, ctx);
// };

// // --- Helper functions ---

// const drawLandmarks = (landmarks, ctx, color = 'lime', radius = 2) => {
//   landmarks.forEach((lm) => {
//     ctx.beginPath();
//     ctx.arc(lm.x * ctx.canvas.width, lm.y * ctx.canvas.height, radius, 0, 2 * Math.PI);
//     ctx.fillStyle = color;
//     ctx.fill();
//   });
// };

// // Draw Pose
// const drawPose = (poseLandmarks, ctx) => {
//   drawLandmarks(poseLandmarks, ctx, 'yellow', 3);

//   // Draw lines between key joints (simplified skeleton)
//   const connections = [
//     [11, 13], // left arm
//     [13, 15],
//     [12, 14], // right arm
//     [14, 16],
//     [11, 12], // shoulders
//     [23, 24], // hips
//     [11, 23], // left side
//     [12, 24], // right side
//     [23, 25], [25, 27], // left leg
//     [24, 26], [26, 28], // right leg
//   ];

//   ctx.strokeStyle = 'yellow';
//   ctx.lineWidth = 2;

//   connections.forEach(([start, end]) => {
//     const p1 = poseLandmarks[start];
//     const p2 = poseLandmarks[end];
//     ctx.beginPath();
//     ctx.moveTo(p1.x * ctx.canvas.width, p1.y * ctx.canvas.height);
//     ctx.lineTo(p2.x * ctx.canvas.width, p2.y * ctx.canvas.height);
//     ctx.stroke();
//   });
// };

// // Draw hand landmarks
// const drawHand = (handLandmarks, ctx, color = 'red') => {
//   drawLandmarks(handLandmarks, ctx, color, 3);

//   // Connect fingers
//   const connections = [
//     [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
//     [0, 5], [5, 6], [6, 7], [7, 8], // Index
//     [0, 9], [9, 10], [10, 11], [11, 12], // Middle
//     [0, 13], [13, 14], [14, 15], [15, 16], // Ring
//     [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
//   ];

//   ctx.strokeStyle = color;
//   ctx.lineWidth = 2;

//   connections.forEach(([start, end]) => {
//     const p1 = handLandmarks[start];
//     const p2 = handLandmarks[end];
//     ctx.beginPath();
//     ctx.moveTo(p1.x * ctx.canvas.width, p1.y * ctx.canvas.height);
//     ctx.lineTo(p2.x * ctx.canvas.width, p2.y * ctx.canvas.height);
//     ctx.stroke();
//   });
// };

// // Draw face landmarks
// const drawFace = (faceLandmarks, ctx) => {
//   drawLandmarks(faceLandmarks, ctx, 'lime', 1.5);
// };


// faceUtils.js
// Enhanced drawing utilities for MediaPipe Holistic results

/**
 * Draw MediaPipe Holistic results on canvas with improved visualization
 * @param {Object} results Holistic results
 * @param {CanvasRenderingContext2D} ctx Canvas context
 * @param {Object} options Drawing options
 */
export const drawResults = (results, ctx, options = {}) => {
  if (!results || !ctx) return;

  const {
    drawPose = true,
    drawHands = true,
    drawFace = true,
    drawConnections = true,
    drawLandmarks = true,
    drawBoundingBoxes = false,
    drawActivityZones = false,
    smoothDrawing = true
  } = options;

  // Clear canvas with optional fade effect for smooth drawing
  if (smoothDrawing) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } else {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  // Draw pose
  if (drawPose && results.poseLandmarks) {
    drawPoseLandmarks(results.poseLandmarks, ctx, drawConnections, drawLandmarks);
  }

  // Draw hands
  if (drawHands) {
    if (results.leftHandLandmarks) {
      drawHandLandmarks(results.leftHandLandmarks, ctx, 'red', drawConnections, drawLandmarks);
    }
    if (results.rightHandLandmarks) {
      drawHandLandmarks(results.rightHandLandmarks, ctx, 'blue', drawConnections, drawLandmarks);
    }
  }

  // Draw face
  if (drawFace && results.faceLandmarks) {
    drawFaceLandmarks(results.faceLandmarks, ctx, drawConnections, drawLandmarks);
  }

  // Draw bounding boxes (optional)
  if (drawBoundingBoxes) {
    if (results.poseLandmarks) drawBoundingBox(results.poseLandmarks, ctx, 'yellow');
    if (results.leftHandLandmarks) drawBoundingBox(results.leftHandLandmarks, ctx, 'red');
    if (results.rightHandLandmarks) drawBoundingBox(results.rightHandLandmarks, ctx, 'blue');
  }

  // Draw activity zones (optional)
  if (drawActivityZones && results.poseLandmarks) {
    drawActivityZones(results.poseLandmarks, ctx);
  }
};

// --- Drawing Configuration ---
const CONFIG = {
  pose: {
    color: '#FFD700', // Gold
    radius: 4,
    lineWidth: 3
  },
  leftHand: {
    color: '#FF4444', // Red
    radius: 3,
    lineWidth: 2
  },
  rightHand: {
    color: '#4444FF', // Blue
    radius: 3,
    lineWidth: 2
  },
  face: {
    color: '#00FF00', // Green
    radius: 1.5,
    lineWidth: 1
  },
  boundingBox: {
    color: 'rgba(255, 255, 255, 0.3)',
    lineWidth: 1
  }
};

// --- Helper functions ---

/**
 * Convert normalized coordinates to canvas coordinates
 */
const toCanvasCoords = (point, canvas) => ({
  x: point.x * canvas.width,
  y: point.y * canvas.height,
  z: point.z // Keep z for depth effects if needed
});

/**
 * Draw landmarks with optional connections
 */
const drawLandmarksWithConnections = (landmarks, ctx, color, radius, connections) => {
  if (!landmarks || landmarks.length === 0) return;

  // Draw landmarks
  landmarks.forEach((lm) => {
    const point = toCanvasCoords(lm, ctx.canvas);
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Add depth effect (darker for farther points)
    if (lm.z !== undefined) {
      const depth = Math.max(0, 1 - Math.abs(lm.z) * 2);
      ctx.shadowBlur = 5 * depth;
      ctx.shadowColor = color;
    }
  });

  // Draw connections
  if (connections && connections.length > 0) {
    ctx.strokeStyle = color;
    ctx.lineWidth = CONFIG.pose.lineWidth;

    connections.forEach(([start, end]) => {
      if (landmarks[start] && landmarks[end]) {
        const p1 = toCanvasCoords(landmarks[start], ctx.canvas);
        const p2 = toCanvasCoords(landmarks[end], ctx.canvas);
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });
  }
};

// --- Pose Drawing ---
const POSE_CONNECTIONS = [
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 12], // shoulders
  [11, 23], [12, 24], // torso
  [23, 24], // hips
  [23, 25], [25, 27], // left leg
  [24, 26], [26, 28], // right leg
  [0, 1], [1, 2], [2, 3], [3, 7], // face outline
  [0, 4], [4, 5], [5, 6], [6, 8] // face outline
];

const drawPoseLandmarks = (landmarks, ctx, drawConnections, drawPoints) => {
  if (drawPoints) {
    drawLandmarksWithConnections(
      landmarks,
      ctx,
      CONFIG.pose.color,
      CONFIG.pose.radius,
      drawConnections ? POSE_CONNECTIONS : null
    );
  }

  // Draw important joints with larger dots
  const importantJoints = [0, 11, 12, 13, 14, 15, 16, 23, 24]; // nose, shoulders, elbows, wrists, hips
  importantJoints.forEach(idx => {
    if (landmarks[idx]) {
      const point = toCanvasCoords(landmarks[idx], ctx.canvas);
      ctx.beginPath();
      ctx.arc(point.x, point.y, CONFIG.pose.radius + 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#FF6B00'; // Orange for important joints
      ctx.fill();
    }
  });
};

// --- Hand Drawing ---
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // index
  [0, 9], [9, 10], [10, 11], [11, 12], // middle
  [0, 13], [13, 14], [14, 15], [15, 16], // ring
  [0, 17], [17, 18], [18, 19], [19, 20], // pinky
  [5, 9], [9, 13], [13, 17] // palm
];

const drawHandLandmarks = (landmarks, ctx, baseColor, drawConnections, drawPoints) => {
  const config = baseColor === 'red' ? CONFIG.leftHand : CONFIG.rightHand;
  
  if (drawPoints) {
    drawLandmarksWithConnections(
      landmarks,
      ctx,
      config.color,
      config.radius,
      drawConnections ? HAND_CONNECTIONS : null
    );
  }

  // Draw palm center
  if (landmarks.length >= 21) {
    const palmPoints = [0, 5, 9, 13, 17]; // wrist and finger bases
    let centerX = 0, centerY = 0;
    
    palmPoints.forEach(idx => {
      centerX += landmarks[idx].x;
      centerY += landmarks[idx].y;
    });
    
    centerX /= palmPoints.length;
    centerY /= palmPoints.length;
    
    const point = toCanvasCoords({ x: centerX, y: centerY }, ctx.canvas);
    ctx.beginPath();
    ctx.arc(point.x, point.y, config.radius + 1, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF'; // White for palm center
    ctx.fill();
  }
};

// --- Face Drawing ---
const FACE_CONNECTIONS = [
  // Face outline
  [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389], [389, 356], [356, 454],
  [454, 323], [323, 361], [361, 288], [288, 397], [397, 365], [365, 379], [379, 378], [378, 400],
  [400, 377], [377, 152], [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172],
  [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162], [162, 21], [21, 54],
  [54, 103], [103, 67], [67, 109], [109, 10]
];

const drawFaceLandmarks = (landmarks, ctx, drawConnections, drawPoints) => {
  if (drawPoints) {
    // Only draw key facial points for performance
    const keyPoints = landmarks.filter((_, index) => index % 4 === 0); // Sample every 4th point
    drawLandmarksWithConnections(
      keyPoints,
      ctx,
      CONFIG.face.color,
      CONFIG.face.radius,
      drawConnections ? FACE_CONNECTIONS : null
    );
  }

  // Draw eyes and mouth more prominently
  const eyeLeft = landmarks[33];  // Left eye
  const eyeRight = landmarks[263]; // Right eye
  const mouth = landmarks[13];    // Mouth center

  [eyeLeft, eyeRight, mouth].forEach(point => {
    if (point) {
      const canvasPoint = toCanvasCoords(point, ctx.canvas);
      ctx.beginPath();
      ctx.arc(canvasPoint.x, canvasPoint.y, CONFIG.face.radius + 1, 0, 2 * Math.PI);
      ctx.fillStyle = '#00FFFF'; // Cyan for important face points
      ctx.fill();
    }
  });
};

// --- Bounding Box Drawing ---
const drawBoundingBox = (landmarks, ctx, color) => {
  if (!landmarks || landmarks.length === 0) return;

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  landmarks.forEach(lm => {
    minX = Math.min(minX, lm.x);
    minY = Math.min(minY, lm.y);
    maxX = Math.max(maxX, lm.x);
    maxY = Math.max(maxY, lm.y);
  });

  const padding = 0.05; // 5% padding
  const width = (maxX - minX) * ctx.canvas.width;
  const height = (maxY - minY) * ctx.canvas.height;
  const x = (minX - padding) * ctx.canvas.width;
  const y = (minY - padding) * ctx.canvas.height;

  ctx.strokeStyle = color;
  ctx.lineWidth = CONFIG.boundingBox.lineWidth;
  ctx.strokeRect(x, y, width + padding * 2 * ctx.canvas.width, height + padding * 2 * ctx.canvas.height);
};

// --- Activity Zones Drawing ---
const drawActivityZones = (poseLandmarks, ctx) => {
  if (!poseLandmarks[11] || !poseLandmarks[12]) return; // Need shoulders

  // Draw typing zone (around chest level)
  const leftShoulder = toCanvasCoords(poseLandmarks[11], ctx.canvas);
  const rightShoulder = toCanvasCoords(poseLandmarks[12], ctx.canvas);
  const chestY = (leftShoulder.y + rightShoulder.y) / 2;

  ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(0, chestY, ctx.canvas.width, 100);
  ctx.setLineDash([]);

  // Draw phone usage zone (near face)
  if (poseLandmarks[0]) { // Nose
    const nose = toCanvasCoords(poseLandmarks[0], ctx.canvas);
    ctx.beginPath();
    ctx.arc(nose.x, nose.y, 80, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
};

// --- Utility Functions ---

/**
 * Clear canvas with optional fade effect
 */
export const clearCanvas = (ctx, fade = false) => {
  if (fade) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } else {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
};

/**
 * Draw text on canvas
 */
export const drawText = (ctx, text, x, y, color = 'white', size = 16) => {
  ctx.font = `${size}px Arial`;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
};

/**
 * Draw FPS counter
 */
export const drawFPS = (ctx, fps, x = 10, y = 20) => {
  ctx.font = '14px Arial';
  ctx.fillStyle = fps > 30 ? 'green' : fps > 15 ? 'orange' : 'red';
  ctx.fillText(`FPS: ${fps.toFixed(1)}`, x, y);
};

// Default export for backward compatibility
export default { drawResults, clearCanvas, drawText, drawFPS };