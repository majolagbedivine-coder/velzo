import { useParams } from "wouter";
import { useGetStore, useGetStoreProducts } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Store, ShoppingBag, Star, Loader2, ArrowLeft, Package } from "lucide-react";
import { motion } from "framer-motion";

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        whileHover={{ y: -3 }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
      >
        <div className="aspect-video bg-gradient-to-br from-[#1D6146]/10 to-[#1D6146]/5 flex items-center justify-center">
          {product.coverImage ? (
            <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <ShoppingBag className="w-10 h-10 text-[#1D6146]/20" />
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">{product.title}</h3>
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#1D6146]">${Number(product.price).toFixed(2)}</span>
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {Number(product.avgRating).toFixed(1)}
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

export default function StoreDetail() {
  const { id } = useParams<{ id: string }>();
  const storeId = Number(id);

  const { data: store, isLoading: storeLoading } = useGetStore(storeId);
  const { data: products = [], isLoading: productsLoading } = useGetStoreProducts(storeId);

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F1]">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#1D6146]" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-[#F5F5F1]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h2 className="text-xl font-bold text-gray-700">Store not found</h2>
          <Link href="/catalog">
            <Button variant="ghost" className="mt-4 text-[#1D6146]">
              Browse marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F1]">
      <Navbar />

      {/* Store banner */}
      <div className="bg-[#1D6146]">
        {store.banner ? (
          <img src={store.banner} alt="banner" className="w-full h-40 object-cover opacity-50" />
        ) : (
          <div className="h-32" />
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Store info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 -mt-8 mb-8 relative z-10">
          <Link href="/catalog">
            <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#1D6146] mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to marketplace
            </button>
          </Link>
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-[#1D6146]/10 rounded-2xl flex items-center justify-center shrink-0">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <Store className="w-8 h-8 text-[#1D6146]" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
              <p className="text-sm text-gray-400">@{store.slug}</p>
              {store.description && (
                <p className="text-gray-600 mt-2 text-sm leading-relaxed">{store.description}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-[#1D6146]">{products.length}</p>
              <p className="text-xs text-gray-400">Products</p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#1D6146]" />
            All Products
          </h2>
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 h-56 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">No products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
