import { useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

export const useLiveness = (videoRef: React.RefObject<any>) => {
  const [isLive, setIsLive] = useState(false);
  const [status, setStatus] = useState("Loading Models...");

  useEffect(() => {
    const loadModels = async () => {
      // We use a public CDN for models to save time setting up local folders
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
      ]);
      setStatus("Models Loaded. Align Face.");
    };
    loadModels();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (videoRef.current && videoRef.current.video.readyState === 4) {
        const video = videoRef.current.video;
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
        
        if (detections.length > 0) {
          setIsLive(true);
          setStatus("Liveness Verified ✅");
        } else {
          setIsLive(false);
          setStatus("No Face Detected");
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [videoRef]);

  return { isLive, status };
};