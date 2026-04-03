"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Camera, Sparkles, Ruler, Palette } from "lucide-react";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

const MOCK_PROFILE = {
  id: "p1",
  name: "Sarah",
  relationship: "self",
  ageGroup: "adult",
  gender: "female",
  height: 165,
  weight: 58,
  clothingSize: "S",
  shoeSize: "37",
  bodyShape: "hourglass",
  fitPreference: "slim",
  stylePreference: ["Minimalist", "Classic", "Romantic"],
  favoriteBrands: ["Vêtement Studio", "Eco Luxe", "Maison Atelier"],
  favoriteColors: ["Cream", "Navy", "Blush Rose"],
  dislikedColors: ["Neon", "Orange"],
  avatarUrl: null,
};

const MOCK_MEASUREMENTS = {
  chest: 86,
  waist: 67,
  hip: 92,
  shoulder: 37,
  inseam: 78,
  unit: "cm",
  confidence: 0.91,
};

export default function ProfileDetailPage({ params }: { params: { id: string } }) {
  void params;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profiles">
            <Button variant="ghost" size="icon"><ArrowLeft size={18} /></Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{MOCK_PROFILE.name}&apos;s Profile</h1>
            <p className="text-white/50 capitalize">{MOCK_PROFILE.relationship} · {MOCK_PROFILE.ageGroup}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2"><Edit size={14} /> Edit</Button>
        </div>

        {/* Avatar & quick info */}
        <div className="glass-card rounded-2xl p-6 mb-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {getInitials(MOCK_PROFILE.name)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">{MOCK_PROFILE.name}</h2>
              <Badge variant="secondary" className="capitalize">{MOCK_PROFILE.relationship}</Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-white/60">
              <span>Size: <strong className="text-white">{MOCK_PROFILE.clothingSize}</strong></span>
              <span>Height: <strong className="text-white">{MOCK_PROFILE.height}cm</strong></span>
              <span>Shape: <strong className="text-white capitalize">{MOCK_PROFILE.bodyShape}</strong></span>
              <span>Fit: <strong className="text-white capitalize">{MOCK_PROFILE.fitPreference}</strong></span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link href={`/profiles/${MOCK_PROFILE.id}/body-model`}>
              <Button size="sm" className="gap-1 w-full"><Camera size={14} /> Body Model</Button>
            </Link>
            <Link href="/ar">
              <Button size="sm" variant="outline" className="gap-1 w-full"><Camera size={14} /> AR Try-On</Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="measurements">
          <TabsList className="mb-6">
            <TabsTrigger value="measurements"><Ruler size={14} className="mr-1" /> Measurements</TabsTrigger>
            <TabsTrigger value="style"><Sparkles size={14} className="mr-1" /> Style</TabsTrigger>
            <TabsTrigger value="colors"><Palette size={14} className="mr-1" /> Colors</TabsTrigger>
          </TabsList>

          <TabsContent value="measurements">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="font-semibold text-lg">Body Measurements</h3>
                <span className="ai-badge"><Sparkles size={10} /> AI Estimated</span>
                <span className="ml-auto text-sm text-white/50">Confidence: {(MOCK_MEASUREMENTS.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Chest", value: MOCK_MEASUREMENTS.chest },
                  { label: "Waist", value: MOCK_MEASUREMENTS.waist },
                  { label: "Hip", value: MOCK_MEASUREMENTS.hip },
                  { label: "Shoulder", value: MOCK_MEASUREMENTS.shoulder },
                  { label: "Inseam", value: MOCK_MEASUREMENTS.inseam },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-white/50 text-xs mb-1">{label}</p>
                    <p className="text-2xl font-bold text-purple-400">{value}</p>
                    <p className="text-white/40 text-xs">cm</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-300 flex items-center gap-2">
                <Sparkles size={14} />
                AI Estimated measurements — update by re-scanning in Body Model.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style">
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Style Aesthetics</h3>
                <div className="flex flex-wrap gap-2">
                  {MOCK_PROFILE.stylePreference.map((s) => (
                    <span key={s} className="px-3 py-1.5 rounded-full text-sm bg-purple-500/20 border border-purple-500/30 text-purple-300">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Favorite Brands</h3>
                <div className="flex flex-wrap gap-2">
                  {MOCK_PROFILE.favoriteBrands.map((b) => (
                    <span key={b} className="px-3 py-1.5 rounded-full text-sm bg-white/10 border border-white/20 text-white/70">{b}</span>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors">
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Favorite Colors</h3>
                <div className="flex flex-wrap gap-3">
                  {MOCK_PROFILE.favoriteColors.map((c) => (
                    <div key={c} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
                      <span className="text-sm text-white/70">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Colors to Avoid</h3>
                <div className="flex flex-wrap gap-3">
                  {MOCK_PROFILE.dislikedColors.map((c) => (
                    <div key={c} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                      <span className="text-sm text-red-400">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-300 flex items-center gap-2">
                <Palette size={14} />
                Run color analysis to get AI-powered skin tone recommendations.
                <Link href="/profiles/p1/body-model" className="ml-auto underline">Analyze</Link>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
