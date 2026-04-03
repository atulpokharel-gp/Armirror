"use client";
import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Sparkles, Ruler, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useBodyModel } from "@/hooks/use-body-model";

export default function BodyModelPage({ params }: { params: { id: string } }) {
  const { estimation, isLoading, error, progress, estimateFromPhoto } = useBodyModel(params.id);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [heightInput, setHeightInput] = useState("165");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleAnalyze = async () => {
    if (!previewUrl) return;
    await estimateFromPhoto(previewUrl, parseFloat(heightInput) || 165);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/profiles/${params.id}`}>
            <Button variant="ghost" size="icon"><ArrowLeft size={18} /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Body Modeling</h1>
              <span className="ai-badge"><Sparkles size={10} /> AI Visualization</span>
            </div>
            <p className="text-white/50">AI-powered body measurement estimation</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload size={16} /> Upload Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors hover:border-purple-500/50 ${
                    previewUrl ? "border-purple-500/40" : "border-white/20"
                  } min-h-[220px] flex items-center justify-center`}
                >
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                  ) : (
                    <div className="text-center p-6">
                      <Upload size={32} className="text-white/30 mx-auto mb-3" />
                      <p className="text-white/60 text-sm font-medium">Click to upload a full-body photo</p>
                      <p className="text-white/30 text-xs mt-1">Stand straight, arms slightly out</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                <div className="space-y-2">
                  <label className="text-sm text-white/70">Known height (cm)</label>
                  <input
                    type="number"
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value)}
                    className="w-full h-10 rounded-lg border border-white/20 bg-white/5 px-3 text-sm text-white"
                    placeholder="165"
                  />
                </div>

                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">AI Analysis in progress...</span>
                      <span className="text-purple-400">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                    <p className="text-xs text-white/40">Detecting pose keypoints and estimating measurements</p>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleAnalyze}
                  disabled={!previewUrl || isLoading}
                >
                  {isLoading ? (
                    <><span className="animate-spin mr-2">⚡</span> Analyzing...</>
                  ) : (
                    <><Sparkles size={16} /> Analyze Body</>
                  )}
                </Button>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-sm mb-3 text-white/80">Photo Tips</h3>
                <ul className="space-y-2 text-xs text-white/50">
                  {[
                    "Wear form-fitting clothes",
                    "Stand against a plain background",
                    "Keep arms slightly away from body",
                    "Ensure good, even lighting",
                    "Take a full-body shot from 6 feet away",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Results panel */}
          <div>
            {estimation ? (
              <div className="space-y-4">
                <Card className="border-green-500/20">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle size={18} className="text-green-400" />
                      <span className="font-semibold text-green-400">Analysis Complete</span>
                      <span className="ml-auto text-sm text-white/50">
                        {(estimation.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <div className="ai-badge mb-4">
                      <Sparkles size={10} /> AI Estimated Measurements
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Chest", value: estimation.measurements.chest, unit: "cm" },
                        { label: "Waist", value: estimation.measurements.waist, unit: "cm" },
                        { label: "Hip", value: estimation.measurements.hip, unit: "cm" },
                        { label: "Shoulder", value: estimation.measurements.shoulder, unit: "cm" },
                        { label: "Inseam", value: estimation.measurements.inseam, unit: "cm" },
                        { label: "Arm Length", value: estimation.measurements.armLength, unit: "cm" },
                      ].map(({ label, value, unit }) => (
                        <div key={label} className="bg-white/5 rounded-lg p-3 text-center">
                          <p className="text-white/40 text-xs mb-1">{label}</p>
                          <p className="text-xl font-bold text-purple-400">{value ?? "—"}</p>
                          <p className="text-white/30 text-xs">{unit}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <p className="text-sm text-white/70">
                        <strong className="text-white">Body Shape: </strong>
                        <span className="capitalize">{estimation.bodyShape}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Recommended Sizes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { brand: "Generic", top: "S", bottom: "S", dress: "S" },
                        { brand: "US Sizing", top: "4", bottom: "4", dress: "4" },
                        { brand: "EU Sizing", top: "36", bottom: "36", dress: "36" },
                      ].map(({ brand, top, bottom, dress }) => (
                        <div key={brand} className="flex items-center justify-between text-sm">
                          <span className="text-white/60">{brand}</span>
                          <div className="flex gap-3">
                            <span>Top: <strong className="text-purple-400">{top}</strong></span>
                            <span>Bottom: <strong className="text-purple-400">{bottom}</strong></span>
                            <span>Dress: <strong className="text-purple-400">{dress}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-white/30 mt-3 flex items-center gap-1">
                      <Sparkles size={10} /> AI Estimated · may vary by brand
                    </p>
                  </CardContent>
                </Card>

                <Button variant="outline" className="w-full gap-2">
                  <Ruler size={16} /> Save Measurements
                </Button>
              </div>
            ) : (
              <Card className="h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Ruler size={32} className="text-purple-400/50" />
                  </div>
                  <p className="text-white/40 text-sm">
                    Upload a photo and click &quot;Analyze Body&quot; to see your AI-estimated measurements here.
                  </p>
                  <p className="text-xs text-purple-400 mt-2">AI Visualization</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
