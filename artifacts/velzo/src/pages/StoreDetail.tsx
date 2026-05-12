import { useParams, Link } from "wouter";
import { useGetStore, useGetStoreProducts } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, ShoppingBag, Star, Loader2, ArrowLeft, Package } from "lucide-react";

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
          <h3 className="text-sm font-semibold line-clamp-2 mb-2">{product.title}</h3>
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary">${Number(product.price).toFixed(2)}</span>
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {Number(product.avgRating).toFixed(1)}
              </div>
            )}
          </div>
          <Badge variant="secondary" className="mt-2 text-xs capitalize">{product.category}</Badge>
        </div>
      </div>
    </Link>
  );
}

export default function StoreDetail() {
  const { id } = useParams<{ id: string }>();
  const storeId = Number(id);
  const { data: store, isLoading: storeLoading } = useGetStore(storeId);
  const { data: products = [], isLoading: productsLoading } = useGetStoreProducts(storeId);

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center h-64"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h2 className="text-xl font-bold">Store not found</h2>
          <Link href="/catalog"><Button variant="ghost" className="mt-4">Browse marketplace</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Banner */}
      <div className="bg-primary h-28 relative overflow-hidden">
        {store.banner && <img src={store.banner} alt="banner" className="w-full h-full object-cover opacity-40" />}
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Store info card */}
        <div className="bg-card border border-border border-t-0 p-6 mb-8">
          <Link href="/catalog">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
              <ArrowLeft className="w-4 h-4" />Back to marketplace
            </button>
          </Link>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-primary/10 flex items-center justify-center shrink-0">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-7 h-7 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{store.name}</h1>
              <p className="text-sm text-muted-foreground">@{store.slug}</p>
              {store.description && <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{store.description}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-primary">{products.length}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="pb-12">
          <div className="flex items-center gap-2 mb-5">
            <Package className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold">All Products</h2>
            <span className="text-sm text-muted-foreground">({products.length})</span>
          </div>
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card border border-border h-56 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
