"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_PRODUCTS, MockProduct } from "@/types/product";
import { Search, SlidersHorizontal, Heart, Star, Camera, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const CATEGORIES = ["All", "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || p.category.toLowerCase() === activeCategory.toLowerCase();
    return matchSearch && matchCat;
  });

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next;
    });
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Shop</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-white/50">AI-curated fashion picks</p>
            <span className="ai-badge"><Sparkles size={10} /> AI Estimated</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select>
          <SelectTrigger className="w-40">
            <SlidersHorizontal size={14} className="mr-1" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all flex-shrink-0 ${
              activeCategory === cat
                ? "bg-purple-600/30 border-purple-500/50 text-purple-300"
                : "border-white/20 text-white/60 hover:border-white/40 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            saved={savedIds.has(product.id)}
            onToggleSave={() => toggleSave(product.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-white/40">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No products found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </DashboardLayout>
  );
}

function ProductCard({
  product,
  saved,
  onToggleSave,
}: {
  product: MockProduct;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const lowestPrice = Math.min(...product.variants.map((v) => v.price));

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover:border-white/20 transition-all group">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="absolute top-3 left-3 flex gap-2">
          {product.isNew && <Badge className="bg-purple-600 text-white border-0 text-[10px]">NEW</Badge>}
          {product.isTrending && <Badge className="bg-yellow-600/80 text-white border-0 text-[10px]">TRENDING</Badge>}
        </div>

        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={onToggleSave}
            className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
              saved ? "bg-red-500 text-white" : "bg-black/40 text-white/70 hover:bg-black/60"
            }`}
          >
            <Heart size={14} className={saved ? "fill-current" : ""} />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/shop/${product.id}/try-on`} className="flex-1">
            <Button size="sm" className="w-full gap-1 text-xs py-1.5">
              <Camera size={12} /> Try On
            </Button>
          </Link>
          <Link href={`/shop/${product.id}`} className="flex-1">
            <Button size="sm" variant="secondary" className="w-full text-xs py-1.5">View</Button>
          </Link>
        </div>
      </div>

      <div className="p-4">
        <p className="text-white/40 text-xs mb-0.5">{product.brand}</p>
        <Link href={`/shop/${product.id}`}>
          <h3 className="font-semibold text-sm text-white group-hover:text-purple-400 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-white">{formatPrice(lowestPrice)}</span>
            <span className="text-white/40 text-xs ml-1">from</span>
          </div>
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-white/60 text-xs">{product.rating} ({product.reviewCount})</span>
            </div>
          )}
        </div>

        <div className="flex gap-1 mt-2">
          {product.variants.slice(0, 4).map((v) => (
            <div
              key={v.id}
              className="w-5 h-5 rounded-full border-2 border-white/20 flex-shrink-0"
              style={{ backgroundColor: v.colorHex ?? "#888" }}
              title={v.color ?? ""}
            />
          ))}
          {product.variants.length > 4 && (
            <span className="text-white/30 text-xs self-center">+{product.variants.length - 4}</span>
          )}
        </div>
      </div>
    </div>
  );
}
