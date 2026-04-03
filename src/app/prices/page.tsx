"use client";
import Image from "next/image";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PRODUCTS } from "@/types/product";
import { ExternalLink, TrendingDown, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const MOCK_STORE_PRICES = [
  { storeName: "Nordstrom", storeSlug: "nordstrom", logoColor: "#1a6b9a", price: 285, originalPrice: 380, discount: 25, inStock: true, shipping: "Free shipping", url: "#" },
  { storeName: "Net-a-Porter", storeSlug: "net-a-porter", logoColor: "#000000", price: 299, originalPrice: 299, discount: 0, inStock: true, shipping: "Free shipping over $200", url: "#" },
  { storeName: "SSENSE", storeSlug: "ssense", logoColor: "#1c1c1c", price: 310, originalPrice: 310, discount: 0, inStock: false, shipping: "Free shipping", url: "#" },
  { storeName: "Farfetch", storeSlug: "farfetch", logoColor: "#333", price: 275, originalPrice: 380, discount: 28, inStock: true, shipping: "$10 shipping", url: "#" },
];

export default function PricesPage() {
  const product = MOCK_PRODUCTS[0];
  const bestPrice = Math.min(...MOCK_STORE_PRICES.filter((s) => s.inStock).map((s) => s.price));

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Price Comparison</h1>
          <p className="text-white/50">Find the best deal across top retailers</p>
        </div>

        {/* Product */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-5 mb-6">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/50 text-xs">{product.brand}</p>
            <p className="font-semibold text-lg truncate">{product.name}</p>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="gold" className="flex items-center gap-1">
                <TrendingDown size={11} /> Best: {formatPrice(bestPrice)}
              </Badge>
              <span className="text-white/40 text-sm">across {MOCK_STORE_PRICES.filter((s) => s.inStock).length} stores</span>
            </div>
          </div>
        </div>

        {/* Prices */}
        <div className="space-y-3">
          {MOCK_STORE_PRICES.sort((a, b) => a.price - b.price).map((store) => (
            <div
              key={store.storeSlug}
              className={`glass-card rounded-xl p-5 flex items-center gap-4 transition-all ${
                store.price === bestPrice && store.inStock ? "border-green-500/30" : ""
              } ${!store.inStock ? "opacity-50" : "hover:border-white/20"}`}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                style={{ backgroundColor: store.logoColor }}
              >
                {store.storeName[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold">{store.storeName}</p>
                  {store.price === bestPrice && store.inStock && (
                    <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">Best Price</Badge>
                  )}
                  {!store.inStock && <Badge variant="secondary" className="text-[10px]">Out of Stock</Badge>}
                </div>
                <p className="text-white/40 text-xs">{store.shipping}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white">{formatPrice(store.price)}</span>
                  {store.discount > 0 && (
                    <span className="text-white/40 text-sm line-through">{formatPrice(store.originalPrice)}</span>
                  )}
                </div>
                {store.discount > 0 && (
                  <span className="text-green-400 text-xs">-{store.discount}% off</span>
                )}
              </div>

              <a href={store.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                <Button size="sm" variant={store.inStock ? "default" : "secondary"} disabled={!store.inStock} className="gap-1">
                  {store.inStock ? <><ShoppingCart size={13} /> Buy</> : "Unavailable"}
                  {store.inStock && <ExternalLink size={11} />}
                </Button>
              </a>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-xs text-white/30">
          Prices last updated: just now · Refresh for latest prices
          <br />
          <Link href={`/shop/${product.id}`} className="text-purple-400 underline mt-1 block">
            ← Back to product
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
