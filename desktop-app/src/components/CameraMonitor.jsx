
// import React, { useRef, useEffect, useState, useCallback } from "react";
// import * as faceapi from "face-api.js";
// import { drawResults } from "../utils/faceUtils";
// import { classifyActivity } from "../utils/activityClassifier";
// import useHolistic from "../hooks/useHolistic";

// const CameraMonitor = () => {
//   const canvasRef = useRef(null);
//   const [activity, setActivity] = useState("Initializing...");
//   const [faceApiLoaded, setFaceApiLoaded] = useState(false);

//   const handleResults = useCallback((results) => {
//     if (canvasRef.current && results) {
//       const ctx = canvasRef.current.getContext("2d");
//       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//       drawResults(results, ctx);
//     }
//     setActivity(classifyActivity(results) || "Analyzing...");
//   }, []);

//   const { videoRef, error, isInitialized, restart } = useHolistic(handleResults);

//   useEffect(() => {
//     const loadFaceModels = async () => {
//       try {
//         const modelPath = `${window.location.origin}/models/face-api`;
//         await Promise.all([
//           faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
//           faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
//           faceapi.nets.faceRecognitionNet.loadFromUri(modelPath)
//         ]);
//         setFaceApiLoaded(true);
//       } catch (err) {
//         console.error("Face models error:", err);
//       }
//     };

//     loadFaceModels();
//   }, []);

//   useEffect(() => {
//     const updateCanvas = () => {
//       if (videoRef.current && canvasRef.current) {
//         canvasRef.current.width = videoRef.current.videoWidth || 640;
//         canvasRef.current.height = videoRef.current.videoHeight || 480;
//       }
//     };

//     if (videoRef.current) {
//       videoRef.current.addEventListener('loadedmetadata', updateCanvas);
//       videoRef.current.addEventListener('resize', updateCanvas);
//     }

//     return () => {
//       if (videoRef.current) {
//         videoRef.current.removeEventListener('loadedmetadata', updateCanvas);
//         videoRef.current.removeEventListener('resize', updateCanvas);
//       }
//     };
//   }, [videoRef]);

//   if (error) {
//     return (
//       <div className="flex flex-col items-center p-6 bg-red-50 rounded-lg">
//         <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
//         <p className="text-red-500 mb-4 text-center">{error}</p>
//         <button 
//           onClick={restart}
//           className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col items-center p-4">
//       <h2 className="text-xl font-semibold mb-4">Activity Monitor</h2>
      
//       <div className="relative bg-black rounded-lg overflow-hidden">
//         <video
//           ref={videoRef}
//           className="w-96 h-72 object-cover"
//           autoPlay
//           muted
//           playsInline
//         />
//         <canvas
//           ref={canvasRef}
//           className="absolute top-0 left-0 w-full h-full pointer-events-none"
//         />
        
//         {!isInitialized && (
//           <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//             <div className="text-white text-center">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
//               Loading camera...
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="mt-4 p-3 bg-gray-100 rounded-lg w-96">
//         <p className="text-center font-medium">
//           Activity: <span className="text-blue-600">{activity}</span>
//         </p>
//       </div>

//       {!faceApiLoaded && (
//         <p className="text-yellow-600 mt-2">Loading facial recognition...</p>
//       )}
//     </div>
//   );
// };

// export default CameraMonitor;





import React, { useRef, useEffect, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import { drawResults } from "../utils/faceUtils";
import useHolistic from "../hooks/useHolistic";

const CameraMonitor = ({ onActivityChange }) => {
  const canvasRef = useRef(null);
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleResults = useCallback((results) => {
    // Draw landmarks on canvas
    if (canvasRef.current && results) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawResults(results, ctx);
    }
  }, []);

  const handleActivityChange = useCallback((activity) => {
    if (onActivityChange) {
      onActivityChange(activity);
    }
  }, [onActivityChange]);

  const { 
    videoRef, 
    error, 
    isInitialized, 
    currentActivity, 
    restart 
  } = useHolistic(handleResults, handleActivityChange);

  // Load face-api.js models
  useEffect(() => {
    const loadFaceModels = async () => {
      try {
        console.log("Loading face-api models...");
        const modelPath = `${window.location.origin}/models/face-api`;

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
          faceapi.nets.faceRecognitionNet.loadFromUri(modelPath)
        ]);

        console.log("Face-api models loaded successfully!");
        setFaceApiLoaded(true);
      } catch (err) {
        console.error("Error loading face-api models:", err);
      }
    };

    loadFaceModels();
  }, []);

  // Handle canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        canvasRef.current.width = video.videoWidth || 640;
        canvasRef.current.height = video.videoHeight || 480;
      }
    };

    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', updateCanvasSize);
      videoRef.current.addEventListener('resize', updateCanvasSize);
      
      // Initial check
      updateCanvasSize();
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', updateCanvasSize);
        videoRef.current.removeEventListener('resize', updateCanvasSize);
      }
    };
  }, [videoRef]);

  // Debug mode toggle (optional)
  const [showDebug, setShowDebug] = useState(false);
  useEffect(() => {
    if (showDebug) {
      const interval = setInterval(() => {
        // You could add debug info collection here if needed
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showDebug]);

  if (error) {
    return (
      <div className="flex flex-col items-center p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Camera Error</h2>
        <p className="text-red-500 mb-4 text-center">{error}</p>
        <button 
          onClick={restart}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
        <p className="text-sm text-gray-500 mt-4">
          Make sure you have a webcam connected and permissions granted.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-xl font-semibold mb-4">Live Activity Monitor</h2>
      
      <div className="relative rounded-lg overflow-hidden shadow-lg bg-black">
        <video
          ref={videoRef}
          className="w-96 h-72 object-cover"
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        
        {/* Loading overlay */}
        {!isInitialized && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Initializing camera and AI models...</p>
              <p className="text-sm mt-1">This may take a few seconds</p>
            </div>
          </div>
        )}

        {/* Status indicators */}
        <div className="absolute top-2 left-2 flex gap-2">
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            isInitialized ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
          }`}>
            {isInitialized ? 'AI Ready' : 'Loading AI'}
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            faceApiLoaded ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
          }`}>
            {faceApiLoaded ? 'Face Ready' : 'Loading Face'}
          </div>
        </div>
      </div>

      {/* Activity Display */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm w-96 border border-blue-200">
        <h3 className="text-lg font-semibold text-center mb-3 text-gray-800">Current Activity</h3>
        <div className={`text-xl font-bold text-center py-2 rounded-lg ${
          currentActivity === 'Typing' ? 'bg-green-100 text-green-800' :
          currentActivity === 'Writing' ? 'bg-blue-100 text-blue-800' :
          currentActivity === 'Reading' ? 'bg-purple-100 text-purple-800' :
          currentActivity === 'Phone' ? 'bg-red-100 text-red-800' :
          currentActivity === 'Meeting' ? 'bg-indigo-100 text-indigo-800' :
          currentActivity === 'Presenting' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {currentActivity || 'Analyzing...'}
        </div>
      </div>

      {/* Debug Toggle (optional) */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
      >
        {showDebug ? 'Hide Debug' : 'Show Debug'}
      </button>

      {/* Debug Information */}
      {showDebug && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg w-96">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <p>Camera: {isInitialized ? 'Ready' : 'Initializing'}</p>
          <p>Face API: {faceApiLoaded ? 'Loaded' : 'Loading'}</p>
          <p>Video: {videoRef.current?.readyState === 4 ? 'Playing' : 'Loading'}</p>
        </div>
      )}

      {/* Status messages */}
      <div className="mt-4 flex flex-col items-center gap-1">
        {!isInitialized && (
          <p className="text-yellow-600 text-sm">Initializing pose detection...</p>
        )}
        {!faceApiLoaded && (
          <p className="text-yellow-600 text-sm">Loading facial recognition models...</p>
        )}
        {isInitialized && !videoRef.current?.srcObject && (
          <p className="text-yellow-600 text-sm">Waiting for camera access...</p>
        )}
      </div>
    </div>
  );
};

export default CameraMonitor;