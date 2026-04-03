"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PRODUCTS } from "@/types/product";
import { Sparkles, Camera, Users, ShoppingBag, TrendingUp, Heart, Star, ArrowRight, Zap } from "lucide-react";
import Image from "next/image";

const STATS = [
  { label: "Profiles", value: "3", icon: Users, change: "+1 this month" },
  { label: "Try-Ons", value: "47", icon: Camera, change: "12 this week" },
  { label: "Saved Items", value: "23", icon: Heart, change: "+5 this week" },
  { label: "AI Sessions", value: "8", icon: Sparkles, change: "Active today" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const featuredProducts = MOCK_PRODUCTS.slice(0, 3);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">
            Good morning, {session?.user?.name?.split(" ")[0] ?? "Fashionista"} 👋
          </h1>
        </div>
        <p className="text-white/50">Your AI-powered fashion dashboard</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { href: "/ar", label: "AR Try-On", icon: Camera, color: "from-purple-600 to-pink-600" },
          { href: "/shop", label: "Shop Now", icon: ShoppingBag, color: "from-blue-600 to-cyan-600" },
          { href: "/stylist", label: "AI Stylist", icon: Sparkles, color: "from-yellow-600 to-orange-600" },
          { href: "/profiles/new", label: "Add Profile", icon: Users, color: "from-green-600 to-teal-600" },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 flex flex-col items-center gap-3 hover:scale-105 transition-transform cursor-pointer shadow-lg`}>
              <Icon size={24} className="text-white" />
              <span className="text-white font-semibold text-sm text-center">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, icon: Icon, change }) => (
          <Card key={label} className="hover:border-white/20 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <Icon size={18} className="text-purple-400" />
                </div>
                <Badge variant="secondary" className="text-[10px]">{change}</Badge>
              </div>
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-sm text-white/50 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* AI Recommendations */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">AI Recommendations</h2>
              <span className="ai-badge"><Sparkles size={10} /> AI Estimated</span>
            </div>
            <Link href="/shop" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`}>
                <div className="glass-card rounded-xl overflow-hidden hover:border-white/20 transition-all group">
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.isNew && (
                      <span className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-white/40 mb-0.5">{product.brand}</p>
                    <p className="text-sm font-medium text-white truncate">{product.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-purple-400 font-bold text-sm">${product.variants[0].price}</span>
                      <div className="flex items-center gap-1">
                        <Star size={11} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-white/50">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* AI Stylist CTA */}
          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                <CardTitle className="text-base">AI Stylist Ready</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm mb-4">
                Get personalized outfit advice based on your style DNA and body analysis.
              </p>
              <Link href="/stylist">
                <Button className="w-full" size="sm">
                  Chat with Stylist <Zap size={14} />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Trending */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-green-400" />
                <CardTitle className="text-base">Trending Now</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_PRODUCTS.filter((p) => p.isTrending).slice(0, 3).map((p) => (
                <Link key={p.id} href={`/shop/${p.id}`} className="flex items-center gap-3 group">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-purple-400 transition-colors">{p.name}</p>
                    <p className="text-xs text-white/40">{p.brand}</p>
                  </div>
                  <span className="text-purple-400 font-semibold text-sm">${p.variants[0].price}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
