"use client";
import { useState } from "react";
import Image from "next/image";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MOCK_PRODUCTS } from "@/types/product";
import { Sparkles, Loader2, Play, Download, Music, RotateCcw } from "lucide-react";

const VIDEO_STYLES = [
  { id: "runway", label: "Runway Walk", icon: "🚶‍♀️" },
  { id: "casual", label: "Casual Spin", icon: "💃" },
  { id: "360", label: "360° View", icon: "🔄" },
];

export default function VideoPreviewPage() {
  const product = MOCK_PRODUCTS[0];
  const [selectedStyle, setSelectedStyle] = useState("runway");
  const [withMusic, setWithMusic] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [previewImage] = useState("https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setVideoReady(false);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) { clearInterval(interval); return p; }
        return p + 5;
      });
    }, 200);

    await new Promise((r) => setTimeout(r, 4000));
    clearInterval(interval);
    setProgress(100);
    setIsGenerating(false);
    setVideoReady(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Video Preview</h1>
              <span className="ai-badge"><Sparkles size={10} /> AI Visualization</span>
            </div>
            <p className="text-white/50">Generate a fashion video of your try-on</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-5">
            {/* Product preview */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="relative h-40">
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-xs text-white/60">{product.brand}</p>
                  <p className="font-medium text-sm">{product.name}</p>
                </div>
              </div>
            </div>

            {/* Style selection */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold mb-3">Video Style</h3>
              <div className="grid grid-cols-3 gap-3">
                {VIDEO_STYLES.map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedStyle(id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      selectedStyle === id
                        ? "border-purple-500/50 bg-purple-500/10"
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="text-xs text-white/70">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold">Options</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music size={16} className="text-white/60" />
                  <span className="text-sm text-white/70">Background Music</span>
                </div>
                <button
                  onClick={() => setWithMusic(!withMusic)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${withMusic ? "bg-purple-600" : "bg-white/20"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${withMusic ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Generating AI video...</span>
                  <span className="text-purple-400">{progress}%</span>
                </div>
                <Progress value={progress} />
                <p className="text-xs text-white/30">Synthesizing motion from body model...</p>
              </div>
            )}

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <><Loader2 size={18} className="animate-spin" /> Generating Video...</>
              ) : (
                <><Sparkles size={18} /> Generate AI Video</>
              )}
            </Button>
          </div>

          {/* Video result */}
          <div>
            {videoReady ? (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-black">
                  <Image src={previewImage} alt="Video preview" width={600} height={450} className="w-full opacity-90" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="ai-badge text-xs">
                      <Sparkles size={10} /> AI Visualization
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/20 rounded-full">
                    <div className="h-full w-1/3 bg-purple-500 rounded-full" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2"><Download size={16} /> Download</Button>
                  <Button variant="secondary" className="flex-1 gap-2" onClick={() => { setVideoReady(false); setProgress(0); }}>
                    <RotateCcw size={16} /> Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] glass-card rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Play size={40} className="text-purple-400/40" />
                  </div>
                  <p className="text-white/40 text-sm mb-2">Select a style and click Generate to create your AI fashion video</p>
                  <p className="text-purple-400/60 text-xs">AI Visualization · Powered by video diffusion</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
