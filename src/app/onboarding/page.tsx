"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Sparkles, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const profileSchema = z.object({
  name: z.string().min(2, "Name required"),
  relationship: z.string().min(1, "Please select a relationship"),
  ageGroup: z.string().min(1, "Please select an age group"),
  gender: z.string().min(1, "Please select a gender"),
  height: z.string().optional(),
  clothingSize: z.string().optional(),
  bodyShape: z.string().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

const STEPS = ["Welcome", "Profile", "Style", "Done"];

const AESTHETICS = ["Minimalist", "Boho", "Streetwear", "Classic", "Romantic", "Athleisure", "Preppy", "Edgy", "Cottagecore", "Y2K"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { relationship: "self" },
  });

  const toggleAesthetic = (a: string) => {
    setSelectedAesthetics((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a].slice(0, 5)
    );
  };

  const onSubmit = async (data: ProfileData) => {
    setIsLoading(true);
    try {
      await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, stylePreference: selectedAesthetics }),
      });
      setStep(3);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? "bg-green-500 text-white" :
                i === step ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" :
                "bg-white/10 text-white/40"
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i === step ? "text-white" : "text-white/40"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-8 sm:w-16 h-px bg-white/10 mx-1" />}
            </div>
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
              <Zap size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Welcome to StyleMirror</h1>
            <p className="text-white/60 mb-8 leading-relaxed">
              Let&apos;s set up your personalized AI fashion experience.
              This takes about 2 minutes.
            </p>
            <div className="space-y-3 text-left mb-8">
              {[
                "Create profiles for you and your family",
                "AI body modeling for perfect fit predictions",
                "Color analysis for your most flattering looks",
                "Personalized style recommendations",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-green-400" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
            <Button size="lg" className="w-full" onClick={() => setStep(1)}>
              Get Started <ArrowRight size={18} />
            </Button>
          </div>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-2">Create Your First Profile</h2>
            <p className="text-white/60 text-sm mb-6">You can add more profiles for family members later.</p>

            <form className="space-y-5">
              <div className="space-y-2">
                <Label>Profile Name</Label>
                <Input placeholder="e.g., Sarah" {...register("name")} />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Select onValueChange={(v) => setValue("relationship", v)} defaultValue="self">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["self", "partner", "child", "parent", "sibling", "other"].map((r) => (
                        <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Age Group</Label>
                  <Select onValueChange={(v) => setValue("ageGroup", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {["child", "teen", "adult", "senior"].map((a) => (
                        <SelectItem key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.ageGroup && <p className="text-red-400 text-xs">{errors.ageGroup.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select onValueChange={(v) => setValue("gender", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {["female", "male", "non-binary", "prefer-not-to-say"].map((g) => (
                        <SelectItem key={g} value={g}>{g.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-red-400 text-xs">{errors.gender.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input type="number" placeholder="e.g., 165" {...register("height")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Clothing Size</Label>
                  <Select onValueChange={(v) => setValue("clothingSize", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Body Shape</Label>
                  <Select onValueChange={(v) => setValue("bodyShape", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {["hourglass", "pear", "apple", "rectangle", "inverted-triangle"].map((s) => (
                        <SelectItem key={s} value={s}>{s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(2)}>Continue <ArrowRight size={16} /></Button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Style */}
        {step === 2 && (
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">Your Style DNA</h2>
              <span className="ai-badge"><Sparkles size={10} /> AI Estimated</span>
            </div>
            <p className="text-white/60 text-sm mb-6">Pick up to 5 aesthetics that resonate with you.</p>

            <div className="flex flex-wrap gap-3 mb-8">
              {AESTHETICS.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAesthetic(a)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    selectedAesthetics.includes(a)
                      ? "bg-purple-600/30 border-purple-500/50 text-purple-300"
                      : "border-white/20 text-white/60 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {selectedAesthetics.includes(a) && <Check size={12} className="inline mr-1" />}
                  {a}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button
                className="flex-1"
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Complete Setup"} {!isLoading && <ArrowRight size={16} />}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">You&apos;re all set!</h2>
            <p className="text-white/60">Redirecting you to your dashboard...</p>
            <div className="mt-6 flex justify-center">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
