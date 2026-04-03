"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  ageGroup: z.string().min(1, "Age group is required"),
  gender: z.string().min(1, "Gender is required"),
  height: z.string().optional(),
  weight: z.string().optional(),
  clothingSize: z.string().optional(),
  shoeSize: z.string().optional(),
  bodyShape: z.string().optional(),
  fitPreference: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const STYLE_AESTHETICS = ["Minimalist", "Classic", "Boho", "Romantic", "Streetwear", "Edgy", "Preppy", "Athleisure", "Y2K", "Cottagecore", "Grunge", "Luxe"];

export default function NewProfilePage() {
  const router = useRouter();
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState("");

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const toggleStyle = (s: string) => {
    setSelectedStyles((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s].slice(0, 5));
  };

  const addColor = () => {
    if (colorInput && !favoriteColors.includes(colorInput)) {
      setFavoriteColors((p) => [...p, colorInput].slice(0, 6));
      setColorInput("");
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          height: data.height ? parseFloat(data.height) : undefined,
          weight: data.weight ? parseFloat(data.weight) : undefined,
          stylePreference: selectedStyles,
          favoriteColors,
          favoriteBrands: [],
          dislikedColors: [],
        }),
      });
      router.push("/profiles");
    } catch {
      // handle error
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profiles">
            <Button variant="ghost" size="icon"><ArrowLeft size={18} /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">New Profile</h1>
            <p className="text-white/50">Add a style profile for a family member</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Profile Name *</Label>
                <Input placeholder="e.g., Emma" {...register("name")} />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Relationship *</Label>
                  <Select onValueChange={(v) => setValue("relationship", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {["self", "partner", "child", "parent", "sibling", "other"].map((r) => (
                        <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.relationship && <p className="text-red-400 text-xs">{errors.relationship.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Age Group *</Label>
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

              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select onValueChange={(v) => setValue("gender", v)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    {["female", "male", "non-binary", "prefer-not-to-say"].map((g) => (
                      <SelectItem key={g} value={g}>{g.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-red-400 text-xs">{errors.gender.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Body & Size</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input type="number" placeholder="165" {...register("height")} />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" placeholder="60" {...register("weight")} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Clothing Size</Label>
                  <Select onValueChange={(v) => setValue("clothingSize", v)}>
                    <SelectTrigger><SelectValue placeholder="Size" /></SelectTrigger>
                    <SelectContent>
                      {["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Shoe Size (EU)</Label>
                  <Input placeholder="37" {...register("shoeSize")} />
                </div>
                <div className="space-y-2">
                  <Label>Fit Preference</Label>
                  <Select onValueChange={(v) => setValue("fitPreference", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {["slim", "regular", "relaxed", "oversized"].map((f) => (
                        <SelectItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Body Shape</Label>
                <Select onValueChange={(v) => setValue("bodyShape", v)}>
                  <SelectTrigger><SelectValue placeholder="Select body shape" /></SelectTrigger>
                  <SelectContent>
                    {["hourglass", "pear", "apple", "rectangle", "inverted-triangle"].map((s) => (
                      <SelectItem key={s} value={s}>{s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Style Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="mb-3 block">Aesthetics (up to 5)</Label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_AESTHETICS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStyle(s)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        selectedStyles.includes(s)
                          ? "bg-purple-600/30 border-purple-500/50 text-purple-300"
                          : "border-white/20 text-white/60 hover:border-white/40"
                      }`}
                    >
                      {selectedStyles.includes(s) && <Check size={11} className="inline mr-1" />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Favorite Colors</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="e.g., navy, terracotta, cream"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                  />
                  <Button type="button" variant="outline" onClick={addColor}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {favoriteColors.map((c) => (
                    <span key={c} className="px-3 py-1 rounded-full text-sm bg-white/10 text-white/70 flex items-center gap-1">
                      {c}
                      <button type="button" onClick={() => setFavoriteColors((p) => p.filter((x) => x !== c))} className="text-white/40 hover:text-white">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Link href="/profiles" className="flex-1">
              <Button variant="outline" className="w-full">Cancel</Button>
            </Link>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Create Profile"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
