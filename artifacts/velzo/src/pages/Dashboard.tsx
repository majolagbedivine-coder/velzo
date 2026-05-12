import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useGetMyStore, useGetMyProducts, useListConversations } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Store, Package, MessageSquare, Plus, ArrowRight, LayoutDashboard,
  Loader2, Settings, User, RefreshCw, Sun, Moon, ChevronRight,
  Save, X, BarChart3, AlertCircle, ShoppingBag, Star, TrendingUp,
  ChevronLeft, Menu, ExternalLink, Pencil, LogOut, Bell
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────── */
type Tab = "overview" | "products" | "store" | "messages" | "settings";
const VALID_TABS: Tab[] = ["overview", "products", "store", "messages", "settings"];

function useActiveTab(): [Tab, (t: Tab) => void] {
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(search);
  const raw = params.get("tab") as Tab | null;
  const tab: Tab = VALID_TABS.includes(raw as Tab) ? (raw as Tab) : "overview";
  const setTab = (t: Tab) => navigate(`/dashboard?tab=${t}`);
  return [tab, setTab];
}

const NAV: { id: Tab; label: string; icon: React.ElementType; sellerOnly?: boolean }[] = [
  { id: "overview",  label: "Overview",  icon: LayoutDashboard },
  { id: "products",  label: "Products",  icon: Package,     sellerOnly: true },
  { id: "store",     label: "My Store",  icon: Store,       sellerOnly: true },
  { id: "messages",  label: "Messages",  icon: MessageSquare },
  { id: "settings",  label: "Settings",  icon: Settings },
];

/* ─── Dashboard shell ────────────────────────────────────── */
export default function Dashboard() {
  const { user, token, updateUser, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useActiveTab();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { data: myStoreData, isLoading: storeLoading, refetch: refetchStore } = useGetMyStore();
  const { data: myProducts = [], isLoading: productsLoading } = useGetMyProducts();
  const { data: conversations = [] } = useListConversations();
  const store = myStoreData?.store;
  const isSeller = user?.role === "seller";
  const visibleNav = NAV.filter(n => !n.sellerOnly || isSeller);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#1C5F45] flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600 mb-4 text-sm">You must be signed in to view your dashboard.</p>
          <Link href="/login">
            <button className="px-5 py-2 bg-[#1C5F45] text-white text-sm font-semibold hover:bg-[#174f38] transition-colors">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f2] flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Mobile overlay ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        flex flex-col bg-[#1C5F45] text-white
        transition-all duration-200 shrink-0
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${sidebarOpen ? "w-60" : "w-[68px]"}
      `}>

        {/* Logo area */}
        <div className={`h-16 flex items-center border-b border-white/10 shrink-0 ${sidebarOpen ? "px-5 gap-3" : "justify-center"}`}>
          <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-white text-sm leading-none">Velzo</p>
              <p className="text-white/50 text-[10px] leading-none mt-0.5">Marketplace</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
          {visibleNav.map(item => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setMobileSidebarOpen(false); }}
                title={!sidebarOpen ? item.label : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? "bg-white text-[#1C5F45] shadow-sm"
                    : "text-white/75 hover:text-white hover:bg-white/10"
                  }
                  ${!sidebarOpen ? "justify-center" : ""}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom: user card */}
        <div className={`border-t border-white/10 p-3 shrink-0`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                <p className="text-white/50 text-[10px] capitalize">{user.role}</p>
              </div>
              <button
                onClick={() => { logout?.(); navigate("/"); }}
                className="text-white/40 hover:text-white/80 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 gap-4 shrink-0">
          {/* Collapse / hamburger */}
          <button
            onClick={() => { setSidebarOpen(s => !s); setMobileSidebarOpen(s => !s); }}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link href="/">
              <span className="text-gray-400 hover:text-[#1C5F45] transition-colors cursor-pointer">Velzo</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="font-semibold text-gray-800 capitalize">
              {NAV.find(n => n.id === tab)?.label ?? "Dashboard"}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Notifications placeholder */}
            <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#1C5F45] rounded-full" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#1C5F45] flex items-center justify-center text-white text-xs font-bold">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-none">{user.name}</p>
                <p className="text-[11px] text-gray-400 capitalize mt-0.5">{user.role} account</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8 pb-24 md:pb-8">
          {tab === "overview"  && <OverviewTab user={user} store={store} myProducts={myProducts} conversations={conversations} isSeller={isSeller} setTab={setTab} />}
          {tab === "products"  && isSeller && <ProductsTab myProducts={myProducts} productsLoading={productsLoading} />}
          {tab === "store"     && isSeller && <StoreTab store={store} storeLoading={storeLoading} token={token} toast={toast} refetch={refetchStore} />}
          {tab === "messages"  && <MessagesTab conversations={conversations} />}
          {tab === "settings"  && <SettingsTab user={user} token={token} updateUser={updateUser} login={login} toast={toast} />}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex shadow-lg">
        {visibleNav.map(item => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                active ? "text-[#1C5F45]" : "text-gray-400"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Shared components ──────────────────────────────────── */

function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, icon: Icon, action }: { title: string; icon?: React.ElementType; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-[#1C5F45]" />}
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>
      {action}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }: { icon: React.ElementType; label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border ${accent ? "border-[#1C5F45]/30" : "border-gray-200"} p-5 relative overflow-hidden`}>
      {accent && <div className="absolute top-0 left-0 w-1 h-full bg-[#1C5F45]" />}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${accent ? "bg-[#1C5F45]/10" : "bg-gray-100"}`}>
        <Icon className={`w-4 h-4 ${accent ? "text-[#1C5F45]" : "text-gray-500"}`} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, action }: { icon: React.ElementType; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="py-14 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <p className="font-semibold text-gray-700 text-sm">{title}</p>
      <p className="text-gray-400 text-xs mt-1 mb-4">{desc}</p>
      {action}
    </div>
  );
}

function GreenBtn({ href, onClick, children, size = "default", outline = false }: any) {
  const cls = `inline-flex items-center gap-1.5 font-semibold transition-colors rounded-lg
    ${size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}
    ${outline
      ? "border border-[#1C5F45] text-[#1C5F45] hover:bg-[#1C5F45]/5"
      : "bg-[#1C5F45] text-white hover:bg-[#174f38]"
    }`;
  if (href) return <Link href={href}><button className={cls}>{children}</button></Link>;
  return <button onClick={onClick} className={cls}>{children}</button>;
}

/* ─── Overview ───────────────────────────────────────────── */
function OverviewTab({ user, store, myProducts, conversations, isSeller, setTab }: any) {
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      {/* Welcome banner */}
      <div className="bg-[#1C5F45] rounded-xl p-6 mb-7 flex items-center justify-between overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10"
          style={{ background: "radial-gradient(circle at right, white, transparent)" }} />
        <div>
          <p className="text-white/70 text-xs font-medium mb-1">{today}</p>
          <h1 className="text-xl font-bold text-white">
            Good day, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Here's an overview of your {isSeller ? "store" : "account"}.
          </p>
        </div>
        <Link href="/catalog">
          <button className="hidden sm:flex items-center gap-2 bg-white text-[#1C5F45] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shrink-0">
            Browse <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className={`grid gap-4 mb-7 ${isSeller ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2"}`}>
        {isSeller && (
          <>
            <StatCard icon={Package}      label="Products"   value={myProducts.length} accent />
            <StatCard
              icon={Star}
              label="Avg Rating"
              value={myProducts.length
                ? (myProducts.reduce((s: number, p: any) => s + (p.avgRating ?? 0), 0) / myProducts.length).toFixed(1)
                : "—"}
              sub={myProducts.length ? "across all products" : "No reviews yet"}
            />
          </>
        )}
        <StatCard icon={MessageSquare} label="Conversations" value={conversations.length} accent={!isSeller} />
        <StatCard
          icon={BarChart3}
          label="Account type"
          value={user.role === "seller" ? "Seller" : "Buyer"}
          sub="Change in Settings"
        />
      </div>

      {/* Cards grid */}
      <div className="grid md:grid-cols-2 gap-5">

        {isSeller ? (
          <>
            {/* Store card */}
            <Card>
              <CardHeader title="My Store" icon={Store} action={
                <button onClick={() => setTab("store")} className="text-xs text-[#1C5F45] font-semibold hover:underline">Manage →</button>
              } />
              <div className="p-5">
                {store ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#1C5F45]/10 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-[#1C5F45]" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{store.name}</p>
                        <p className="text-xs text-gray-400">@{store.slug}</p>
                      </div>
                    </div>
                    {store.description && (
                      <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2 border-l-2 border-[#1C5F45]/30 pl-3">{store.description}</p>
                    )}
                    <div className="flex gap-2">
                      <GreenBtn href={`/store/${store.id}`} size="sm" outline>
                        View store <ExternalLink className="w-3 h-3" />
                      </GreenBtn>
                      <GreenBtn href="/sell" size="sm">
                        <Plus className="w-3 h-3" /> Add product
                      </GreenBtn>
                    </div>
                  </>
                ) : (
                  <EmptyState
                    icon={Store}
                    title="No store yet"
                    desc="Create your storefront to start selling on Velzo"
                    action={<GreenBtn href="/store/create" size="sm">Create Store</GreenBtn>}
                  />
                )}
              </div>
            </Card>

            {/* Recent products */}
            <Card>
              <CardHeader title="Recent Products" icon={Package} action={
                <button onClick={() => setTab("products")} className="text-xs text-[#1C5F45] font-semibold hover:underline">View all →</button>
              } />
              {myProducts.length === 0 ? (
                <EmptyState icon={Package} title="No products yet" desc="List your first product to start earning" action={<GreenBtn href="/sell" size="sm"><Plus className="w-3 h-3" />New Product</GreenBtn>} />
              ) : (
                <div>
                  {myProducts.slice(0, 5).map((p: any, i: number) => (
                    <Link key={p.id} href={`/products/${p.id}`}>
                      <div className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                        <div className="w-8 h-8 bg-[#1C5F45]/8 rounded-lg flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4 text-[#1C5F45]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                          <p className="text-xs text-gray-400">${Number(p.price).toFixed(2)}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.status === "active" ? "bg-[#1C5F45]/10 text-[#1C5F45]" : "bg-gray-100 text-gray-500"}`}>
                          {p.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </>
        ) : (
          /* Buyer quick actions */
          <Card className="md:col-span-2">
            <CardHeader title="Quick Actions" icon={TrendingUp} />
            <div>
              {[
                { href: "/catalog",             icon: ShoppingBag, label: "Browse Marketplace",    desc: "Discover thousands of digital products" },
                { href: "/catalog?sort=rating", icon: Star,        label: "Top Rated Products",    desc: "The best-reviewed items this month" },
                { href: "/catalog",             icon: TrendingUp,  label: "Trending Right Now",    desc: "See what's popular this week" },
              ].map((item, i) => (
                <Link key={i} href={item.href}>
                  <div className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                    <div className="w-9 h-9 bg-[#1C5F45]/8 rounded-lg flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-[#1C5F45]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {/* Messages */}
        <Card className={!isSeller ? "md:col-span-2" : ""}>
          <CardHeader title="Recent Messages" icon={MessageSquare} action={
            <Link href="/messages"><span className="text-xs text-[#1C5F45] font-semibold hover:underline cursor-pointer">Open inbox →</span></Link>
          } />
          {conversations.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No messages yet" desc="Contact a seller from any product page to get started" />
          ) : (
            <div>
              {conversations.slice(0, 5).map((conv: any, i: number) => (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <div className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                    <div className="w-9 h-9 rounded-full bg-[#1C5F45] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {conv.otherUser.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{conv.otherUser.name}</p>
                      {conv.lastMessage && <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ─── Products tab ───────────────────────────────────────── */
function ProductsTab({ myProducts, productsLoading }: any) {
  return (
    <div>
      <PageHeader
        title="Your Products"
        subtitle={`${myProducts.length} product${myProducts.length !== 1 ? "s" : ""} in your catalogue`}
        action={<GreenBtn href="/sell"><Plus className="w-3.5 h-3.5" />New Product</GreenBtn>}
      />
      <Card>
        {productsLoading ? (
          <div className="flex justify-center py-14"><Loader2 className="w-6 h-6 animate-spin text-[#1C5F45]" /></div>
        ) : myProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products yet"
            desc="Create your first product to start selling on Velzo"
            action={<GreenBtn href="/sell"><Plus className="w-3.5 h-3.5" />Create a Product</GreenBtn>}
          />
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-center">Rating</div>
              <div className="col-span-2 text-center">Status</div>
            </div>
            {myProducts.map((p: any, i: number) => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <div className={`grid grid-cols-12 gap-4 items-center px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1C5F45]/8 rounded-lg flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4 text-[#1C5F45]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.title}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-bold text-gray-900">${Number(p.price).toFixed(2)}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-1">
                    {p.avgRating > 0 ? (
                      <>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-gray-700">{Number(p.avgRating).toFixed(1)}</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${p.status === "active" ? "bg-[#1C5F45]/10 text-[#1C5F45]" : "bg-gray-100 text-gray-500"}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </>
        )}
      </Card>
    </div>
  );
}

/* ─── Store tab ──────────────────────────────────────────── */
function StoreTab({ store, storeLoading, token, toast, refetch }: any) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (store) { setName(store.name ?? ""); setDescription(store.description ?? ""); }
  }, [store]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/stores/${store.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error();
      await refetch();
      setEditing(false);
      toast({ title: "Store updated successfully" });
    } catch {
      toast({ title: "Failed to update store", variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader
        title="My Store"
        subtitle="Manage your storefront details and listings"
        action={!storeLoading && store && !editing
          ? <GreenBtn outline onClick={() => setEditing(true)}><Pencil className="w-3.5 h-3.5" />Edit Store</GreenBtn>
          : undefined}
      />

      {storeLoading ? (
        <div className="flex justify-center py-14"><Loader2 className="w-6 h-6 animate-spin text-[#1C5F45]" /></div>
      ) : store ? (
        <div className="space-y-4">
          <Card>
            {editing ? (
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Store Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} className="rounded-lg border-gray-200 focus:border-[#1C5F45] focus:ring-[#1C5F45]/20" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Description</label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="rounded-lg border-gray-200 resize-none focus:border-[#1C5F45]" />
                </div>
                <div className="flex gap-2 pt-1">
                  <GreenBtn onClick={handleSave}>{saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Save Changes</GreenBtn>
                  <GreenBtn outline onClick={() => setEditing(false)}><X className="w-3.5 h-3.5" />Cancel</GreenBtn>
                </div>
              </div>
            ) : (
              <>
                <div className="p-6 flex items-start gap-5 border-b border-gray-100">
                  <div className="w-14 h-14 bg-[#1C5F45]/10 rounded-xl flex items-center justify-center shrink-0">
                    <Store className="w-7 h-7 text-[#1C5F45]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">{store.name}</h2>
                    <p className="text-sm text-gray-400">@{store.slug}</p>
                    {store.description && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{store.description}</p>}
                  </div>
                </div>
                <div className="px-6 py-4 flex gap-3">
                  <GreenBtn href={`/store/${store.id}`} outline size="sm">View live store <ExternalLink className="w-3 h-3" /></GreenBtn>
                  <GreenBtn href="/sell" size="sm"><Plus className="w-3 h-3" />Add product</GreenBtn>
                </div>
              </>
            )}
          </Card>
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={Store}
            title="No store yet"
            desc="Create your digital storefront to start selling on Velzo"
            action={<GreenBtn href="/store/create">Create Your Store</GreenBtn>}
          />
        </Card>
      )}
    </div>
  );
}

/* ─── Messages tab ───────────────────────────────────────── */
function MessagesTab({ conversations }: any) {
  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle="Your recent conversations"
        action={<GreenBtn href="/messages" outline>Open Inbox <ExternalLink className="w-3.5 h-3.5" /></GreenBtn>}
      />
      <Card>
        {conversations.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No conversations yet"
            desc="Your messages with sellers and buyers will appear here"
          />
        ) : (
          <div>
            {conversations.map((conv: any, i: number) => (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <div className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                  <div className="w-10 h-10 rounded-full bg-[#1C5F45] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {conv.otherUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{conv.otherUser.name}</p>
                    {conv.lastMessage && <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>}
                  </div>
                  <span className="text-xs text-gray-400 capitalize shrink-0">{conv.otherUser.role}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ─── Settings tab ───────────────────────────────────────── */
function SettingsTab({ user, token, updateUser, login, toast }: any) {
  const [name, setName]     = useState(user.name   ?? "");
  const [bio, setBio]       = useState(user.bio    ?? "");
  const [avatar, setAvatar] = useState(user.avatar ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, bio, avatar }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      updateUser(data);
      toast({ title: "Profile saved" });
    } catch {
      toast({ title: "Failed to save profile", variant: "destructive" });
    } finally { setSavingProfile(false); }
  };

  const switchRole = async () => {
    const newRole = user.role === "buyer" ? "seller" : "buyer";
    setSwitchingRole(true);
    try {
      const res = await fetch("/api/auth/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      login(data.token, data.user);
      toast({ title: `Switched to ${newRole}` });
    } catch {
      toast({ title: "Failed to switch role", variant: "destructive" });
    } finally { setSwitchingRole(false); }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your account profile and preferences" />

      <div className="space-y-5">
        {/* Profile */}
        <Card>
          <CardHeader title="Profile Information" icon={User} />
          <div className="p-6 space-y-5">
            {/* Avatar preview */}
            <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-[#1C5F45] flex items-center justify-center text-white text-xl font-bold shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
                <span className="inline-flex items-center mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1C5F45]/10 text-[#1C5F45] capitalize">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Display Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} className="rounded-lg border-gray-200" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Bio</label>
                <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell others about yourself..." rows={3} className="rounded-lg border-gray-200 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Avatar URL</label>
                <Input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." className="rounded-lg border-gray-200" />
              </div>
            </div>
            <GreenBtn onClick={saveProfile}>
              {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Profile
            </GreenBtn>
          </div>
        </Card>

        {/* Account type */}
        <Card>
          <CardHeader title="Account Type" icon={RefreshCw} />
          <div className="p-6">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  You're currently a{" "}
                  <span className="text-[#1C5F45] font-bold capitalize">{user.role}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {user.role === "buyer"
                    ? "Switch to Seller to create a store and list your digital products."
                    : "Switch to Buyer to focus on browsing and purchasing products."}
                </p>
              </div>
              <GreenBtn outline onClick={switchRole}>
                {switchingRole ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Switch to {user.role === "buyer" ? "Seller" : "Buyer"}
              </GreenBtn>
            </div>
            {user.role === "buyer" && (
              <div className="mt-4 flex items-start gap-2.5 bg-[#1C5F45]/5 border border-[#1C5F45]/20 rounded-lg p-3.5">
                <AlertCircle className="w-4 h-4 text-[#1C5F45] mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  Becoming a seller unlocks store creation, product listings, and sales management tools — all free.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Account details */}
        <Card>
          <CardHeader title="Account Details" icon={Settings} />
          <div className="divide-y divide-gray-100">
            {[
              { label: "Email address", value: user.email },
              { label: "Account ID",    value: `#${user.id}` },
              { label: "Member since",  value: new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
            ].map((row, i) => (
              <div key={i} className="flex items-center px-6 py-3.5 gap-6">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-32 shrink-0">{row.label}</span>
                <span className="text-sm text-gray-700 font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
