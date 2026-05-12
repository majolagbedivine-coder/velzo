import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useGetMyStore, useGetMyProducts, useListConversations
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Store, Package, MessageSquare, Plus, ArrowRight, ArrowLeft,
  TrendingUp, ShoppingBag, Star, LayoutDashboard, Loader2,
  Settings, User, RefreshCw, Sun, Moon, ChevronRight,
  ChevronLeft, Save, X, BarChart3, AlertCircle, PanelLeftClose, PanelLeftOpen
} from "lucide-react";

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

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType; sellerOnly?: boolean }[] = [
  { id: "overview",  label: "Overview",  icon: LayoutDashboard },
  { id: "products",  label: "Products",  icon: Package,         sellerOnly: true },
  { id: "store",     label: "My Store",  icon: Store,           sellerOnly: true },
  { id: "messages",  label: "Messages",  icon: MessageSquare },
  { id: "settings",  label: "Settings",  icon: Settings },
];

export default function Dashboard() {
  const { user, token, updateUser, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useActiveTab();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const isSeller = user?.role === "seller";

  const { data: myStoreData, isLoading: storeLoading, refetch: refetchStore } = useGetMyStore();
  const { data: myProducts = [], isLoading: productsLoading, refetch: refetchProducts } = useGetMyProducts();
  const { data: conversations = [] } = useListConversations();
  const store = myStoreData?.store;

  const visibleNav = NAV_ITEMS.filter((n) => !n.sellerOnly || isSeller);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">You need to be logged in.</p>
          <Link href="/login"><Button>Sign in</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border bg-card shrink-0">
        <div className="h-14 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <span className="text-border select-none">|</span>
            <span className="text-sm font-semibold">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar — desktop */}
        <aside className={`hidden md:flex flex-col border-r border-border bg-card shrink-0 transition-all duration-200 ${collapsed ? "w-14" : "w-56"}`}>
          <nav className="flex flex-col flex-1 pt-4 gap-0.5 px-2">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors text-left w-full ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
          <div className="p-2 border-t border-border">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="flex items-center gap-3 px-3 py-2 w-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="w-4 h-4 shrink-0" /> : <><PanelLeftClose className="w-4 h-4 shrink-0" /><span>Collapse</span></>}
            </button>
          </div>
        </aside>

        {/* Mobile bottom tab bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8 pb-24 md:pb-8">
          {tab === "overview"  && <OverviewTab user={user} store={store} myProducts={myProducts} conversations={conversations} isSeller={isSeller} setTab={setTab} />}
          {tab === "products"  && isSeller && <ProductsTab myProducts={myProducts} productsLoading={productsLoading} />}
          {tab === "store"     && isSeller && <StoreTab store={store} storeLoading={storeLoading} token={token} toast={toast} refetch={refetchStore} />}
          {tab === "messages"  && <MessagesTab conversations={conversations} />}
          {tab === "settings"  && <SettingsTab user={user} token={token} updateUser={updateUser} login={login} toast={toast} />}
        </main>
      </div>
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
      <h2 className="text-base font-semibold">{title}</h2>
      {action}
    </div>
  );
}

function StatBox({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-card border border-border p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function OverviewTab({ user, store, myProducts, conversations, isSeller, setTab }: any) {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="text-muted-foreground mt-1 text-sm capitalize">{user.role} account · {user.email}</p>
      </div>

      <div className={`grid gap-px bg-border mb-8 ${isSeller ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2"}`}>
        {isSeller && (
          <>
            <StatBox icon={Package} label="Products" value={myProducts.length} />
            <StatBox
              icon={Star}
              label="Avg Rating"
              value={myProducts.length ? (myProducts.reduce((s: number, p: any) => s + p.avgRating, 0) / myProducts.length).toFixed(1) : "—"}
            />
          </>
        )}
        <StatBox icon={MessageSquare} label="Messages" value={conversations.length} />
        <StatBox icon={BarChart3} label="Account" value={user.role} sub="Change in Settings" />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {isSeller ? (
          <>
            <div className="bg-card border border-border">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold"><Store className="w-4 h-4 text-primary" />My Store</div>
                <button onClick={() => setTab("store")} className="text-xs text-primary hover:underline">Manage</button>
              </div>
              <div className="p-5">
                {store ? (
                  <>
                    <p className="font-semibold">{store.name}</p>
                    <p className="text-xs text-muted-foreground">@{store.slug}</p>
                    {store.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{store.description}</p>}
                    <div className="flex gap-2 mt-4">
                      <Link href={`/store/${store.id}`}><Button variant="outline" size="sm" className="gap-1 text-xs">View <ArrowRight className="w-3 h-3" /></Button></Link>
                      <Link href="/sell"><Button size="sm" className="gap-1 text-xs"><Plus className="w-3 h-3" />Add product</Button></Link>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground mb-3">No store yet</p>
                    <Link href="/store/create"><Button size="sm">Create store</Button></Link>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold"><Package className="w-4 h-4 text-primary" />Recent Products</div>
                <button onClick={() => setTab("products")} className="text-xs text-primary hover:underline">View all</button>
              </div>
              <div className="divide-y divide-border">
                {myProducts.slice(0, 5).map((p: any) => (
                  <Link key={p.id} href={`/products/${p.id}`}>
                    <div className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                      <ShoppingBag className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">${Number(p.price).toFixed(2)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 font-medium shrink-0 ${p.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
                    </div>
                  </Link>
                ))}
                {myProducts.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">No products yet</div>}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-card border border-border md:col-span-2">
            <div className="px-5 py-3.5 border-b border-border text-sm font-semibold">Quick Actions</div>
            <div className="divide-y divide-border">
              {[
                { href: "/catalog",             icon: ShoppingBag, label: "Browse Marketplace",  desc: "Discover digital products" },
                { href: "/catalog?sort=rating", icon: Star,        label: "Top Rated Products",  desc: "Best reviewed items" },
                { href: "/catalog",             icon: TrendingUp,  label: "Trending Now",        desc: "What's popular this week" },
              ].map((item, i) => (
                <Link key={i} href={item.href}>
                  <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <item.icon className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className={`bg-card border border-border ${!isSeller ? "md:col-span-2" : ""}`}>
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold"><MessageSquare className="w-4 h-4 text-primary" />Recent Messages</div>
            <Link href="/messages" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {conversations.slice(0, 5).map((conv: any) => (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <div className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">{conv.otherUser.name.slice(0, 2).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{conv.otherUser.name}</p>
                    {conv.lastMessage && <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
            {conversations.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">No messages yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsTab({ myProducts, productsLoading }: any) {
  return (
    <div>
      <SectionHeader
        title="Your Products"
        action={<Link href="/sell"><Button size="sm" className="gap-1"><Plus className="w-3.5 h-3.5" />Add Product</Button></Link>}
      />
      {productsLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : myProducts.length === 0 ? (
        <div className="bg-card border border-border p-12 text-center">
          <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">No products yet</p>
          <p className="text-sm text-muted-foreground mb-4">Create your first product to start selling</p>
          <Link href="/sell"><Button>Create a Product</Button></Link>
        </div>
      ) : (
        <div className="bg-card border border-border divide-y divide-border">
          {myProducts.map((p: any) => (
            <Link key={p.id} href={`/products/${p.id}`}>
              <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">${Number(p.price).toFixed(2)} · {p.avgRating > 0 ? `★ ${p.avgRating.toFixed(1)}` : "No ratings"}</p>
                </div>
                <span className={`text-xs px-2 py-1 font-medium shrink-0 ${p.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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
      toast({ title: "Store updated" });
    } catch {
      toast({ title: "Failed to update store", variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <div>
      <SectionHeader
        title="My Store"
        action={!storeLoading && store && !editing ? (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1">Edit</Button>
        ) : undefined}
      />
      {storeLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : store ? (
        <div className="bg-card border border-border">
          {editing ? (
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Store Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="rounded-none resize-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving} className="gap-1">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Save
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}><X className="w-3.5 h-3.5 mr-1" />Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 py-5 border-b border-border">
                <p className="font-semibold text-lg">{store.name}</p>
                <p className="text-sm text-muted-foreground">@{store.slug}</p>
              </div>
              {store.description && (
                <div className="px-6 py-4 border-b border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm">{store.description}</p>
                </div>
              )}
              <div className="px-6 py-4 flex gap-3">
                <Link href={`/store/${store.id}`}><Button variant="outline" size="sm" className="gap-1">View Store <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
                <Link href="/sell"><Button size="sm" className="gap-1"><Plus className="w-3.5 h-3.5" />Add Product</Button></Link>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border p-12 text-center">
          <Store className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">No store yet</p>
          <p className="text-sm text-muted-foreground mb-4">Create your store to start selling on Velzo</p>
          <Link href="/store/create"><Button>Create Store</Button></Link>
        </div>
      )}
    </div>
  );
}

function MessagesTab({ conversations }: any) {
  return (
    <div>
      <SectionHeader
        title="Messages"
        action={<Link href="/messages"><Button size="sm" variant="outline" className="gap-1">Open Inbox <ArrowRight className="w-3.5 h-3.5" /></Button></Link>}
      />
      {conversations.length === 0 ? (
        <div className="bg-card border border-border p-12 text-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">No messages yet</p>
          <p className="text-sm text-muted-foreground">Contact a seller from any product page</p>
        </div>
      ) : (
        <div className="bg-card border border-border divide-y divide-border">
          {conversations.map((conv: any) => (
            <Link key={conv.id} href={`/messages/${conv.id}`}>
              <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">{conv.otherUser.name.slice(0, 2).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{conv.otherUser.name}</p>
                  {conv.lastMessage && <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ user, token, updateUser, login, toast }: any) {
  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
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
      toast({ title: "Profile updated" });
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
      toast({ title: `Switched to ${newRole} account` });
    } catch {
      toast({ title: "Failed to switch role", variant: "destructive" });
    } finally { setSwitchingRole(false); }
  };

  return (
    <div className="max-w-xl space-y-5">
      {/* Profile */}
      <div className="bg-card border border-border">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2 text-sm font-semibold">
          <User className="w-4 h-4 text-primary" />Profile Information
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Display Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell others about yourself..." rows={3} className="rounded-none resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Avatar URL</label>
            <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." className="rounded-none" />
          </div>
          <Button onClick={saveProfile} disabled={savingProfile} className="gap-1">
            {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Save Profile
          </Button>
        </div>
      </div>

      {/* Role switch */}
      <div className="bg-card border border-border">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2 text-sm font-semibold">
          <RefreshCw className="w-4 h-4 text-primary" />Account Type
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">Currently a <span className="capitalize font-bold text-primary">{user.role}</span></p>
              <p className="text-sm text-muted-foreground mt-1">
                {user.role === "buyer"
                  ? "Switch to seller to create a store and list products."
                  : "Switch to buyer to focus on browsing and purchasing."}
              </p>
            </div>
            <Button onClick={switchRole} disabled={switchingRole} variant="outline" size="sm" className="shrink-0 gap-1">
              {switchingRole ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Switch to {user.role === "buyer" ? "Seller" : "Buyer"}
            </Button>
          </div>
          {user.role === "buyer" && (
            <div className="mt-4 flex items-start gap-2 bg-primary/5 border border-primary/20 p-3">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">Switching to seller unlocks store creation, product listing, and sales management.</p>
            </div>
          )}
        </div>
      </div>

      {/* Account info */}
      <div className="bg-card border border-border">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2 text-sm font-semibold">
          <Settings className="w-4 h-4 text-primary" />Account Details
        </div>
        <div className="divide-y divide-border">
          {[
            { label: "Email", value: user.email },
            { label: "Member since", value: new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
            { label: "Account ID", value: `#${user.id}` },
          ].map((row, i) => (
            <div key={i} className="flex items-center px-5 py-3 gap-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-28 shrink-0">{row.label}</span>
              <span className="text-sm">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
