import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, RotateCcw, CheckCircle } from 'lucide-react';

const videoConstraints = {
  width: 480,
  height: 360,
  facingMode: 'user',
};

function WebcamCapture({ onCapture, capturedImage, onRetake }) {
  const webcamRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc && onCapture) {
        onCapture(imageSrc);
      }
    }
  }, [onCapture]);

  // Convert base64 data URL to Blob
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  if (capturedImage) {
    return (
      <div className="relative animate-scale-in">
        <div className="rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10">
          <img
            src={capturedImage}
            alt="Captured face"
            className="w-full h-auto"
          />
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1.5 bg-emerald-500/90 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
              <CheckCircle className="w-3.5 h-3.5" />
              Captured
            </div>
          </div>
        </div>
        <button
          onClick={onRetake}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-dark-700/60 hover:bg-dark-600/60 border border-dark-600 rounded-xl text-dark-300 hover:text-dark-100 text-sm font-medium transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Retake Photo
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden border border-dark-600/50 shadow-lg bg-dark-800">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.92}
          videoConstraints={videoConstraints}
          onUserMedia={() => setIsCameraReady(true)}
          onUserMediaError={() => setIsCameraReady(false)}
          className="w-full h-auto"
          mirrored={true}
        />

        {/* Face guide overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-60 border-2 border-dashed border-primary-400/40 rounded-[40%]" />
        </div>

        {/* Camera indicator */}
        {isCameraReady && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-dark-900/70 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Live
          </div>
        )}
      </div>

      <button
        onClick={capture}
        disabled={!isCameraReady}
        className="mt-3 w-full gradient-btn flex items-center justify-center gap-2"
      >
        <Camera className="w-5 h-5" />
        Capture Photo
      </button>

      {!isCameraReady && (
        <p className="text-dark-500 text-xs text-center mt-2">
          Waiting for camera access...
        </p>
      )}
    </div>
  );
}

// Helper: convert base64 to blob (exported for use by other components)
export function base64ToBlob(base64Data) {
  const arr = base64Data.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export default WebcamCapture;
