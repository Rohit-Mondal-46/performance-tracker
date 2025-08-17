import { useEffect, useRef } from "react";

function App() {
  const videoRef = useRef(null);

  useEffect(() => {
    async function enableCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    enableCamera();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <video ref={videoRef} autoPlay playsInline className="rounded-xl shadow-lg w-[600px] h-[400px]" />
    </div>
  );
}

export default App;
