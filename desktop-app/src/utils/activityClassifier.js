
// // activityClassifier.js
// // Classify activity based on MediaPipe Holistic results

// // To track previous hand positions
// let previousLeftWrist = null;
// let previousRightWrist = null;

// // Threshold for movement detection
// const MOVEMENT_THRESHOLD = 0.01;

// /**
//  * Main function to classify activity
//  * @param {Object} results MediaPipe Holistic results
//  * @returns {string} Activity: Typing, Reading, Writing, Idle
//  */
// export const classifyActivity = (results) => {
//   if (!results || !results.poseLandmarks || !results.leftHandLandmarks || !results.rightHandLandmarks) {
//     return 'No Data';
//   }

//   const leftHand = results.leftHandLandmarks;
//   const rightHand = results.rightHandLandmarks;
//   const pose = results.poseLandmarks;

//   // --- TYPING ---
//   const isTyping =
//     isHandNearDesk(leftHand, pose) &&
//     isHandNearDesk(rightHand, pose) &&
//     (isHandMoving(leftHand, 'left') || isHandMoving(rightHand, 'right'));

//   // --- READING ---
//   const isReading =
//     isHandNearHead(leftHand, pose) || isHandNearHead(rightHand, pose);

//   // --- WRITING ---
//   const isWriting =
//     (isHandNearDesk(leftHand, pose) && isHandMoving(rightHand, 'right')) ||
//     (isHandNearDesk(rightHand, pose) && isHandMoving(leftHand, 'left'));

//   // Determine activity
//   if (isTyping) return 'Typing';
//   if (isWriting) return 'Writing';
//   if (isReading) return 'Reading';
//   return 'Idle';
// };

// // --- Helper functions ---

// const distance = (a, b) =>
//   Math.sqrt(
//     (a.x - b.x) ** 2 +
//     (a.y - b.y) ** 2 +
//     (a.z - b.z) ** 2
//   );

// // Hands near desk (y > chest level)
// const isHandNearDesk = (hand, pose) => {
//   if (!hand || !pose) return false;
//   const wrist = hand[0]; // wrist landmark
//   const chest = pose[11]; // chest landmark
//   return wrist.y > chest.y + 0.05; // threshold
// };

// // Hands near head (y < head level)
// const isHandNearHead = (hand, pose) => {
//   if (!hand || !pose) return false;
//   const wrist = hand[0];
//   const head = pose[0]; // nose/top of head
//   return wrist.y < head.y + 0.05;
// };

// // Detect hand movement using previous frame
// const isHandMoving = (hand, side) => {
//   if (!hand) return false;

//   const wrist = hand[0];
//   let prevWrist = side === 'left' ? previousLeftWrist : previousRightWrist;

//   // Update previous wrist
//   if (side === 'left') previousLeftWrist = wrist;
//   else previousRightWrist = wrist;

//   if (!prevWrist) return true; // first frame, assume moving

//   const dist = distance(wrist, prevWrist);
//   return dist > MOVEMENT_THRESHOLD;
// };




// src/utils/activityClassifier.js

// State tracking for smooth transitions
let activityHistory = [];
const HISTORY_LENGTH = 10;
let confidenceScores = {
  typing: 0,
  writing: 0,
  reading: 0,
  phone: 0,
  meeting: 0,
  presenting: 0,
  idle: 0
};

// Thresholds and constants
const MOVEMENT_THRESHOLD = 0.008;
const CONFIDENCE_THRESHOLD = 0.6;
const STABILITY_THRESHOLD = 0.7;

/**
 * Main function to classify activity with improved accuracy
 * @param {Object} results MediaPipe Holistic results
 * @returns {string} Activity type
 */
export const classifyActivity = (results) => {
  if (!results || !results.poseLandmarks) {
    return 'No Data';
  }

  const pose = results.poseLandmarks;
  const leftHand = results.leftHandLandmarks || [];
  const rightHand = results.rightHandLandmarks || [];
  const face = results.faceLandmarks || [];

  // Calculate confidence scores for each activity
  const scores = {
    typing: calculateTypingConfidence(leftHand, rightHand, pose),
    writing: calculateWritingConfidence(leftHand, rightHand, pose),
    reading: calculateReadingConfidence(leftHand, rightHand, pose, face),
    phone: calculatePhoneConfidence(leftHand, rightHand, pose, face),
    meeting: calculateMeetingConfidence(pose, face),
    presenting: calculatePresentingConfidence(pose, leftHand, rightHand),
    idle: calculateIdleConfidence(leftHand, rightHand, pose)
  };

  // Update confidence scores with smoothing
  Object.keys(scores).forEach(activity => {
    confidenceScores[activity] = 
      (confidenceScores[activity] * 0.7) + (scores[activity] * 0.3);
  });

  // Get the activity with highest confidence
  let bestActivity = 'idle';
  let highestScore = 0;

  Object.entries(confidenceScores).forEach(([activity, score]) => {
    if (score > highestScore) {
      highestScore = score;
      bestActivity = activity;
    }
  });

  // Apply threshold - if no activity meets confidence, stay with previous
  if (highestScore < CONFIDENCE_THRESHOLD && activityHistory.length > 0) {
    bestActivity = activityHistory[activityHistory.length - 1];
  }

  // Update history
  activityHistory.push(bestActivity);
  if (activityHistory.length > HISTORY_LENGTH) {
    activityHistory.shift();
  }

  // Ensure stability (avoid rapid switching)
  if (!isActivityStable(bestActivity)) {
    bestActivity = getMostCommonActivity();
  }

  return bestActivity;
};

/**
 * Calculate confidence for typing activity
 */
const calculateTypingConfidence = (leftHand, rightHand, pose) => {
  if (leftHand.length === 0 || rightHand.length === 0) return 0;

  const leftWrist = leftHand[0];
  const rightWrist = rightHand[0];
  const shoulders = getShoulders(pose);

  // Hands should be near keyboard position (below shoulders, above waist)
  const handsPositionScore = calculateHandsPositionScore(leftWrist, rightWrist, shoulders);
  
  // Both hands should be moving slightly (typing motion)
  const movementScore = calculateTypingMovementScore(leftHand, rightHand);
  
  // Posture should be upright
  const postureScore = calculateUprightPostureScore(pose);

  return (handsPositionScore * 0.4) + (movementScore * 0.4) + (postureScore * 0.2);
};

/**
 * Calculate confidence for writing activity
 */
const calculateWritingConfidence = (leftHand, rightHand, pose) => {
  if (rightHand.length === 0) return 0;

  const rightWrist = rightHand[0];
  const shoulders = getShoulders(pose);

  // Writing hand should be on desk, other hand may be holding paper
  const writingPositionScore = Math.max(
    isHandInWritingPosition(rightWrist, shoulders, 'right'),
    isHandInWritingPosition(leftHand[0], shoulders, 'left')
  );

  const movementScore = calculateWritingMovementScore(rightHand);
  const postureScore = calculateLeaningPostureScore(pose);

  return (writingPositionScore * 0.5) + (movementScore * 0.3) + (postureScore * 0.2);
};

/**
 * Calculate confidence for reading activity
 */
const calculateReadingConfidence = (leftHand, rightHand, pose, face) => {
  const headAngle = calculateHeadAngle(pose, face);
  const handsScore = calculateReadingHandsScore(leftHand, rightHand, pose);
  const postureScore = calculateRelaxedPostureScore(pose);

  // Reading often involves slightly tilted head and relaxed posture
  return (Math.abs(headAngle) * 0.4) + (handsScore * 0.3) + (postureScore * 0.3);
};

/**
 * Calculate confidence for phone usage
 */
const calculatePhoneConfidence = (leftHand, rightHand, pose, face) => {
  if ((leftHand.length === 0 && rightHand.length === 0)) return 0;

  const handNearFace = isHandNearFace(leftHand, face) || isHandNearFace(rightHand, face);
  const headDown = isHeadDown(pose, face);
  const isolatedMovement = calculateIsolatedHandMovement(leftHand, rightHand);

  return (handNearFace * 0.5) + (headDown * 0.3) + (isolatedMovement * 0.2);
};

/**
 * Calculate confidence for meeting/discussion
 */
const calculateMeetingConfidence = (pose, face) => {
  const headStraight = isHeadStraight(pose, face);
  const uprightPosture = calculateUprightPostureScore(pose);
  const minimalMovement = calculateBodyStillness(pose);

  return (headStraight * 0.4) + (uprightPosture * 0.3) + (minimalMovement * 0.3);
};

/**
 * Calculate confidence for presenting/explaining
 */
const calculatePresentingConfidence = (pose, leftHand, rightHand) => {
  const gestureScore = calculateGesturingScore(leftHand, rightHand);
  const postureScore = calculateOpenPostureScore(pose);
  const movementScore = calculateExpressiveMovementScore(leftHand, rightHand);

  return (gestureScore * 0.4) + (postureScore * 0.3) + (movementScore * 0.3);
};

/**
 * Calculate confidence for idle state
 */
const calculateIdleConfidence = (leftHand, rightHand, pose) => {
  const handsStill = calculateHandsStillness(leftHand, rightHand);
  const bodyStill = calculateBodyStillness(pose);
  const relaxedPosture = calculateRelaxedPostureScore(pose);

  return (handsStill * 0.4) + (bodyStill * 0.3) + (relaxedPosture * 0.3);
};

// ===== HELPER FUNCTIONS =====

const getShoulders = (pose) => ({
  left: pose[11],
  right: pose[12],
  center: {
    x: (pose[11].x + pose[12].x) / 2,
    y: (pose[11].y + pose[12].y) / 2
  }
});

const calculateHandsPositionScore = (leftWrist, rightWrist, shoulders) => {
  if (!leftWrist || !rightWrist) return 0;
  
  const leftScore = leftWrist.y > shoulders.center.y ? 1 : 0;
  const rightScore = rightWrist.y > shoulders.center.y ? 1 : 0;
  return (leftScore + rightScore) / 2;
};

const calculateTypingMovementScore = (leftHand, rightHand) => {
  // Track finger movements for typing pattern
  let movementScore = 0;
  const fingersToCheck = [4, 8, 12, 16, 20]; // fingertip landmarks

  if (leftHand.length > 0) {
    movementScore += detectFingerMovement(leftHand, fingersToCheck);
  }
  if (rightHand.length > 0) {
    movementScore += detectFingerMovement(rightHand, fingersToCheck);
  }

  return Math.min(movementScore / 2, 1);
};

const calculateUprightPostureScore = (pose) => {
  const nose = pose[0];
  const shoulders = getShoulders(pose);
  return 1 - Math.abs(nose.x - shoulders.center.x) * 2;
};

// Add similar helper functions for other activities...

const isActivityStable = (currentActivity) => {
  if (activityHistory.length < 3) return true;
  
  const recentActivities = activityHistory.slice(-3);
  const sameCount = recentActivities.filter(a => a === currentActivity).length;
  return sameCount >= 2;
};

const getMostCommonActivity = () => {
  const count = {};
  activityHistory.forEach(activity => {
    count[activity] = (count[activity] || 0) + 1;
  });
  
  return Object.keys(count).reduce((a, b) => count[a] > count[b] ? a : b, 'idle');
};

// Additional utility functions would be implemented here...
// [Previous movement detection and helper functions]

// Export confidence scores for debugging/display
export const getConfidenceScores = () => ({ ...confidenceScores });

// Reset function for when user changes context
export const resetClassifier = () => {
  activityHistory = [];
  confidenceScores = {
    typing: 0,
    writing: 0,
    reading: 0,
    phone: 0,
    meeting: 0,
    presenting: 0,
    idle: 0
  };
};

// Debug function to see what the classifier is thinking
export const getDebugInfo = (results) => {
  if (!results || !results.poseLandmarks) return null;

  const pose = results.poseLandmarks;
  const leftHand = results.leftHandLandmarks || [];
  const rightHand = results.rightHandLandmarks || [];
  const face = results.faceLandmarks || [];

  return {
    typing: calculateTypingConfidence(leftHand, rightHand, pose),
    writing: calculateWritingConfidence(leftHand, rightHand, pose),
    reading: calculateReadingConfidence(leftHand, rightHand, pose, face),
    phone: calculatePhoneConfidence(leftHand, rightHand, pose, face),
    meeting: calculateMeetingConfidence(pose, face),
    presenting: calculatePresentingConfidence(pose, leftHand, rightHand),
    idle: calculateIdleConfidence(leftHand, rightHand, pose)
  };
};