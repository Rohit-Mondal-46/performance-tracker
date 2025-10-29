
// // hooks/useHolistic.js - UPDATED VERSION
// import { useEffect, useRef, useState, useCallback } from "react";
// import { initializeMediaPipe } from "../utils/mediapipeLoader";

// // ... (keep the existing helper functions and classifyActivity function)
// let previousLeftWrist = null;
// let previousRightWrist = null;
// const MOVEMENT_THRESHOLD = 0.01;

// // Helper functions for activity classification
// const distance = (a, b) =>
//   Math.sqrt(
//     (a.x - b.x) ** 2 +
//     (a.y - b.y) ** 2 +
//     (a.z - b.z) ** 2
//   );

// const isHandNearDesk = (hand, pose) => {
//   if (!hand || !pose || hand.length === 0) return false;
//   const wrist = hand[0];
//   const chest = pose[11];
//   return wrist && chest && wrist.y > chest.y + 0.05;
// };

// const isHandNearHead = (hand, pose) => {
//   if (!hand || !pose || hand.length === 0) return false;
//   const wrist = hand[0];
//   const head = pose[0];
//   return wrist && head && wrist.y < head.y + 0.05;
// };

// const isHandMoving = (hand, side) => {
//   if (!hand || hand.length === 0) return false;

//   const wrist = hand[0];
//   let prevWrist = side === 'left' ? previousLeftWrist : previousRightWrist;

//   if (side === 'left') previousLeftWrist = wrist;
//   else previousRightWrist = wrist;

//   if (!prevWrist) return true;

//   const dist = distance(wrist, prevWrist);
//   return dist > MOVEMENT_THRESHOLD;
// };

// /**
//  * Classify activity based on MediaPipe Holistic results
//  */
// const classifyActivity = (results) => {
//   if (!results || !results.poseLandmarks) {
//     return 'No Data';
//   }

//   const leftHand = results.leftHandLandmarks || [];
//   const rightHand = results.rightHandLandmarks || [];
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

// const useHolistic = (onResults, onActivityChange) => {
//   const videoRef = useRef(null);
//   const holisticRef = useRef(null);
//   const cameraRef = useRef(null);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [error, setError] = useState(null);
//   const [currentActivity, setCurrentActivity] = useState("Initializing...");
//   const [mediaPipeStatus, setMediaPipeStatus] = useState("loading");
//   const [cameraStream, setCameraStream] = useState(null);

//   // Cleanup function
//   const cleanup = useCallback(async () => {
//     try {
//       if (cameraRef.current) {
//         try {
//           cameraRef.current.stop();
//         } catch (e) {
//           console.warn("Error stopping camera:", e);
//         }
//         cameraRef.current = null;
//       }
      
//       if (cameraStream) {
//         cameraStream.getTracks().forEach(track => {
//           track.stop();
//         });
//         setCameraStream(null);
//       }
      
//       if (videoRef.current?.srcObject) {
//         videoRef.current.srcObject = null;
//       }
      
//       if (holisticRef.current) {
//         try {
//           await holisticRef.current.close();
//         } catch (closeError) {
//           console.warn("Error closing Holistic:", closeError);
//         }
//         holisticRef.current = null;
//       }
      
//       setIsInitialized(false);
//       previousLeftWrist = null;
//       previousRightWrist = null;
      
//     } catch (err) {
//       console.warn("Cleanup error:", err);
//     }
//   }, [cameraStream]);

//   // Process results and detect activity
//   const processResults = useCallback((results) => {
//     if (onResults) {
//       onResults(results);
//     }
    
//     const activity = classifyActivity(results);
//     setCurrentActivity(activity);
    
//     if (onActivityChange) {
//       onActivityChange(activity);
//     }
//   }, [onResults, onActivityChange]);

//   // Initialize MediaPipe Holistic
//   const initializeHolistic = useCallback(async () => {
//     try {
//       await cleanup();
//       setMediaPipeStatus("loading");

//       // Initialize MediaPipe
//       const mediaPipeResult = await initializeMediaPipe();
      
//       if (!mediaPipeResult.Holistic || !mediaPipeResult.Camera) {
//         throw new Error("MediaPipe components not available");
//       }

//       const Holistic = mediaPipeResult.Holistic;
//       const Camera = mediaPipeResult.Camera;

//       const holistic = new Holistic({
//         locateFile: (file) => {
//           const isElectron = window && window.process && window.process.versions?.electron;
//           return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
//         }
//       });

//       holistic.setOptions({
//         modelComplexity: 0,
//         smoothLandmarks: true,
//         enableSegmentation: false,
//         smoothSegmentation: false,
//         refineFaceLandmarks: false,
//         minDetectionConfidence: 0.5,
//         minTrackingConfidence: 0.3,
//       });

//       holistic.onResults(processResults);
//       holisticRef.current = holistic;

//       try {
//         await holistic.initialize();
//         setMediaPipeStatus("loaded");
//       } catch (initError) {
//         console.warn("Holistic initialization warning:", initError);
//         setMediaPipeStatus("partial");
//       }

//       setIsInitialized(true);
//       setError(null);
//       return holistic;

//     } catch (err) {
//       console.error("Error initializing Holistic:", err);
//       setMediaPipeStatus("failed");
//       setError("Failed to initialize pose detection. Please check your internet connection.");
//       setIsInitialized(false);
//       throw err;
//     }
//   }, [cleanup, processResults]);

//   // Start webcam with proper error handling
//   const startWebcam = useCallback(async () => {
//     try {
//       console.log("Requesting camera access...");
      
//       // First check if camera is available
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
//       if (videoDevices.length === 0) {
//         throw new Error("No camera found. Please connect a webcam.");
//       }

//       // Request camera access with specific constraints
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           width: { ideal: 640, max: 1280 },
//           height: { ideal: 480, max: 720 },
//           facingMode: "user",
//           frameRate: { ideal: 30, min: 15 }
//         },
//         audio: false
//       });

//       setCameraStream(stream);

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
        
//         // Wait for video to be ready
//         await new Promise((resolve, reject) => {
//           if (videoRef.current.readyState >= 4) { // HAVE_ENOUGH_DATA
//             resolve();
//             return;
//           }

//           const onLoaded = () => {
//             videoRef.current.removeEventListener('loadedmetadata', onLoaded);
//             videoRef.current.removeEventListener('error', onError);
//             resolve();
//           };

//           const onError = (err) => {
//             videoRef.current.removeEventListener('loadedmetadata', onLoaded);
//             videoRef.current.removeEventListener('error', onError);
//             reject(err);
//           };

//           videoRef.current.addEventListener('loadedmetadata', onLoaded);
//           videoRef.current.addEventListener('error', onError);

//           // Timeout after 5 seconds
//           setTimeout(() => {
//             videoRef.current.removeEventListener('loadedmetadata', onLoaded);
//             videoRef.current.removeEventListener('error', onError);
//             reject(new Error("Camera timeout - video not ready"));
//           }, 5000);
//         });

//         // Initialize camera processing
//         if (!window.Camera) {
//           throw new Error("Camera utils not available");
//         }

//         const Camera = window.Camera;

//         cameraRef.current = new Camera(videoRef.current, {
//           onFrame: async () => {
//             if (holisticRef.current && videoRef.current?.readyState === 4) {
//               try {
//                 await holisticRef.current.send({ image: videoRef.current });
//               } catch (frameErr) {
//                 console.warn("Frame processing error:", frameErr);
//               }
//             }
//           },
//           width: 640,
//           height: 480
//         });

//         await cameraRef.current.start();
//         console.log("Camera started successfully");
//       }
//     } catch (err) {
//       console.error("Webcam error:", err);
      
//       let errorMessage = "Cannot access webcam. ";
//       if (err.name === 'NotAllowedError') {
//         errorMessage = "Camera permission denied. Please allow camera access in your browser settings.";
//       } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
//         errorMessage = "No suitable camera found. Please check your webcam connection.";
//       } else if (err.message.includes('timeout')) {
//         errorMessage = "Camera initialization timeout. Please try again.";
//       } else {
//         errorMessage += err.message || "Please check your camera connection.";
//       }
      
//       setError(errorMessage);
//       throw err;
//     }
//   }, []);

//   // Main initialization effect
//   useEffect(() => {
//     let isMounted = true;
//     let initializationAttempted = false;

//     const init = async () => {
//       if (initializationAttempted) return;
//       initializationAttempted = true;

//       try {
//         // Initialize MediaPipe first
//         await initializeHolistic();
        
//         if (isMounted) {
//           await startWebcam();
//         }
//       } catch (err) {
//         if (isMounted) {
//           console.error("Initialization failed:", err);
//           if (!error) {
//             setError(err.message || "Failed to initialize. Please check camera permissions.");
//           }
//         }
//       }
//     };

//     if (onResults || onActivityChange) {
//       // Add a small delay to ensure DOM is ready
//       setTimeout(init, 100);
//     }

//     return () => {
//       isMounted = false;
//       cleanup();
//     };
//   }, [onResults, onActivityChange, initializeHolistic, startWebcam, cleanup, error]);

//   const restart = useCallback(async () => {
//     setError(null);
//     setCurrentActivity("Restarting...");
//     setMediaPipeStatus("loading");
    
//     try {
//       await cleanup();
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       await initializeHolistic();
//       await startWebcam();
//     } catch (err) {
//       setError("Failed to restart. " + (err.message || "Please try refreshing the page."));
//     }
//   }, [cleanup, initializeHolistic, startWebcam]);

//   return { 
//     videoRef, 
//     error, 
//     isInitialized, 
//     currentActivity,
//     restart,
//     mediaPipeStatus
//   };
// };

// export default useHolistic;
// export { classifyActivity };



// // hooks/useHolistic.js - UPDATED VERSION
// import { useEffect, useRef, useState, useCallback } from "react";
// import { initializeMediaPipe } from "../utils/mediapipeLoader";

// // ... (keep the existing helper functions and classifyActivity function)
// let previousLeftWrist = null;
// let previousRightWrist = null;
// const MOVEMENT_THRESHOLD = 0.01;

// // Helper functions for activity classification
// const distance = (a, b) =>
//   Math.sqrt(
//     (a.x - b.x) ** 2 +
//     (a.y - b.y) ** 2 +
//     (a.z - b.z) ** 2
//   );

// const isHandNearDesk = (hand, pose) => {
//   if (!hand || !pose || hand.length === 0) return false;
//   const wrist = hand[0];
//   const chest = pose[11];
//   return wrist && chest && wrist.y > chest.y + 0.05;
// };

// const isHandNearHead = (hand, pose) => {
//   if (!hand || !pose || hand.length === 0) return false;
//   const wrist = hand[0];
//   const head = pose[0];
//   return wrist && head && wrist.y < head.y + 0.05;
// };

// const isHandMoving = (hand, side) => {
//   if (!hand || hand.length === 0) return false;

//   const wrist = hand[0];
//   let prevWrist = side === 'left' ? previousLeftWrist : previousRightWrist;

//   if (side === 'left') previousLeftWrist = wrist;
//   else previousRightWrist = wrist;

//   if (!prevWrist) return true;

//   const dist = distance(wrist, prevWrist);
//   return dist > MOVEMENT_THRESHOLD;
// };

// /**
//  * Classify activity based on MediaPipe Holistic results
//  */
// const classifyActivity = (results) => {
//   if (!results || !results.poseLandmarks) {
//     return 'No Data';
//   }

//   const leftHand = results.leftHandLandmarks || [];
//   const rightHand = results.rightHandLandmarks || [];
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

// // Basic activity detection without MediaPipe
// const detectBasicActivity = (videoElement) => {
//   // Simple fallback activity detection based on basic video analysis
//   // This is a placeholder - you could add simple motion detection here
//   return 'Idle'; // Default to idle since we can't do proper detection without MediaPipe
// };

// const useHolistic = (onResults, onActivityChange) => {
//   const videoRef = useRef(null);
//   const holisticRef = useRef(null);
//   const cameraRef = useRef(null);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [error, setError] = useState(null);
//   const [currentActivity, setCurrentActivity] = useState("Initializing...");
//   const [mediaPipeStatus, setMediaPipeStatus] = useState("loading");
//   const [cameraStream, setCameraStream] = useState(null);
//   const animationFrameRef = useRef(null);

//   // Cleanup function
//   const cleanup = useCallback(async () => {
//     try {
//       if (cameraRef.current) {
//         try {
//           cameraRef.current.stop();
//         } catch (e) {
//           console.warn("Error stopping camera:", e);
//         }
//         cameraRef.current = null;
//       }
      
//       if (cameraStream) {
//         cameraStream.getTracks().forEach(track => {
//           track.stop();
//         });
//         setCameraStream(null);
//       }
      
//       if (videoRef.current?.srcObject) {
//         videoRef.current.srcObject = null;
//       }
      
//       if (holisticRef.current) {
//         try {
//           await holisticRef.current.close();
//         } catch (closeError) {
//           console.warn("Error closing Holistic:", closeError);
//         }
//         holisticRef.current = null;
//       }
      
//       // Stop animation frame loop
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current);
//         animationFrameRef.current = null;
//       }
      
//       setIsInitialized(false);
//       previousLeftWrist = null;
//       previousRightWrist = null;
      
//     } catch (err) {
//       console.warn("Cleanup error:", err);
//     }
//   }, [cameraStream]);

//   // Process results and detect activity
//   const processResults = useCallback((results) => {
//     if (onResults) {
//       onResults(results);
//     }
    
//     const activity = classifyActivity(results);
//     setCurrentActivity(activity);
    
//     if (onActivityChange) {
//       onActivityChange(activity);
//     }
//   }, [onResults, onActivityChange]);

//   // Initialize MediaPipe Holistic
//   const initializeHolistic = useCallback(async () => {
//     try {
//       await cleanup();
//       setMediaPipeStatus("loading");

//       // Initialize MediaPipe
//       const mediaPipeResult = await initializeMediaPipe();
      
//       if (!mediaPipeResult.Holistic || !mediaPipeResult.Camera) {
//         throw new Error("MediaPipe components not available");
//       }

//       const Holistic = mediaPipeResult.Holistic;
//       const Camera = mediaPipeResult.Camera;

//       const holistic = new Holistic({
//         locateFile: (file) => {
//           const isElectron = window && window.process && window.process.versions?.electron;
//           return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
//         }
//       });

//       holistic.setOptions({
//         modelComplexity: 0,
//         smoothLandmarks: true,
//         enableSegmentation: false,
//         smoothSegmentation: false,
//         refineFaceLandmarks: false,
//         minDetectionConfidence: 0.5,
//         minTrackingConfidence: 0.3,
//       });

//       holistic.onResults(processResults);
//       holisticRef.current = holistic;

//       try {
//         await holistic.initialize();
//         setMediaPipeStatus("loaded");
//         return holistic;
//       } catch (initError) {
//         console.warn("Holistic initialization warning:", initError);
//         setMediaPipeStatus("partial");
//         throw initError; // Re-throw to trigger fallback
//       }

//     } catch (err) {
//       console.error("Error initializing Holistic:", err);
//       setMediaPipeStatus("failed");
//       throw err; // Re-throw to trigger fallback
//     }
//   }, [cleanup, processResults]);

//   // Start webcam with proper error handling
//   const startWebcam = useCallback(async () => {
//     try {
//       console.log("Requesting camera access...");
      
//       // First check if camera is available
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
//       if (videoDevices.length === 0) {
//         throw new Error("No camera found. Please connect a webcam.");
//       }

//       // Request camera access with specific constraints
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           width: { ideal: 640, max: 1280 },
//           height: { ideal: 480, max: 720 },
//           facingMode: "user",
//           frameRate: { ideal: 30, min: 15 }
//         },
//         audio: false
//       });

//       setCameraStream(stream);

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
        
//         // Wait for video to be ready
//         await new Promise((resolve, reject) => {
//           if (videoRef.current.readyState >= 4) { // HAVE_ENOUGH_DATA
//             resolve();
//             return;
//           }

//           const onLoaded = () => {
//             videoRef.current.removeEventListener('loadedmetadata', onLoaded);
//             videoRef.current.removeEventListener('error', onError);
//             resolve();
//           };

//           const onError = (err) => {
//             videoRef.current.removeEventListener('loadedmetadata', onLoaded);
//             videoRef.current.removeEventListener('error', onError);
//             reject(err);
//           };

//           videoRef.current.addEventListener('loadedmetadata', onLoaded);
//           videoRef.current.addEventListener('error', onError);

//           // Timeout after 5 seconds
//           setTimeout(() => {
//             videoRef.current.removeEventListener('loadedmetadata', onLoaded);
//             videoRef.current.removeEventListener('error', onError);
//             reject(new Error("Camera timeout - video not ready"));
//           }, 5000);
//         });

//         // Only initialize MediaPipe camera processing if Holistic is available
//         if (holisticRef.current && window.Camera) {
//           const Camera = window.Camera;

//           cameraRef.current = new Camera(videoRef.current, {
//             onFrame: async () => {
//               if (holisticRef.current && videoRef.current?.readyState === 4) {
//                 try {
//                   await holisticRef.current.send({ image: videoRef.current });
//                 } catch (frameErr) {
//                   console.warn("Frame processing error:", frameErr);
//                 }
//               }
//             },
//             width: 640,
//             height: 480
//           });

//           await cameraRef.current.start();
//         }
        
//         console.log("Camera started successfully");
//         return true;
//       }
//     } catch (err) {
//       console.error("Webcam error:", err);
      
//       let errorMessage = "Cannot access webcam. ";
//       if (err.name === 'NotAllowedError') {
//         errorMessage = "Camera permission denied. Please allow camera access in your browser settings.";
//       } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
//         errorMessage = "No suitable camera found. Please check your webcam connection.";
//       } else if (err.message.includes('timeout')) {
//         errorMessage = "Camera initialization timeout. Please try again.";
//       } else {
//         errorMessage += err.message || "Please check your camera connection.";
//       }
      
//       setError(errorMessage);
//       throw err;
//     }
//   }, []);

//   // Fallback initialization without MediaPipe
//   const initializeWithFallback = useCallback(async () => {
//     try {
//       await initializeHolistic();
      
//       // If we reach here, MediaPipe initialized successfully
//       await startWebcam();
//       setIsInitialized(true);
//       setError(null);
      
//     } catch (holisticError) {
//       console.warn('Holistic initialization failed, trying fallback approach:', holisticError);
      
//       // Fallback: Try to initialize without full MediaPipe
//       try {
//         // Just load the camera without MediaPipe processing
//         await startWebcam();
        
//         // Set up a basic frame processor that doesn't use MediaPipe
//         if (videoRef.current) {
//           const processFrame = () => {
//             if (videoRef.current && videoRef.current.readyState === 4) {
//               // Basic activity detection without MediaPipe
//               const activity = detectBasicActivity(videoRef.current);
//               setCurrentActivity(activity);
//               if (onActivityChange) {
//                 onActivityChange(activity);
//               }
//             }
//             animationFrameRef.current = requestAnimationFrame(processFrame);
//           };
//           animationFrameRef.current = requestAnimationFrame(processFrame);
//         }
        
//         setIsInitialized(true);
//         setError(null);
//         setMediaPipeStatus("fallback");
//         console.log("Fallback mode activated - camera only, no MediaPipe");
        
//       } catch (fallbackError) {
//         console.error('Fallback initialization also failed:', fallbackError);
//         setError("Failed to initialize. " + (fallbackError.message || "Please check camera permissions."));
//         throw fallbackError;
//       }
//     }
//   }, [initializeHolistic, startWebcam, onActivityChange]);

//   // Main initialization effect
//   useEffect(() => {
//     let isMounted = true;
//     let initializationAttempted = false;

//     const init = async () => {
//       if (initializationAttempted) return;
//       initializationAttempted = true;

//       try {
//         await initializeWithFallback();
//       } catch (err) {
//         if (isMounted) {
//           console.error("Initialization failed:", err);
//           if (!error) {
//             setError(err.message || "Failed to initialize. Please check camera permissions.");
//           }
//         }
//       }
//     };

//     if (onResults || onActivityChange) {
//       // Add a small delay to ensure DOM is ready
//       setTimeout(init, 100);
//     }

//     return () => {
//       isMounted = false;
//       cleanup();
//     };
//   }, [onResults, onActivityChange, initializeWithFallback, cleanup, error]);

//   const restart = useCallback(async () => {
//     setError(null);
//     setCurrentActivity("Restarting...");
//     setMediaPipeStatus("loading");
    
//     try {
//       await cleanup();
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       await initializeWithFallback();
//     } catch (err) {
//       setError("Failed to restart. " + (err.message || "Please try refreshing the page."));
//     }
//   }, [cleanup, initializeWithFallback]);

//   return { 
//     videoRef, 
//     error, 
//     isInitialized, 
//     currentActivity,
//     restart,
//     mediaPipeStatus,
//     isUsingFallback: mediaPipeStatus === "fallback"
//   };
// };

// export default useHolistic;
// export { classifyActivity };



// hooks/useHolistic.js - FIXED VERSION (Video Element Timing Fixed)
import { useEffect, useRef, useState, useCallback } from "react";

const useHolistic = (onResults, onActivityChange) => {
  const videoRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [currentActivity, setCurrentActivity] = useState("Initializing...");
  const [mediaPipeStatus, setMediaPipeStatus] = useState("checking");
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  
  // Store callbacks in refs to avoid dependency issues
  const onResultsRef = useRef(onResults);
  const onActivityChangeRef = useRef(onActivityChange);
  
  // Update refs when callbacks change (without triggering re-initialization)
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);
  
  useEffect(() => {
    onActivityChangeRef.current = onActivityChange;
  }, [onActivityChange]);

  // Store holistic and camera instances
  const holisticRef = useRef(null);
  const cameraRef = useRef(null);
  const streamRef = useRef(null);
  const initializingRef = useRef(false);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log("Cleaning up resources...");
    
    if (cameraRef.current) {
      try {
        cameraRef.current.stop();
      } catch (e) {
        console.warn("Camera stop error:", e);
      }
      cameraRef.current = null;
    }
    
    if (holisticRef.current) {
      try {
        holisticRef.current.close();
      } catch (e) {
        console.warn("Holistic close error:", e);
      }
      holisticRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
    
    initializingRef.current = false;
  }, []);

  // Initialize function - NO dependencies on callbacks
  const initialize = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (initializingRef.current) {
      console.log("Already initializing, skipping...");
      return;
    }

    try {
      initializingRef.current = true;
      console.log("Starting initialization...");
      setError(null);
      setMediaPipeStatus("loading");
      cleanup();
      
      // CRITICAL: Wait for video element to be mounted
      if (!videoRef.current) {
        console.log("Waiting for video element...");
        await new Promise((resolve, reject) => {
          const maxAttempts = 50; // 5 seconds max
          let attempts = 0;
          
          const checkVideo = setInterval(() => {
            attempts++;
            if (videoRef.current) {
              clearInterval(checkVideo);
              console.log("Video element found!");
              resolve();
            } else if (attempts >= maxAttempts) {
              clearInterval(checkVideo);
              reject(new Error("Video element not mounted after 5 seconds"));
            }
          }, 100);
        });
      }
      
      // Wait for MediaPipe in Electron
      if (window.electronAPI) {
        console.log("Loading MediaPipe via Electron...");
        await window.electronAPI.loadMediaPipe();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Check if MediaPipe is available
      if (typeof Holistic === 'undefined' || typeof Camera === 'undefined') {
        throw new Error('MediaPipe Holistic not available. Please check script loading.');
      }

      // Get camera access
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        throw new Error("Video element disappeared during initialization");
      }

      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Video load timeout")), 10000);
        
        const checkReady = () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            clearTimeout(timeout);
            resolve();
          }
        };
        
        // Check immediately
        checkReady();
        
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            clearTimeout(timeout);
            resolve();
          };
          
          videoRef.current.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Video load error"));
          };
        }
      });

      console.log("Video ready, initializing Holistic...");

      // Initialize Holistic
      const holistic = new Holistic({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
        }
      });

      holisticRef.current = holistic;

      holistic.setOptions({
        modelComplexity: 0,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        enableSegmentation: false,
        smoothSegmentation: false,
      });

      // Activity detection with smoothing
      const activityBuffer = [];
      const BUFFER_SIZE = 3; // Reduced for faster response
      
      holistic.onResults((results) => {
        // Use the ref versions of callbacks
        if (onResultsRef.current) {
          onResultsRef.current(results);
        }
        
        // Enhanced activity detection
        let detectedActivity = 'Idle';
        
        if (results.poseLandmarks && results.poseLandmarks.length > 0) {
          const nose = results.poseLandmarks[0];
          const leftEar = results.poseLandmarks[7];
          const rightEar = results.poseLandmarks[8];
          const leftWrist = results.poseLandmarks[15];
          const rightWrist = results.poseLandmarks[16];
          const leftShoulder = results.poseLandmarks[11];
          const rightShoulder = results.poseLandmarks[12];
          const leftElbow = results.poseLandmarks[13];
          const rightElbow = results.poseLandmarks[14];
          const leftHip = results.poseLandmarks[23];
          const rightHip = results.poseLandmarks[24];
          
          const hasLeftHand = results.leftHandLandmarks && results.leftHandLandmarks.length > 0;
          const hasRightHand = results.rightHandLandmarks && results.rightHandLandmarks.length > 0;
          
          // Calculate distances and positions
          const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
          
          // Enhanced phone detection - hand near ear, elevated position
          const leftHandNearEar = hasLeftHand && leftWrist && leftEar && 
            Math.abs(leftWrist.x - leftEar.x) < 0.15 && 
            Math.abs(leftWrist.y - leftEar.y) < 0.2 &&
            leftWrist.y < leftShoulder.y; // Hand above shoulder
            
          const rightHandNearEar = hasRightHand && rightWrist && rightEar && 
            Math.abs(rightWrist.x - rightEar.x) < 0.15 && 
            Math.abs(rightWrist.y - rightEar.y) < 0.2 &&
            rightWrist.y < rightShoulder.y; // Hand above shoulder
          
          // Gesturing detection - hand raised and away from body
          const leftHandRaised = hasLeftHand && leftWrist && leftShoulder && 
            leftWrist.y < leftShoulder.y && // Above shoulder
            Math.abs(leftWrist.x - leftShoulder.x) > shoulderWidth * 0.3; // Away from body
            
          const rightHandRaised = hasRightHand && rightWrist && rightShoulder && 
            rightWrist.y < rightShoulder.y && // Above shoulder
            Math.abs(rightWrist.x - rightShoulder.x) > shoulderWidth * 0.3; // Away from body
          
          // Writing detection - hand in front of body, at desk level
          const leftHandWriting = hasLeftHand && leftWrist && leftShoulder && leftHip &&
            leftWrist.y > leftShoulder.y && // Below shoulder
            leftWrist.y < leftHip.y && // Above hip (desk level)
            leftWrist.z < -0.15 && // Hand forward (z-depth)
            Math.abs(leftWrist.x - leftShoulder.x) < shoulderWidth * 0.8; // In front of body
            
          const rightHandWriting = hasRightHand && rightWrist && rightShoulder && rightHip &&
            rightWrist.y > rightShoulder.y && // Below shoulder
            rightWrist.y < rightHip.y && // Above hip (desk level)
            rightWrist.z < -0.15 && // Hand forward (z-depth)
            Math.abs(rightWrist.x - rightShoulder.x) < shoulderWidth * 0.8; // In front of body
          
          // Typing detection - both hands at typing position
          const handsAtTypingHeight = hasLeftHand && hasRightHand && 
            leftWrist && rightWrist && leftShoulder && rightShoulder && leftHip && rightHip &&
            leftWrist.y > leftShoulder.y && rightWrist.y > rightShoulder.y && // Below shoulders
            leftWrist.y < leftHip.y && rightWrist.y < rightHip.y && // Above hips
            Math.abs(leftWrist.y - rightWrist.y) < 0.15 && // Similar height
            leftWrist.z < -0.1 && rightWrist.z < -0.1 && // Both hands forward
            Math.abs(leftWrist.x - rightWrist.x) > shoulderWidth * 0.5; // Hands spread apart
          
          // Activity logic with clear priorities
          if (leftHandNearEar || rightHandNearEar) {
            // Phone call - hand near ear
            detectedActivity = 'Phone';
          } else if (leftHandRaised || rightHandRaised) {
            // Gesturing - hand raised and away from body
            detectedActivity = 'Gesturing';
          } else if (handsAtTypingHeight) {
            // Both hands typing
            detectedActivity = 'Typing';
          } else if ((leftHandWriting && !hasRightHand) || (rightHandWriting && !hasLeftHand)) {
            // One hand writing (other hand not visible)
            detectedActivity = 'Writing';
          } else if (hasLeftHand && hasRightHand) {
            // Both hands visible but not in specific positions
            detectedActivity = 'Gesturing';
          } else if (hasLeftHand || hasRightHand) {
            // One hand visible - could be gesturing or resting
            const wrist = hasLeftHand ? leftWrist : rightWrist;
            const shoulder = hasLeftHand ? leftShoulder : rightShoulder;
            
            if (wrist.y < shoulder.y) {
              // Hand above shoulder - probably gesturing
              detectedActivity = 'Gesturing';
            } else {
              // Hand below shoulder - resting or idle
              detectedActivity = 'Idle';
            }
          } else {
            // No hands visible
            detectedActivity = 'Sitting';
          }
        }
        
        // Smooth activity with buffer (smaller buffer for faster response)
        activityBuffer.push(detectedActivity);
        if (activityBuffer.length > BUFFER_SIZE) {
          activityBuffer.shift();
        }
        
        // Get most common activity in buffer
        const activityCounts = {};
        activityBuffer.forEach(act => {
          activityCounts[act] = (activityCounts[act] || 0) + 1;
        });
        
        const smoothedActivity = Object.keys(activityCounts).reduce((a, b) => 
          activityCounts[a] > activityCounts[b] ? a : b
        );
        
        setCurrentActivity(smoothedActivity);
        if (onActivityChangeRef.current) {
          onActivityChangeRef.current(smoothedActivity);
        }
      });

      await holistic.initialize();
      console.log("Holistic initialized");

      // Start camera processing
      if (!videoRef.current) {
        throw new Error("Video element lost before camera start");
      }

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (holisticRef.current && videoRef.current) {
            try {
              await holisticRef.current.send({ image: videoRef.current });
            } catch (err) {
              console.warn('Frame processing error:', err);
            }
          }
        },
        width: 640,
        height: 480
      });

      cameraRef.current = camera;
      await camera.start();
      
      setIsInitialized(true);
      setMediaPipeStatus("loaded");
      setIsUsingFallback(false);
      console.log("✅ Camera and MediaPipe initialized successfully");
      initializingRef.current = false;

    } catch (err) {
      console.error("❌ Initialization error:", err);
      setError(err.message || "Failed to initialize camera");
      setMediaPipeStatus("failed");
      setIsUsingFallback(true);
      cleanup();
    }
  }, [cleanup]);

  // Restart function
  const restart = useCallback(() => {
    console.log("Restarting...");
    setIsInitialized(false);
    setError(null);
    setCurrentActivity("Restarting...");
    cleanup();
    // Small delay before re-initializing
    setTimeout(() => {
      initialize();
    }, 500);
  }, [initialize, cleanup]);

  // Initialize on mount ONLY - with proper timing
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      // Wait a tick to ensure video element is in DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (mounted) {
        await initialize();
      }
    };
    
    init();
    
    return () => {
      mounted = false;
      cleanup();
    };
  }, []); // Empty dependency array - run ONCE on mount

  return { 
    videoRef, 
    error, 
    isInitialized, 
    currentActivity,
    restart,
    mediaPipeStatus,
    isUsingFallback
  };
};

export default useHolistic;