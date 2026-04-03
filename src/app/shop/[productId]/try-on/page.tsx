"use client";
import { useState } from "react";
import Image from "next/image";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MOCK_PRODUCTS } from "@/types/product";
import { ArrowLeft, Sparkles, Loader2, Download, Share2, ThumbsUp, ThumbsDown, Camera } from "lucide-react";
import Link from "next/link";
import { generateTryonImage } from "@/lib/ai/tryon";

export default function TryOnPage({ params }: { params: { productId: string } }) {
  const product = MOCK_PRODUCTS.find((p) => p.id === params.productId) ?? MOCK_PRODUCTS[0];
  const [result, setResult] = useState<{ imageUrl: string; confidence: number; fitNotes: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedProfile] = useState("Sarah");

  const handleTryOn = async () => {
    setIsLoading(true);
    setProgress(0);
    setResult(null);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 8, 92));
    }, 250);

    try {
      const res = await generateTryonImage({
        productId: product.id,
        productImageUrl: product.images[0],
        profileId: "p1",
        variantColor: product.variants[0].color,
      });
      clearInterval(interval);
      setProgress(100);
      setResult(res);
    } catch {
      clearInterval(interval);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/shop/${product.id}`}>
            <Button variant="ghost" size="icon"><ArrowLeft size={18} /></Button>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">AI Try-On</h1>
            <span className="ai-badge"><Sparkles size={10} /> AI Visualization</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Product + Controls */}
          <div className="space-y-4">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="relative h-72">
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white/60 text-xs">{product.brand}</p>
                  <p className="font-semibold">{product.name}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-white/50">Profile</p>
                    <p className="font-semibold">{selectedProfile}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50">Estimated Size</p>
                    <p className="font-semibold text-purple-400">S · Slim fit</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50">Color</p>
                    <p className="font-semibold">{product.variants[0].color}</p>
                  </div>
                </div>

                {isLoading && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Generating AI try-on...</span>
                      <span className="text-purple-400">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                    <p className="text-xs text-white/30">Mapping garment to body model...</p>
                  </div>
                )}

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleTryOn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles size={18} /> Generate Try-On</>
                  )}
                </Button>
              </div>
            </div>

            {/* Fit notes */}
            {result && (
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold">Fit Analysis</h3>
                  <span className="ai-badge"><Sparkles size={10} /> AI Estimated</span>
                </div>
                <ul className="space-y-2">
                  {result.fitNotes.map((note) => (
                    <li key={note} className="flex items-center gap-2 text-sm text-white/70">
                      <span className="text-green-400">✓</span> {note}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-white/30 mt-3">
                  Confidence: {(result.confidence * 100).toFixed(0)}% · AI Visualization only
                </p>
              </div>
            )}
          </div>

          {/* Right: Result */}
          <div>
            {result ? (
              <div className="space-y-4">
                <div className="relative h-[500px] rounded-2xl overflow-hidden">
                  <Image src={result.imageUrl} alt="Try-on result" fill className="object-cover" />
                  <div className="absolute top-4 left-4">
                    <span className="ai-badge text-xs px-3 py-1">
                      <Sparkles size={10} /> AI Visualization
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2"><Download size={16} /> Save</Button>
                  <Button variant="outline" className="flex-1 gap-2"><Share2 size={16} /> Share</Button>
                  <Link href="/video-preview" className="flex-1">
                    <Button className="w-full gap-2"><Camera size={16} /> Make Video</Button>
                  </Link>
                </div>

                <div className="flex items-center gap-4 glass-card rounded-xl p-4">
                  <p className="text-sm text-white/60 flex-1">Was this try-on accurate?</p>
                  <button className="flex items-center gap-1 text-sm text-white/60 hover:text-green-400 transition-colors">
                    <ThumbsUp size={16} /> Yes
                  </button>
                  <button className="flex items-center gap-1 text-sm text-white/60 hover:text-red-400 transition-colors">
                    <ThumbsDown size={16} /> No
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[500px] glass-card rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={40} className="text-purple-400/40" />
                  </div>
                  <p className="text-white/40 text-sm mb-2">Click &quot;Generate Try-On&quot; to see how this looks on you</p>
                  <p className="text-purple-400/60 text-xs">AI Visualization · Powered by diffusion models</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
