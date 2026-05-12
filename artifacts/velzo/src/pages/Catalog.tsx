import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useListProducts, useGetCatalogStats } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Search, SlidersHorizontal, ShoppingBag } from "lucide-react";

const CATEGORIES = [
  "All", "Templates", "E-Books", "Courses", "Software", "Graphics", "Music",
  "Photography", "Fonts", "3D Models", "Plugins", "Spreadsheets", "Videos",
  "Audio", "Illustrations", "Icons", "Mockups", "Presets", "Games", "Scripts",
  "Tickets",
];

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-card border border-border overflow-hidden hover:border-primary/40 transition-colors cursor-pointer group">
        <div className="aspect-video bg-primary/5 flex items-center justify-center overflow-hidden">
          {product.coverImage ? (
            <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <ShoppingBag className="w-10 h-10 text-primary/20" />
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-semibold line-clamp-2 leading-snug mb-1">{product.title}</h3>
          {product.storeName && <p className="text-xs text-muted-foreground mb-2">{product.storeName}</p>}
          <div className="flex items-center justify-between mt-2">
            <span className="text-base font-bold text-primary">${Number(product.price).toFixed(2)}</span>
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{Number(product.avgRating).toFixed(1)}</span>
                <span>({product.reviewCount})</span>
              </div>
            )}
          </div>
          <Badge variant="secondary" className="mt-2 text-xs capitalize">{product.category}</Badge>
        </div>
      </div>
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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero strip */}
      <div className="bg-primary text-primary-foreground py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-0.5">Digital Marketplace</h1>
          <p className="text-primary-foreground/70 text-sm mb-5">
            {stats?.totalProducts ?? "—"} products across {stats?.totalCategories ?? "—"} categories
          </p>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background text-foreground border-0 rounded-none h-11"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-7">
        <div className="flex flex-col md:flex-row gap-7">
          {/* Sidebar */}
          <aside className="w-full md:w-48 shrink-0">
            <div className="bg-card border border-border">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categories</span>
              </div>
              <div className="flex flex-col">
                {CATEGORIES.map((cat) => {
                  const isActive = cat === "All"
                    ? !category || category === "All"
                    : category.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat === "All" ? "" : cat.toLowerCase())}
                      className={`text-left text-sm px-4 py-2 transition-colors border-b border-border last:border-0 ${
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${products.length} product${products.length !== 1 ? "s" : ""}`}
              </p>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-40 rounded-none h-9 text-sm bg-card border-border">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-card border border-border h-64 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-medium">No products found</h3>
                <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
