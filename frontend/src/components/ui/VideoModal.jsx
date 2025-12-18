import React, { useEffect } from "react";
import { X } from "lucide-react";

function VideoModal({ isOpen, onClose, videoSrc }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-gray-800">
            <h3 className="text-lg font-semibold text-white">
              VISTA AI Demo
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Video */}
          <div className="relative">
            <video
              className="w-full"
              controls
              autoPlay
              src={videoSrc}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </>
  );
}

export default VideoModal;