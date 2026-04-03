"use client";
import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useAR } from "@/hooks/use-ar";
import { Camera, CameraOff, Sparkles, Layers, RotateCcw, Download, AlertCircle } from "lucide-react";
import { MOCK_PRODUCTS } from "@/types/product";
import Image from "next/image";

export default function ARPage() {
  const { videoRef, canvasRef, isActive, isLoading, error, hasPermission, startCamera, stopCamera, takeScreenshot } = useAR();
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const handleScreenshot = () => {
    const dataUrl = takeScreenshot();
    if (dataUrl) setScreenshot(dataUrl);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">AR Try-On</h1>
              <span className="ai-badge"><Sparkles size={10} /> AI Visualization</span>
            </div>
            <p className="text-white/50">See clothes on you in real-time using your camera</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Camera */}
          <div className="md:col-span-2 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center border border-white/10">
              {isActive ? (
                <>
                  <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                  {/* AR Overlay simulation */}
                  {selectedProductId && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="opacity-60 w-48">
                        <div className="text-center text-xs text-purple-300 mb-2 ai-badge mx-auto w-fit">
                          <Sparkles size={8} /> AI Visualization
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs text-white/80">LIVE</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-8">
                  {hasPermission === false ? (
                    <div className="space-y-3">
                      <AlertCircle size={48} className="text-red-400 mx-auto" />
                      <p className="text-white/60">Camera access denied</p>
                      <p className="text-white/40 text-sm">Please allow camera access in your browser settings</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                        <Camera size={36} className="text-white/30" />
                      </div>
                      <div>
                        <p className="text-white/60 mb-1">Start your camera for AR try-on</p>
                        <p className="text-white/30 text-sm">Uses WebXR to overlay garments in real-time</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="flex gap-3">
              {!isActive ? (
                <Button className="flex-1 gap-2" onClick={startCamera} disabled={isLoading}>
                  {isLoading ? <><span className="animate-spin">⚡</span> Starting...</> : <><Camera size={18} /> Start Camera</>}
                </Button>
              ) : (
                <>
                  <Button variant="secondary" className="flex-1 gap-2" onClick={stopCamera}>
                    <CameraOff size={18} /> Stop
                  </Button>
                  <Button className="flex-1 gap-2" onClick={handleScreenshot}>
                    <Download size={18} /> Screenshot
                  </Button>
                </>
              )}
            </div>

            {screenshot && (
              <div className="space-y-2">
                <p className="text-sm text-white/60 flex items-center gap-1">
                  <Sparkles size={12} className="text-purple-400" /> Screenshot captured — AI Visualization
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={screenshot} alt="AR Screenshot" className="w-full rounded-xl" />
                <button
                  onClick={() => setScreenshot(null)}
                  className="text-xs text-white/40 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Clear
                </button>
              </div>
            )}
          </div>

          {/* Product selector */}
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Layers size={16} className="text-purple-400" />
                <h3 className="font-semibold text-sm">Select Garment</h3>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {MOCK_PRODUCTS.slice(0, 5).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProductId(product.id === selectedProductId ? null : product.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl border transition-all ${
                      selectedProductId === product.id
                        ? "border-purple-500/50 bg-purple-500/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{product.name}</p>
                      <p className="text-xs text-white/40">{product.brand}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 space-y-3 text-sm">
              <h3 className="font-semibold text-white/80">AR Mode Info</h3>
              <p className="text-white/50 text-xs leading-relaxed">
                AR Try-On uses WebXR to overlay garments on your body in real-time. For best results, ensure even lighting and stand 2-3m from the camera.
              </p>
              <div className="ai-badge w-fit">
                <Sparkles size={10} /> AI Visualization · Experimental
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
