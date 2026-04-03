export interface Product {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  category: string;
  subcategory?: string;
  gender?: string;
  ageGroup?: string;
  images: string[];
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  variants: ProductVariant[];
  prices?: StorePrice[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  color?: string;
  colorHex?: string;
  size?: string;
  price: number;
  currency: string;
  sku?: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  images: string[];
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  country?: string;
  rating?: number;
  isActive: boolean;
}

export interface StorePrice {
  id: string;
  productVariantId: string;
  storeId: string;
  store: Store;
  price: number;
  currency: string;
  originalPrice?: number;
  discount?: number;
  url?: string;
  inStock: boolean;
  shippingInfo?: string;
  lastChecked: Date;
}

export interface Recommendation {
  id: string;
  userId: string;
  profileId: string;
  productId: string;
  product: Product;
  score: number;
  reasons: string[];
  occasion?: string;
  colorScore?: number;
  fitScore?: number;
  styleScore?: number;
  createdAt: Date;
}

export interface SavedItem {
  id: string;
  userId: string;
  profileId?: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  notes?: string;
  createdAt: Date;
}

export type Category =
  | "tops"
  | "bottoms"
  | "dresses"
  | "outerwear"
  | "shoes"
  | "accessories"
  | "activewear"
  | "swimwear"
  | "formal";

export interface MockProduct extends Product {
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isTrending?: boolean;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "prod_1",
    name: "Silk Wrap Midi Dress",
    description: "Elegant silk wrap dress with adjustable waist tie. Perfect for both day and evening occasions.",
    brand: "Vêtement Studio",
    category: "dresses",
    gender: "female",
    ageGroup: "adult",
    images: ["https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600"],
    tags: ["silk", "wrap", "midi", "elegant"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [
      { id: "v1", productId: "prod_1", color: "Blush Rose", colorHex: "#f9a8d4", size: "XS", price: 285, currency: "USD", stockStatus: "in_stock", images: [] },
      { id: "v2", productId: "prod_1", color: "Midnight Blue", colorHex: "#1e3a5f", size: "S", price: 285, currency: "USD", stockStatus: "in_stock", images: [] },
      { id: "v3", productId: "prod_1", color: "Ivory", colorHex: "#fffff0", size: "M", price: 285, currency: "USD", stockStatus: "low_stock", images: [] },
    ],
    rating: 4.8,
    reviewCount: 124,
    isNew: true,
    isTrending: true,
  },
  {
    id: "prod_2",
    name: "Structured Blazer",
    description: "Tailored blazer in premium wool blend. A wardrobe essential for the modern professional.",
    brand: "Maison Atelier",
    category: "outerwear",
    gender: "female",
    ageGroup: "adult",
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600"],
    tags: ["blazer", "structured", "formal", "wool"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [
      { id: "v4", productId: "prod_2", color: "Camel", colorHex: "#c19a6b", size: "S", price: 420, currency: "USD", stockStatus: "in_stock", images: [] },
      { id: "v5", productId: "prod_2", color: "Charcoal", colorHex: "#36454f", size: "M", price: 420, currency: "USD", stockStatus: "in_stock", images: [] },
    ],
    rating: 4.9,
    reviewCount: 89,
    isTrending: true,
  },
  {
    id: "prod_3",
    name: "High-Waist Tailored Trousers",
    description: "Wide-leg tailored trousers with a flattering high waist. Crafted from sustainable fabric.",
    brand: "Eco Luxe",
    category: "bottoms",
    gender: "female",
    ageGroup: "adult",
    images: ["https://images.unsplash.com/photo-1594938298603-c8148c4b3d0e?w=600"],
    tags: ["trousers", "high-waist", "wide-leg", "sustainable"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [
      { id: "v6", productId: "prod_3", color: "Cream", colorHex: "#fffdd0", size: "S", price: 185, currency: "USD", stockStatus: "in_stock", images: [] },
      { id: "v7", productId: "prod_3", color: "Black", colorHex: "#000000", size: "M", price: 185, currency: "USD", stockStatus: "in_stock", images: [] },
    ],
    rating: 4.7,
    reviewCount: 203,
    isNew: true,
  },
  {
    id: "prod_4",
    name: "Cashmere Knit Sweater",
    description: "Luxuriously soft pure cashmere sweater with ribbed detail. An investment piece.",
    brand: "Highland Cashmere",
    category: "tops",
    gender: "female",
    ageGroup: "adult",
    images: ["https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600"],
    tags: ["cashmere", "knit", "luxury", "cozy"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [
      { id: "v8", productId: "prod_4", color: "Dusty Rose", colorHex: "#dcb0a7", size: "XS", price: 345, currency: "USD", stockStatus: "in_stock", images: [] },
      { id: "v9", productId: "prod_4", color: "Oatmeal", colorHex: "#d4b896", size: "S", price: 345, currency: "USD", stockStatus: "low_stock", images: [] },
    ],
    rating: 4.9,
    reviewCount: 67,
    isTrending: true,
  },
  {
    id: "prod_5",
    name: "Leather Ankle Boots",
    description: "Italian crafted leather ankle boots with block heel. Timeless and versatile.",
    brand: "Calzature Milano",
    category: "shoes",
    gender: "female",
    ageGroup: "adult",
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600"],
    tags: ["leather", "boots", "ankle", "Italian"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [
      { id: "v10", productId: "prod_5", color: "Cognac", colorHex: "#9c4a1a", size: "36", price: 495, currency: "USD", stockStatus: "in_stock", images: [] },
      { id: "v11", productId: "prod_5", color: "Black", colorHex: "#000000", size: "37", price: 495, currency: "USD", stockStatus: "in_stock", images: [] },
    ],
    rating: 4.8,
    reviewCount: 156,
    isNew: true,
  },
  {
    id: "prod_6",
    name: "Minimalist Crossbody Bag",
    description: "Structured crossbody bag in premium pebbled leather with gold hardware.",
    brand: "Atelier Parisien",
    category: "accessories",
    gender: "female",
    ageGroup: "adult",
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"],
    tags: ["bag", "leather", "crossbody", "minimalist"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [
      { id: "v12", productId: "prod_6", color: "Tan", colorHex: "#d2b48c", size: "One Size", price: 325, currency: "USD", stockStatus: "in_stock", images: [] },
      { id: "v13", productId: "prod_6", color: "Black", colorHex: "#000000", size: "One Size", price: 325, currency: "USD", stockStatus: "in_stock", images: [] },
    ],
    rating: 4.6,
    reviewCount: 94,
    isTrending: true,
  },
];
