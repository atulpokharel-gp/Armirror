import { NextResponse } from "next/server";

const MOCK_PRICES = [
  { storeName: "Nordstrom", price: 285, originalPrice: 380, discount: 25, inStock: true, url: "#", shipping: "Free shipping" },
  { storeName: "Net-a-Porter", price: 299, originalPrice: 299, discount: 0, inStock: true, url: "#", shipping: "Free over $200" },
  { storeName: "Farfetch", price: 275, originalPrice: 380, discount: 28, inStock: true, url: "#", shipping: "$10 shipping" },
  { storeName: "SSENSE", price: 310, originalPrice: 310, discount: 0, inStock: false, url: "#", shipping: "Free shipping" },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // In production: call price aggregation service / scraper API
    // with the productId to get live prices from retailers
    await new Promise((r) => setTimeout(r, 300));

    return NextResponse.json({ productId, prices: MOCK_PRICES, lastUpdated: new Date() });
  } catch (error) {
    console.error("GET /api/prices error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
