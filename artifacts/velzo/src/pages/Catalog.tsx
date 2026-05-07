import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useListProducts, useGetCatalogStats } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, SlidersHorizontal, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = [
  "All", "Templates", "E-Books", "Courses", "Software", "Graphics", "Music",
  "Photography", "Fonts", "3D Models", "Plugins", "Spreadsheets", "Videos",
  "Audio", "Illustrations", "Icons", "Mockups", "Presets", "Games", "Scripts",
];

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        whileHover={{ y: -3 }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
      >
        <div className="aspect-video bg-gradient-to-br from-[#1D6146]/10 to-[#1D6146]/5 flex items-center justify-center overflow-hidden">
          {product.coverImage ? (
            <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <ShoppingBag className="w-10 h-10 text-[#1D6146]/30" />
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{product.title}</h3>
          </div>
          {product.storeName && (
            <p className="text-xs text-gray-400 mb-2">{product.storeName}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-base font-bold text-[#1D6146]">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{Number(product.avgRating).toFixed(1)}</span>
                <span className="text-gray-400">({product.reviewCount})</span>
              </div>
            )}
          </div>
          <Badge variant="secondary" className="mt-2 text-xs capitalize bg-[#1D6146]/8 text-[#1D6146]">
            {product.category}
          </Badge>
        </div>
      </motion.div>
    </Link>
  );
}

export default function Catalog() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialCategory = params.get("category") ?? "";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("newest");

  const { data: products = [], isLoading } = useListProducts({
    category: category && category !== "All" ? category.toLowerCase() : undefined,
    search: search || undefined,
    sort,
  });

  const { data: stats } = useGetCatalogStats();

  return (
    <div className="min-h-screen bg-[#F5F5F1]">
      <Navbar />

      {/* Hero strip */}
      <div className="bg-[#1D6146] text-white py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">Digital Marketplace</h1>
          <p className="text-white/70 text-sm mb-6">
            {stats?.totalProducts ?? "—"} products across {stats?.totalCategories ?? "—"} categories
          </p>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white text-gray-900 border-0 rounded-xl h-11"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Categories
              </h3>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map((cat) => {
                  const isActive = cat === "All" ? !category || category === "All" : category.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat === "All" ? "" : cat.toLowerCase())}
                      className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        isActive
                          ? "bg-[#1D6146] text-white font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                {isLoading ? "Loading..." : `${products.length} products`}
              </p>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-36 bg-white border-gray-200 rounded-xl h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price_asc">Price: Low–High</SelectItem>
                  <SelectItem value="price_desc">Price: High–Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-200 mb-4" />
                <h3 className="text-gray-500 font-medium">No products found</h3>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
