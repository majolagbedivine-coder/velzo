import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useGetMyStore, useGetMyProducts, useListConversations } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Store, Package, MessageSquare, Plus, ArrowRight, LayoutDashboard,
  Loader2, Settings, User, RefreshCw, Sun, Moon, ChevronRight,
  Save, X, BarChart3, AlertCircle, ShoppingBag, Star, TrendingUp,
  ChevronLeft, Menu, ExternalLink, Pencil, LogOut, Bell, Check,
  CheckCheck, Ticket
} from "lucide-react";

const GREEN = "#0D3B27";
const GREEN_HOVER = "#0a2d1e";
const GREEN_LIGHT = "#e6f0ea";
const GREEN_BORDER = "#c5ddd0";

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
  { id: "products",  label: "Products",  icon: Package,      sellerOnly: true },
  { id: "store",     label: "My Store",  icon: Store,        sellerOnly: true },
  { id: "messages",  label: "Messages",  icon: MessageSquare },
  { id: "settings",  label: "Settings",  icon: Settings },
];

function fmtRelative(date: Date) {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

export default function Dashboard() {
  const { user, token, updateUser, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unread, markAllRead, markRead } = useNotifications();
  const [tab, setTab] = useActiveTab();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: myStoreData, isLoading: storeLoading, refetch: refetchStore } = useGetMyStore();
  const { data: myProducts = [], isLoading: productsLoading } = useGetMyProducts();
  const { data: conversations = [] } = useListConversations();
  const store = myStoreData?.store;
  const isSeller = user?.role === "seller";
  const visibleNav = NAV.filter(n => !n.sellerOnly || isSeller);

  /* Close notif panel on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f4f6f4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#0D3B27] flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600 mb-4 text-sm">You must be signed in to view your dashboard.</p>
          <Link href="/login">
            <button className="px-5 py-2 bg-[#0D3B27] text-white text-sm font-semibold hover:bg-[#0a2d1e] transition-colors">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f1] flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 flex flex-col text-white shrink-0
        transition-all duration-200
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${sidebarOpen ? "w-56" : "w-[60px]"}
      `} style={{ background: GREEN }}>

        <div className={`h-14 flex items-center border-b shrink-0 ${sidebarOpen ? "px-4 gap-3" : "justify-center"}`}
          style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="w-7 h-7 bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">V</span>
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-white text-sm leading-none">Velzo</p>
              <p className="text-[10px] leading-none mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Dashboard</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
          {visibleNav.map(item => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setMobileSidebarOpen(false); }}
                title={!sidebarOpen ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium transition-all
                  ${active ? "bg-white text-[#0D3B27]" : "text-white/70 hover:text-white hover:bg-white/10"}
                  ${!sidebarOpen ? "justify-center" : ""}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t p-2.5 shrink-0" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          {sidebarOpen ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate leading-none">{user.name}</p>
                <p className="text-[10px] mt-0.5 capitalize" style={{ color: "rgba(255,255,255,0.45)" }}>{user.role}</p>
              </div>
              <button onClick={() => { logout?.(); navigate("/"); }} title="Sign out"
                className="text-white/40 hover:text-white/80 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-7 h-7 bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 md:px-5 gap-3 shrink-0">
          <button onClick={() => { setSidebarOpen(s => !s); setMobileSidebarOpen(s => !s); }}
            className="text-gray-500 hover:text-gray-800 transition-colors">
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 text-sm">
            <Link href="/"><span className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-xs">Velzo</span></Link>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="font-semibold text-gray-800 text-sm">{NAV.find(n => n.id === tab)?.label ?? "Dashboard"}</span>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(o => !o); if (!notifOpen) markAllRead(); }}
                className="relative w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: GREEN }} />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 shadow-lg z-50">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Notifications</span>
                    {notifications.length > 0 && (
                      <button onClick={markAllRead} className="text-xs font-medium" style={{ color: GREEN }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <Bell className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">No notifications yet</p>
                      </div>
                    ) : notifications.slice(0, 12).map(n => (
                      <button key={n.id} onClick={() => { markRead(n.id); if (n.href) navigate(n.href); setNotifOpen(false); }}
                        className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!n.read ? "bg-[#f4f8f6]" : ""}`}>
                        <div className="w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: GREEN_LIGHT }}>
                          {n.kind === "message" ? <MessageSquare className="w-3.5 h-3.5" style={{ color: GREEN }} />
                            : n.kind === "role"  ? <RefreshCw className="w-3.5 h-3.5" style={{ color: GREEN }} />
                            : <Bell className="w-3.5 h-3.5" style={{ color: GREEN }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 leading-snug">{n.title}</p>
                          {n.body && <p className="text-xs text-gray-500 truncate mt-0.5">{n.body}</p>}
                          <p className="text-[10px] text-gray-400 mt-0.5">{fmtRelative(n.createdAt)}</p>
                        </div>
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: GREEN }} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 ml-1">
              <div className="w-7 h-7 flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: GREEN }}>
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800 leading-none">{user.name}</p>
                <p className="text-[10px] text-gray-400 capitalize mt-0.5">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-7 pb-24 md:pb-8">
          {tab === "overview"  && <OverviewTab user={user} store={store} myProducts={myProducts} conversations={conversations} isSeller={isSeller} setTab={setTab} />}
          {tab === "products"  && isSeller && <ProductsTab myProducts={myProducts} productsLoading={productsLoading} />}
          {tab === "store"     && isSeller && <StoreTab store={store} storeLoading={storeLoading} token={token} toast={toast} refetch={refetchStore} />}
          {tab === "messages"  && <MessagesTab conversations={conversations} />}
          {tab === "settings"  && <SettingsTab user={user} token={token} updateUser={updateUser} login={login} toast={toast} />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex shadow-lg">
        {visibleNav.map(item => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${active ? "" : "text-gray-400"}`}
              style={active ? { color: GREEN } : {}}>
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
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, icon: Icon, action }: { title: string; icon?: React.ElementType; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5" style={{ color: GREEN }} />}
        <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide">{title}</span>
      </div>
      {action}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }: { icon: React.ElementType; label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`bg-white border p-4 relative overflow-hidden ${accent ? "" : "border-gray-200"}`}
      style={accent ? { borderColor: GREEN_BORDER, borderLeftWidth: 3, borderLeftColor: GREEN } : {}}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 flex items-center justify-center" style={{ background: GREEN_LIGHT }}>
          <Icon className="w-4 h-4" style={{ color: GREEN }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-[10px] font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, action }: { icon: React.ElementType; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="py-12 flex flex-col items-center text-center">
      <div className="w-10 h-10 bg-gray-100 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <p className="font-semibold text-gray-700 text-sm">{title}</p>
      <p className="text-gray-400 text-xs mt-1 mb-4">{desc}</p>
      {action}
    </div>
  );
}

function GreenBtn({ href, onClick, children, size = "default", outline = false, disabled = false }: any) {
  const cls = `inline-flex items-center gap-1.5 font-semibold transition-colors
    ${size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm"}
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${outline
      ? `border text-[#0D3B27] hover:bg-[#0D3B27]/5`
      : `text-white hover:bg-[#0a2d1e]`
    }`;
  const style = outline
    ? { borderColor: GREEN, color: GREEN }
    : { background: disabled ? "#6b9e8c" : GREEN };
  if (href) return <Link href={href}><button className={cls} style={style}>{children}</button></Link>;
  return <button onClick={onClick} disabled={disabled} className={cls} style={style}>{children}</button>;
}

/* ─── Overview ───────────────────────────────────────────── */
function OverviewTab({ user, store, myProducts, conversations, isSeller, setTab }: any) {
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      {/* Welcome banner */}
      <div className="p-5 mb-5 flex items-center justify-between relative overflow-hidden"
        style={{ background: GREEN }}>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }} />
        <div className="relative">
          <p className="text-[11px] font-medium mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>{today}</p>
          <h1 className="text-xl font-bold text-white">{greeting}, {user.name.split(" ")[0]}</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
            Here's your {isSeller ? "seller" : "buyer"} overview
          </p>
        </div>
        <Link href="/catalog">
          <button className="hidden sm:flex items-center gap-2 bg-white text-sm font-semibold px-3.5 py-2 hover:bg-gray-50 transition-colors shrink-0"
            style={{ color: GREEN }}>
            Browse <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className={`grid gap-3 mb-5 ${isSeller ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2"}`}>
        {isSeller && (
          <>
            <StatCard icon={Package} label="Products" value={myProducts.length} accent />
            <StatCard icon={Star} label="Avg Rating"
              value={myProducts.length ? (myProducts.reduce((s: number, p: any) => s + (p.avgRating ?? 0), 0) / myProducts.length).toFixed(1) : "—"}
              sub={myProducts.length ? "across all products" : "No reviews yet"} />
          </>
        )}
        <StatCard icon={MessageSquare} label="Conversations" value={conversations.length} accent={!isSeller} />
        <StatCard icon={BarChart3} label="Account" value={user.role === "seller" ? "Seller" : "Buyer"} sub="Change in Settings" />
      </div>

      {/* Cards grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {isSeller ? (
          <>
            <Card>
              <CardHeader title="My Store" icon={Store} action={
                <button onClick={() => setTab("store")} className="text-[10px] font-semibold hover:underline" style={{ color: GREEN }}>Manage →</button>
              } />
              <div className="p-4">
                {store ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ background: GREEN_LIGHT }}>
                        <Store className="w-4 h-4" style={{ color: GREEN }} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{store.name}</p>
                        <p className="text-xs text-gray-400">@{store.slug}</p>
                      </div>
                    </div>
                    {store.description && (
                      <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2 border-l-2 pl-2.5" style={{ borderColor: GREEN_BORDER }}>{store.description}</p>
                    )}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <GreenBtn href={`/store/${store.id}`} size="sm" outline>View <ExternalLink className="w-3 h-3" /></GreenBtn>
                      <GreenBtn href="/sell" size="sm"><Plus className="w-3 h-3" />Add product</GreenBtn>
                    </div>
                  </>
                ) : (
                  <EmptyState icon={Store} title="No store yet" desc="Create your storefront to start selling"
                    action={<GreenBtn href="/store/create" size="sm">Create Store</GreenBtn>} />
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Recent Products" icon={Package} action={
                <button onClick={() => setTab("products")} className="text-[10px] font-semibold hover:underline" style={{ color: GREEN }}>View all →</button>
              } />
              {myProducts.length === 0 ? (
                <EmptyState icon={Package} title="No products yet" desc="List your first product to start earning"
                  action={<GreenBtn href="/sell" size="sm"><Plus className="w-3 h-3" />New Product</GreenBtn>} />
              ) : (
                <div>
                  {myProducts.slice(0, 5).map((p: any, i: number) => (
                    <Link key={p.id} href={`/products/${p.id}`}>
                      <div className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                        <div className="w-7 h-7 flex items-center justify-center shrink-0" style={{ background: GREEN_LIGHT }}>
                          <ShoppingBag className="w-3.5 h-3.5" style={{ color: GREEN }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                          <p className="text-xs text-gray-400">${Number(p.price).toFixed(2)}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 font-semibold ${p.status === "active" ? "" : "bg-gray-100 text-gray-500"}`}
                          style={p.status === "active" ? { background: GREEN_LIGHT, color: GREEN } : {}}>
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
          <Card className="md:col-span-2">
            <CardHeader title="Quick Actions" icon={TrendingUp} />
            <div>
              {[
                { href: "/catalog",             icon: ShoppingBag, label: "Browse Marketplace",    desc: "Discover thousands of digital products" },
                { href: "/catalog?sort=rating", icon: Star,        label: "Top Rated Products",    desc: "The best-reviewed items this month" },
                { href: "/catalog",             icon: Ticket,      label: "Browse Tickets",        desc: "Events, webinars, and live sessions" },
              ].map((item, i) => (
                <Link key={i} href={item.href}>
                  <div className={`flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                    <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ background: GREEN_LIGHT }}>
                      <item.icon className="w-4 h-4" style={{ color: GREEN }} />
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

        <Card className={!isSeller ? "md:col-span-2" : ""}>
          <CardHeader title="Recent Messages" icon={MessageSquare} action={
            <Link href="/messages"><span className="text-[10px] font-semibold hover:underline cursor-pointer" style={{ color: GREEN }}>Open inbox →</span></Link>
          } />
          {conversations.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No messages yet" desc="Contact a seller from any product page to get started" />
          ) : (
            <div>
              {conversations.slice(0, 5).map((conv: any, i: number) => (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <div className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                    <div className="w-8 h-8 flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: GREEN }}>
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
          <div className="flex justify-center py-14"><Loader2 className="w-5 h-5 animate-spin" style={{ color: GREEN }} /></div>
        ) : myProducts.length === 0 ? (
          <EmptyState icon={Package} title="No products yet" desc="Create your first product to start selling"
            action={<GreenBtn href="/sell"><Plus className="w-3.5 h-3.5" />Create a Product</GreenBtn>} />
        ) : (
          <>
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-center">Rating</div>
              <div className="col-span-2 text-center">Status</div>
            </div>
            {myProducts.map((p: any, i: number) => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <div className={`grid grid-cols-12 gap-4 items-center px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ background: GREEN_LIGHT }}>
                      <ShoppingBag className="w-3.5 h-3.5" style={{ color: GREEN }} />
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
                      <><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="text-sm font-semibold text-gray-700">{Number(p.avgRating).toFixed(1)}</span></>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className={`text-[10px] px-2 py-0.5 font-semibold ${p.status !== "active" ? "bg-gray-100 text-gray-500" : ""}`}
                      style={p.status === "active" ? { background: GREEN_LIGHT, color: GREEN } : {}}>
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
      <PageHeader title="My Store" subtitle="Manage your storefront and listings"
        action={!storeLoading && store && !editing
          ? <GreenBtn outline onClick={() => setEditing(true)}><Pencil className="w-3.5 h-3.5" />Edit</GreenBtn>
          : undefined}
      />

      {storeLoading ? (
        <div className="flex justify-center py-14"><Loader2 className="w-5 h-5 animate-spin" style={{ color: GREEN }} /></div>
      ) : store ? (
        <div className="space-y-4">
          <Card>
            {editing ? (
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Store Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} className="border-gray-200 focus:border-[#0D3B27]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Description</label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="border-gray-200 resize-none" />
                </div>
                <div className="flex gap-2">
                  <GreenBtn onClick={handleSave}>{saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Save</GreenBtn>
                  <GreenBtn outline onClick={() => setEditing(false)}><X className="w-3.5 h-3.5" />Cancel</GreenBtn>
                </div>
              </div>
            ) : (
              <>
                <div className="p-5 flex items-start gap-4 border-b border-gray-100">
                  <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ background: GREEN_LIGHT }}>
                    <Store className="w-6 h-6" style={{ color: GREEN }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-gray-900">{store.name}</h2>
                    <p className="text-xs text-gray-400">@{store.slug}</p>
                    {store.description && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{store.description}</p>}
                  </div>
                </div>
                <div className="px-5 py-3.5 flex gap-2">
                  <GreenBtn href={`/store/${store.id}`} outline size="sm">View live <ExternalLink className="w-3 h-3" /></GreenBtn>
                  <GreenBtn href="/sell" size="sm"><Plus className="w-3 h-3" />Add product</GreenBtn>
                </div>
              </>
            )}
          </Card>
        </div>
      ) : (
        <Card>
          <EmptyState icon={Store} title="No store yet" desc="Create your digital storefront to start selling"
            action={<GreenBtn href="/store/create">Create Your Store</GreenBtn>} />
        </Card>
      )}
    </div>
  );
}

/* ─── Messages tab ───────────────────────────────────────── */
function MessagesTab({ conversations }: any) {
  return (
    <div>
      <PageHeader title="Messages" subtitle="Your recent conversations"
        action={<GreenBtn href="/messages" outline>Full Inbox <ExternalLink className="w-3.5 h-3.5" /></GreenBtn>}
      />
      <Card>
        {conversations.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No conversations yet" desc="Your messages with sellers and buyers will appear here" />
        ) : (
          <div>
            {conversations.map((conv: any, i: number) => (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <div className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                  <div className="w-9 h-9 flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: GREEN }}>
                    {conv.otherUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{conv.otherUser.name}</p>
                    {conv.lastMessage && <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>}
                  </div>
                  <span className="text-[10px] text-gray-400 capitalize shrink-0 border border-gray-200 px-1.5 py-0.5">{conv.otherUser.role}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
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
  const { add } = useNotifications();
  const [name, setName]     = useState(user.name   ?? "");
  const [bio, setBio]       = useState(user.bio    ?? "");
  const [avatar, setAvatar] = useState(user.avatar ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [confirmSwitch, setConfirmSwitch] = useState(false);

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
      add({ kind: "system", title: "Profile updated", body: "Your display name and bio were saved." });
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
      setConfirmSwitch(false);
      toast({ title: `Switched to ${newRole} account`, description: "Your role has been updated." });
      add({ kind: "role", title: `Account switched to ${newRole}`, body: `You are now a ${newRole} on Velzo.` });
    } catch {
      toast({ title: "Failed to switch role", variant: "destructive" });
    } finally { setSwitchingRole(false); }
  };

  const newRole = user.role === "buyer" ? "seller" : "buyer";

  return (
    <div className="max-w-xl">
      <PageHeader title="Settings" subtitle="Manage your account profile and preferences" />

      <div className="space-y-4">
        {/* Profile */}
        <Card>
          <CardHeader title="Profile" icon={User} />
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 flex items-center justify-center text-white text-lg font-bold shrink-0"
                style={{ background: GREEN }}>
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
                <span className="inline-flex items-center mt-1 text-[10px] font-semibold px-1.5 py-0.5 capitalize"
                  style={{ background: GREEN_LIGHT, color: GREEN }}>{user.role}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Display Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} className="border-gray-200" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Bio</label>
              <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell others about yourself..." rows={3} className="border-gray-200 resize-none" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Avatar URL</label>
              <Input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." className="border-gray-200" />
            </div>
            <GreenBtn onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Profile
            </GreenBtn>
          </div>
        </Card>

        {/* Account type */}
        <Card>
          <CardHeader title="Account Type" icon={RefreshCw} />
          <div className="p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  Currently a <span className="font-bold capitalize" style={{ color: GREEN }}>{user.role}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {user.role === "buyer"
                    ? "Switch to Seller to create a store and list digital products."
                    : "Switch to Buyer to focus on browsing and purchasing."}
                </p>
              </div>
              {!confirmSwitch && (
                <button onClick={() => setConfirmSwitch(true)}
                  className="text-xs font-semibold px-3 py-1.5 border transition-colors shrink-0 hover:bg-gray-50"
                  style={{ borderColor: GREEN, color: GREEN }}>
                  Switch to {newRole}
                </button>
              )}
            </div>

            {confirmSwitch && (
              <div className="border p-4 space-y-3" style={{ borderColor: GREEN_BORDER, background: "#f7faf8" }}>
                <p className="text-sm font-semibold text-gray-800">Confirm role switch</p>
                <p className="text-xs text-gray-500">
                  You'll be switched from <strong className="capitalize">{user.role}</strong> to <strong className="capitalize">{newRole}</strong>.
                  {user.role === "seller" ? " Your store and products will remain saved." : " You can switch back at any time."}
                </p>
                <div className="flex gap-2">
                  <button onClick={switchRole} disabled={switchingRole}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                    style={{ background: GREEN }}>
                    {switchingRole ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Yes, switch to {newRole}
                  </button>
                  <button onClick={() => setConfirmSwitch(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {user.role === "buyer" && !confirmSwitch && (
              <div className="flex items-start gap-2 mt-3 p-3" style={{ background: GREEN_LIGHT }}>
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: GREEN }} />
                <p className="text-xs text-gray-600 leading-relaxed">
                  Selling on Velzo is free. No monthly fees, no listing fees — just a small cut on sales.
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
              { label: "Email",        value: user.email },
              { label: "Account ID",   value: `#${user.id}` },
              { label: "Member since", value: new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
            ].map((row, i) => (
              <div key={i} className="flex items-center px-5 py-3 gap-4">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide w-28 shrink-0">{row.label}</span>
                <span className="text-sm text-gray-700 font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
