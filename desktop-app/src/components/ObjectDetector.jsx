import React, { useState, useRef, useEffect } from 'react';
import ObjectDetectionService from '../services/ObjectDetectionService';
import { Camera, Upload, Zap, Info, AlertCircle, CheckCircle, X, Loader2, Sparkles } from 'lucide-react';
import { processImage, drawDetections } from '../utils/imageUtils';

const ObjectDetector = ({ modelLoaded, modelLoading, onDetection, detectionResults, detectionError }) => {
  const [detections, setDetections] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(null);
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    initializeModel();
  }, []);

  const initializeModel = async () => {
    try {
      const loaded = await ObjectDetectionService.initialize();
      if (loaded) {
        const info = ObjectDetectionService.modelLoader.getModelInfo();
        setModelInfo(info);
      }
    } catch (err) {
      setError('Failed to load model. Please check if model files exist.');
      console.error('Model initialization error:', err);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    processFile(file);
  };

  const processFile = (file) => {
    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image size should be less than 10MB');
      return;
    }
    
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
      setDetections([]);
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDetect = async () => {
    if (!imageRef.current) {
      setError('Please select an image first');
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      const result = await ObjectDetectionService.detect(imageRef.current, {
        drawOnCanvas: true,
        confidence: 0.25
      });
      
      setDetections(result.detections);
      
      // Draw on canvas
      if (canvasRef.current && result.detections.length > 0) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(imageRef.current, 0, 0);
        
        drawDetections(ctx, result.detections, modelInfo.classes);
      }
      
      // Notify parent component if callback is provided
      if (onDetection) {
        onDetection(result);
      }
      
      console.log(`Detection completed in ${result.processingTime.toFixed(0)}ms`);
      
    } catch (error) {
      console.error('Detection failed:', error);
      setError('Detection failed. Please try again with a different image.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCameraCapture = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera access is not supported in your browser');
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        setImageSrc(canvas.toDataURL('image/png'));
        setError(null);
        stream.getTracks().forEach(track => track.stop());
      };
      
      video.onerror = () => {
        setError('Failed to capture from camera');
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Camera error:', error);
      setError('Camera access denied or failed. Please check permissions.');
    }
  };

  const handleClear = () => {
    setImageSrc(null);
    setDetections([]);
    setError(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const getClassColor = (className) => {
    const colors = {
      phone: 'bg-blue-100 text-blue-800 border-blue-300',
      person: 'bg-green-100 text-green-800 border-green-300',
      laptop: 'bg-purple-100 text-purple-800 border-purple-300',
      default: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[className?.toLowerCase()] || colors.default;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Object Detection
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Detect objects in images using advanced YOLOv8 model with real-time processing
          </p>
        </div>

        {/* Model Info Card */}
        {modelInfo && (
          <div className="bg-white rounded-xl shadow-lg p-5 mb-6 border border-gray-200 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-800">Model Information</h2>
              </div>
              <button 
                onClick={() => setShowModelDetails(!showModelDetails)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
              >
                {showModelDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            
            {showModelDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-lg">
                  <p className="text-sm text-indigo-600 font-medium">Model Name</p>
                  <p className="font-bold text-lg">{modelInfo.name}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Input Size</p>
                  <p className="font-bold text-lg">{modelInfo.inputSize}×{modelInfo.inputSize}</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-3 rounded-lg">
                  <p className="text-sm text-pink-600 font-medium">Confidence</p>
                  <p className="font-bold text-lg">{modelInfo.confidence * 100}%</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Classes</p>
                  <p className="font-bold text-lg truncate">{modelInfo.classes.length}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-3">
                {modelInfo.classes.slice(0, 5).map((cls, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {cls}
                  </span>
                ))}
                {modelInfo.classes.length > 5 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    +{modelInfo.classes.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {(error || detectionError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-pulse">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm mt-1">{error || detectionError}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-3 items-center justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            
            <button
              onClick={handleCameraCapture}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Camera className="w-4 h-4" />
              Use Camera
            </button>
            
            <button
              onClick={handleDetect}
              disabled={!imageSrc || processing || !modelLoaded}
              className={`inline-flex items-center gap-2 px-5 py-3 font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                !imageSrc || processing || !modelLoaded
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Detect Objects
                </>
              )}
            </button>
            
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Clear All
            </button>
          </div>
          
          {/* Model Loading Status */}
          <div className="mt-4 flex justify-center">
            {modelLoading && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-blue-700 text-sm">Loading model...</span>
              </div>
            )}
            
            {modelLoaded && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700 text-sm">Model ready for detection</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Panel - Image/Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>Preview</span>
                {imageSrc && (
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">Image Loaded</span>
                )}
              </h3>
              
              {imageSrc ? (
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Selected"
                    onLoad={() => {
                      if (canvasRef.current && imageRef.current) {
                        canvasRef.current.width = imageRef.current.naturalWidth;
                        canvasRef.current.height = imageRef.current.naturalHeight;
                      }
                    }}
                    className="hidden"
                  />
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto object-contain mx-auto"
                    style={{ maxHeight: '600px' }}
                  />
                  
                  {/* Detection Count Badge */}
                  {(detections.length > 0 || (detectionResults && detectionResults.detections.length > 0)) && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      {(detections.length || detectionResults.detections.length)} object{(detections.length || detectionResults.detections.length) !== 1 ? 's' : ''} detected
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                    dragActive 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-300 bg-gray-50'
                  }`}
                  style={{ minHeight: '400px' }}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="w-16 h-16 mb-4 text-gray-400">
                    <Upload className="w-full h-full" />
                  </div>
                  <p className="text-gray-500 text-lg mb-2">No image selected</p>
                  <p className="text-gray-400 text-center max-w-md">
                    Upload an image or use your camera to get started with object detection
                  </p>
                  <p className="text-gray-400 text-sm mt-2">Or drag and drop an image here</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Detection Results</h3>
                {(detections.length > 0 || (detectionResults && detectionResults.detections.length > 0)) && (
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium rounded-full">
                    {detections.length || detectionResults.detections.length} found
                  </span>
                )}
              </div>
              
              {(detections.length > 0 || (detectionResults && detectionResults.detections.length > 0)) ? (
                <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '500px' }}>
                  {(detections.length > 0 ? detections : detectionResults.detections).map((det, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getClassColor(det.class_name)} transition-all duration-200 hover:scale-[1.02] hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-bold capitalize">{det.class_name}</span>
                        </div>
                        <span className="font-bold text-lg">
                          {(det.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bounding Box:</span>
                          <span className="font-mono bg-gray-800 text-white px-2 py-1 rounded text-xs">
                            {det.bbox.map(n => n.toFixed(0)).join(', ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dimensions:</span>
                          <span className="font-medium">
                            {Math.abs(det.bbox[2] - det.bbox[0]).toFixed(0)} × {Math.abs(det.bbox[3] - det.bbox[1]).toFixed(0)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Confidence Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Confidence</span>
                          <span>{(det.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${det.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400" style={{ minHeight: '300px' }}>
                  <div className="w-12 h-12 mb-3">
                    <AlertCircle className="w-full h-full" />
                  </div>
                  <p className="text-lg font-medium mb-1">No detections yet</p>
                  <p className="text-center text-gray-500">
                    {imageSrc 
                      ? 'Click "Detect Objects" to analyze the image' 
                      : 'Upload an image first to see detection results'
                    }
                  </p>
                </div>
              )}
              
              {/* Stats Summary */}
              {(detections.length > 0 || (detectionResults && detectionResults.detections.length > 0)) && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-lg">
                      <p className="text-sm text-indigo-600 font-medium">Total Objects</p>
                      <p className="text-xl font-bold text-indigo-800">{detections.length || detectionResults.detections.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Avg Confidence</p>
                      <p className="text-xl font-bold text-purple-800">
                        {(((detections.length > 0 ? detections : detectionResults.detections).reduce((sum, d) => sum + d.confidence, 0) / 
                        (detections.length || detectionResults.detections.length)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 mb-8 text-center text-gray-500 text-sm bg-white rounded-xl p-4 shadow-md">
          <p>
            Using {modelInfo?.name || 'YOLOv8'} model trained on custom dataset.
            Detection confidence threshold: {modelInfo?.confidence * 100 || 25}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default ObjectDetector;