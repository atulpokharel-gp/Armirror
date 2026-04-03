"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { MOCK_PRODUCTS } from "@/types/product";
import { Heart, Trash2, Camera, ShoppingBag, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function SavedPage() {
  const [saved, setSaved] = useState(MOCK_PRODUCTS.slice(0, 4).map((p) => ({ ...p, savedAt: new Date() })));

  const removeItem = (id: string) => {
    setSaved((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Saved Items</h1>
          <p className="text-white/50">{saved.length} items saved</p>
        </div>
        {saved.length > 0 && (
          <Button variant="outline" size="sm">Share Wishlist</Button>
        )}
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-24">
          <Heart size={56} className="mx-auto text-white/20 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No saved items yet</h3>
          <p className="text-white/50 mb-6">Browse our shop and save items you love</p>
          <Link href="/shop">
            <Button className="gap-2">Browse Shop <ArrowRight size={16} /></Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {saved.map((product) => (
            <div key={product.id} className="glass-card rounded-2xl overflow-hidden hover:border-white/20 transition-all group">
              <div className="relative h-48 overflow-hidden">
                <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                <button
                  onClick={() => removeItem(product.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-4">
                <p className="text-white/40 text-xs mb-0.5">{product.brand}</p>
                <p className="font-medium text-sm text-white mb-2 line-clamp-2">{product.name}</p>
                <p className="text-purple-400 font-bold mb-3">{formatPrice(product.variants[0].price)}</p>
                <div className="flex gap-2">
                  <Link href={`/shop/${product.id}/try-on`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full gap-1 text-xs"><Camera size={12} /> Try On</Button>
                  </Link>
                  <Link href={`/shop/${product.id}`} className="flex-1">
                    <Button size="sm" className="w-full gap-1 text-xs"><ShoppingBag size={12} /> Buy</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
