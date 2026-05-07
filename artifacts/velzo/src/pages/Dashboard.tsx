import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useGetMyStore, useGetMyProducts, useListConversations } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store, Package, MessageSquare, Plus, ArrowRight,
  TrendingUp, ShoppingBag, Star, LayoutDashboard, Loader2
} from "lucide-react";
import { motion } from "framer-motion";

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-[#1D6146]/10 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#1D6146]" />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: myStoreData, isLoading: storeLoading } = useGetMyStore();
  const { data: myProducts = [], isLoading: productsLoading } = useGetMyProducts();
  const { data: conversations = [] } = useListConversations();

  const store = myStoreData?.store;
  const isSeller = user?.role === "seller";

  return (
    <div className="min-h-screen bg-[#F5F5F1]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-[#1D6146]" />
            <span className="text-sm text-gray-500 font-medium">Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-500 mt-1 capitalize">{user?.role} account</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {isSeller && (
            <>
              <StatCard icon={Package} label="Products" value={myProducts.length} />
              <StatCard
                icon={Star}
                label="Avg Rating"
                value={
                  myProducts.length
                    ? (myProducts.reduce((s, p) => s + p.avgRating, 0) / myProducts.length).toFixed(1)
                    : "—"
                }
              />
            </>
          )}
          <StatCard icon={MessageSquare} label="Conversations" value={conversations.length} />
          <StatCard icon={ShoppingBag} label="Role" value={user?.role ?? "—"} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Store section (seller only) */}
          {isSeller && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#1D6146]" />
                  <h2 className="text-lg font-bold text-gray-900">My Store</h2>
                </div>
                {!store && !storeLoading && (
                  <Link href="/store/create">
                    <Button size="sm" className="bg-[#1D6146] text-white hover:bg-[#174f38] gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      Create
                    </Button>
                  </Link>
                )}
              </div>

              {storeLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1D6146]" />
                </div>
              ) : store ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#1D6146]/10 rounded-xl flex items-center justify-center">
                      <Store className="w-6 h-6 text-[#1D6146]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{store.name}</p>
                      <p className="text-xs text-gray-400">@{store.slug}</p>
                    </div>
                  </div>
                  {store.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{store.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/store/${store.id}`}>
                      <Button variant="outline" size="sm" className="border-gray-200 gap-1">
                        View store
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Link href="/sell">
                      <Button size="sm" className="bg-[#1D6146] text-white hover:bg-[#174f38] gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        Add product
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Store className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-3">You haven't created a store yet.</p>
                  <Link href="/store/create">
                    <Button size="sm" className="bg-[#1D6146] text-white hover:bg-[#174f38]">
                      Create your store
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* Products (seller) */}
          {isSeller && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#1D6146]" />
                  <h2 className="text-lg font-bold text-gray-900">Products</h2>
                </div>
                <Link href="/sell">
                  <Button size="sm" className="bg-[#1D6146] text-white hover:bg-[#174f38] gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </Button>
                </Link>
              </div>
              {productsLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1D6146]" />
                </div>
              ) : myProducts.length === 0 ? (
                <div className="text-center py-6">
                  <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No products yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myProducts.slice(0, 4).map((p) => (
                    <Link key={p.id} href={`/products/${p.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-[#1D6146]/8 rounded-lg flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-5 h-5 text-[#1D6146]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                          <p className="text-xs text-gray-400">${Number(p.price).toFixed(2)}</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs shrink-0 ${p.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}
                        >
                          {p.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                  {myProducts.length > 4 && (
                    <p className="text-xs text-center text-gray-400 pt-1">+{myProducts.length - 4} more</p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Messages */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isSeller ? 0.1 : 0 }}
            className={`bg-white rounded-2xl border border-gray-100 p-6 ${!isSeller ? "md:col-span-2" : ""}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#1D6146]" />
                <h2 className="text-lg font-bold text-gray-900">Messages</h2>
              </div>
              <Link href="/messages">
                <Button variant="ghost" size="sm" className="text-[#1D6146] gap-1">
                  View all
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            {conversations.length === 0 ? (
              <div className="text-center py-6">
                <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No messages yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.slice(0, 4).map((conv) => (
                  <Link key={conv.id} href={`/messages/${conv.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-9 h-9 bg-[#1D6146]/10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-[#1D6146]">
                        {conv.otherUser.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{conv.otherUser.name}</p>
                        {conv.lastMessage && (
                          <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick links (buyer) */}
          {!isSeller && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">Explore</h2>
              <div className="space-y-3">
                <Link href="/catalog">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <ShoppingBag className="w-5 h-5 text-[#1D6146]" />
                    <span className="text-sm font-medium text-gray-700">Browse Marketplace</span>
                    <ArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
                  </div>
                </Link>
                <Link href="/catalog?sort=rating">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <Star className="w-5 h-5 text-[#1D6146]" />
                    <span className="text-sm font-medium text-gray-700">Top Rated</span>
                    <ArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
                  </div>
                </Link>
                <Link href="/catalog?category=templates">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <TrendingUp className="w-5 h-5 text-[#1D6146]" />
                    <span className="text-sm font-medium text-gray-700">Trending Templates</span>
                    <ArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
