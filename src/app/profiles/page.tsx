"use client";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Edit, Trash2, Camera, Sparkles } from "lucide-react";
import { getInitials } from "@/lib/utils";

const MOCK_PROFILES = [
  { id: "p1", name: "Sarah", relationship: "self", ageGroup: "adult", gender: "female", clothingSize: "S", bodyShape: "hourglass", stylePreference: ["Minimalist", "Classic"], avatarUrl: null, isActive: true },
  { id: "p2", name: "James", relationship: "partner", ageGroup: "adult", gender: "male", clothingSize: "M", bodyShape: "rectangle", stylePreference: ["Streetwear", "Athleisure"], avatarUrl: null, isActive: true },
  { id: "p3", name: "Lily", relationship: "child", ageGroup: "teen", gender: "female", clothingSize: "XS", bodyShape: "pear", stylePreference: ["Y2K", "Cottagecore"], avatarUrl: null, isActive: true },
];

export default function ProfilesPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Family Profiles</h1>
          <p className="text-white/50">Manage style profiles for everyone</p>
        </div>
        <Link href="/profiles/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} /> Add Profile
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_PROFILES.map((profile) => (
          <div key={profile.id} className="glass-card rounded-2xl p-6 hover:border-white/20 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl">
                  {getInitials(profile.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{profile.name}</h3>
                  <p className="text-white/50 text-sm capitalize">{profile.relationship} · {profile.ageGroup}</p>
                </div>
              </div>
              {profile.isActive && <Badge variant="secondary" className="text-[10px]">Active</Badge>}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Size</span>
                <span className="text-white font-medium">{profile.clothingSize}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Body Shape</span>
                <span className="text-white font-medium capitalize">{profile.bodyShape}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {profile.stylePreference.map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">{s}</span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/profiles/${profile.id}`} className="flex-1">
                <Button variant="secondary" size="sm" className="w-full gap-1">
                  <Edit size={13} /> Edit
                </Button>
              </Link>
              <Link href={`/profiles/${profile.id}/body-model`}>
                <Button size="sm" variant="outline" className="gap-1">
                  <Camera size={13} /> Body Model
                </Button>
              </Link>
              <button className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* Add new card */}
        <Link href="/profiles/new">
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-purple-500/30 transition-all cursor-pointer min-h-[220px] border-dashed">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
              <Plus size={24} className="text-white/40" />
            </div>
            <div className="text-center">
              <p className="font-medium text-white/70">Add Profile</p>
              <p className="text-sm text-white/40">For a family member or friend</p>
            </div>
          </div>
        </Link>
      </div>

      {/* AI tip */}
      <div className="mt-8 glass-card rounded-2xl p-5 flex items-center gap-4 border-purple-500/20">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles size={20} className="text-purple-400" />
        </div>
        <div>
          <p className="font-medium text-sm mb-0.5">AI Body Modeling Available</p>
          <p className="text-white/50 text-sm">
            Upload photos to automatically generate body measurements for each profile.{" "}
            <span className="text-purple-400">AI Estimated</span> measurements help find the perfect fit.
          </p>
        </div>
        <Link href="/profiles/p1/body-model" className="flex-shrink-0">
          <Button size="sm" variant="outline">Try Now</Button>
        </Link>
      </div>
    </DashboardLayout>
  );
}
