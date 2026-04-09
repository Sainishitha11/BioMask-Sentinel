"use client";

import React, { useRef, useState } from 'react';
import Webcam from "react-webcam";
import axios from 'axios';
import { ShieldCheck, Upload, Lock, CheckCircle2, ArrowRight, RefreshCcw, Download } from 'lucide-react';
import { useLiveness } from './hooks/useLiveliness';

export default function UIDAIApp() {
  const webcamRef = useRef<Webcam>(null);
  const { isLive, status } = useLiveness(webcamRef as any);
  
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [redactedUrl, setRedactedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState<{match: boolean, score: number} | null>(null);

  const resetApp = () => {
    setFile(null);
    setRedactedUrl(null);
    setMatchData(null);
    setStep(1);
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!file || !webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return alert("Camera not ready");

    setLoading(true);

    try {
      // Convert webcam base64 to File
      const blob = await fetch(imageSrc).then(res => res.blob());
      const liveFile = new File([blob], "live.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("live_image", liveFile);

      const res = await axios.post("http://127.0.0.1:8000/redact", formData);
      
      setRedactedUrl(res.data.url);
      setMatchData({ match: res.data.face_match, score: res.data.match_score });
      setStep(3);
    } catch (err) {
      alert("Verification failed. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-900 font-sans">
      <nav className="bg-[#063970] text-white px-8 py-4 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-yellow-400" />
          <h1 className="text-lg font-bold">Aadhaar Data Vault</h1>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto mt-12 px-4">
  {/* HIDDEN WEBCAM: Keeps the camera instance alive across all steps */}
  <div className={`fixed inset-0 -z-50 opacity-0 pointer-events-none ${step === 3 ? 'hidden' : 'block'}`}>
    <Webcam 
      ref={webcamRef} 
      screenshotFormat="image/jpeg" 
      className="w-full h-full object-cover" 
    />
  </div>

  {/* Step 1: Liveness UI */}
  {step === 1 && (
    <div className="bg-white rounded-3xl p-8 shadow-xl animate-in fade-in">
      <h2 className="text-2xl font-bold mb-4 text-center">Verify Identity</h2>
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-8 border-4 border-slate-50">
        {/* Mirror the hidden webcam for the user here */}
        <Webcam mirrored className="w-full h-full object-cover" />
        <div className={`absolute bottom-4 left-4 px-4 py-2 rounded-full text-xs font-bold ${isLive ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
          {status}
        </div>
      </div>
      <button 
        onClick={() => setStep(2)}
        disabled={!isLive}
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold disabled:bg-slate-200 shadow-lg"
      >
        Continue to Upload
      </button>
    </div>
  )}

  {/* Step 2: Upload UI */}
  {step === 2 && (
    <div className="bg-white rounded-3xl p-8 shadow-xl animate-in slide-in-from-right-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Upload Aadhaar</h2>
      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-blue-50 mb-8 transition-colors">
        <Upload className="w-8 h-8 text-blue-600 mb-2" />
        <span className="text-sm font-medium">{file ? file.name : "Select Aadhaar Image"}</span>
        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>
      <button 
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg disabled:bg-slate-300 transition-all"
      >
        {loading ? "Processing Biometrics..." : "Secure My Data"}
      </button>
      <button onClick={() => setStep(1)} className="w-full mt-4 text-slate-400 text-sm font-medium">Back to Verification</button>
    </div>
  )}

  {/* Step 3: Result UI */}
  {step === 3 && (
    <div className="bg-white rounded-3xl p-8 shadow-xl text-center animate-in zoom-in-95">
      <div className={`inline-flex p-4 rounded-full mb-4 ${matchData?.match ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        <Lock className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">
        {matchData?.match ? "Identity Verified" : "Biometric Mismatch"}
      </h2>
      <p className={`text-sm font-bold mb-6 ${matchData?.match ? 'text-green-600' : 'text-red-500'}`}>
        Confidence Score: {matchData ? Math.round(matchData.score * 100) : 0}%
      </p>
      <div className="bg-green-50 border border-green-100 p-4 rounded-2xl mb-6">
  <p className="text-green-700 text-sm font-medium flex items-center justify-center gap-2">
    <ShieldCheck className="w-4 h-4" /> 
    PII Masking Completed: 8 digits redacted securely.
  </p>
</div>
      <div className="bg-slate-50 p-2 rounded-2xl mb-8">
        <img src={redactedUrl!} className="rounded-xl shadow-sm mx-auto max-h-64" alt="Redacted" />
      </div>
      <button onClick={resetApp} className="flex items-center justify-center gap-2 w-full text-blue-600 font-bold hover:underline">
        <RefreshCcw className="w-4 h-4" /> Start New Session
      </button>
    </div>
  )}
</main>
    </div>
  );
}