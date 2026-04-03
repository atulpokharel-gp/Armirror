"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PRODUCTS } from "@/types/product";
import { ArrowLeft, Star, Heart, Camera, ShoppingBag, Check, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function ProductDetailPage({ params }: { params: { productId: string } }) {
  const product = MOCK_PRODUCTS.find((p) => p.id === params.productId) ?? MOCK_PRODUCTS[0];
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [saved, setSaved] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const images = [product.images[0], product.images[0], product.images[0]]; // mock multiple images

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/shop">
            <Button variant="ghost" size="icon"><ArrowLeft size={18} /></Button>
          </Link>
          <nav className="text-sm text-white/40">
            <span>Shop</span> / <span className="capitalize">{product.category}</span> / <span className="text-white">{product.name}</span>
          </nav>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative h-[500px] rounded-2xl overflow-hidden">
              <Image src={images[activeImage]} alt={product.name} fill className="object-cover" />
              {product.isNew && (
                <Badge className="absolute top-4 left-4 bg-purple-600 border-0">NEW ARRIVAL</Badge>
              )}
            </div>
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === i ? "border-purple-500" : "border-white/10"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-white/50 text-sm mb-1">{product.brand}</p>
              <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className={i < Math.floor(product.rating!) ? "fill-yellow-400 text-yellow-400" : "text-white/20"} />
                    ))}
                  </div>
                  <span className="text-white/60 text-sm">{product.rating} ({product.reviewCount} reviews)</span>
                </div>
              )}

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">{formatPrice(selectedVariant.price)}</span>
                {product.isTrending && (
                  <Badge variant="gold">🔥 Trending</Badge>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-white/70 mb-3">
                Color: <span className="text-white">{selectedVariant.color}</span>
              </p>
              <div className="flex gap-3">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                      selectedVariant.id === v.id ? "border-purple-500 scale-110" : "border-white/20"
                    }`}
                    style={{ backgroundColor: v.colorHex ?? "#888" }}
                    title={v.color ?? ""}
                  >
                    {selectedVariant.id === v.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check size={14} className="text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-white/70 mb-3">Size</p>
              <div className="flex gap-2 flex-wrap">
                {["XS", "S", "M", "L", "XL"].map((s) => (
                  <button
                    key={s}
                    className={`w-12 h-12 rounded-xl border text-sm font-medium transition-all ${
                      selectedVariant.size === s
                        ? "bg-purple-600/30 border-purple-500 text-purple-300"
                        : "border-white/20 text-white/60 hover:border-white/40"
                    }`}
                    onClick={() => {
                      const v = product.variants.find((vv) => vv.size === s);
                      if (v) setSelectedVariant(v);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/40 mt-2 flex items-center gap-1">
                <Sparkles size={10} /> AI Estimated – your size based on body model
              </p>
            </div>

            <div className="flex gap-3">
              <Link href={`/shop/${product.id}/try-on`} className="flex-1">
                <Button size="lg" className="w-full gap-2">
                  <Camera size={18} /> AI Try-On
                </Button>
              </Link>
              <Button size="lg" variant="secondary" className="flex-1 gap-2">
                <ShoppingBag size={18} /> Add to Bag
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setSaved(!saved)}
                className="h-12 w-12"
              >
                <Heart size={18} className={saved ? "fill-red-400 text-red-400" : ""} />
              </Button>
            </div>

            <div className="glass-card rounded-xl p-4 space-y-2 text-sm">
              <p className="text-white/70">{product.description}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-xs">{tag}</span>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-400">
                <Check size={14} /> Free returns within 30 days
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <ShoppingBag size={14} /> Find best price →{" "}
                <Link href="/prices" className="text-purple-400 underline">Compare stores</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
