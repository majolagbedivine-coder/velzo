import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useGetMyStore, useGetMyProducts, useListConversations
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Store, Package, MessageSquare, Plus, ArrowRight, ArrowLeft,
  TrendingUp, ShoppingBag, Star, LayoutDashboard, Loader2,
  Settings, User, RefreshCw, Sun, Moon, ChevronRight,
  Edit2, Save, X, BarChart3, AlertCircle
} from "lucide-react";

type Tab = "overview" | "products" | "store" | "messages" | "settings";

function useTabFromSearch(): [Tab, (t: Tab) => void] {
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const raw = params.get("tab") as Tab | null;
  const tab: Tab = ["overview", "products", "store", "messages", "settings"].includes(raw ?? "")
    ? (raw as Tab)
    : "overview";

  const setTab = (t: Tab) => navigate(`/dashboard?tab=${t}`);
  return [tab, setTab];
}

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType; sellerOnly?: boolean }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package, sellerOnly: true },
  { id: "store", label: "My Store", icon: Store, sellerOnly: true },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Dashboard() {
  const { user, token, updateUser, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useTabFromSearch();
  const [, navigate] = useLocation();
  const { toast } = useToast();
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
          <p className="text-muted-foreground mb-4">You need to be logged in to view the dashboard.</p>
          <Link href="/login"><Button>Sign in</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border bg-card">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Velzo</span>
            </button>
            <span className="text-border">|</span>
            <span className="text-sm font-semibold text-foreground">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-screen-xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card shrink-0">
          <nav className="flex flex-col pt-6 pb-4 gap-0.5 px-3">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors text-left w-full ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden w-full border-b border-border bg-card flex overflow-x-auto shrink-0 absolute" style={{ top: "3.5rem" }}>
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6 md:p-8 mt-10 md:mt-0">
          {tab === "overview" && <OverviewTab user={user} store={store} myProducts={myProducts} conversations={conversations} isSeller={isSeller} setTab={setTab} />}
          {tab === "products" && isSeller && <ProductsTab myProducts={myProducts} productsLoading={productsLoading} refetch={refetchProducts} />}
          {tab === "store" && isSeller && <StoreTab store={store} storeLoading={storeLoading} token={token} toast={toast} refetch={refetchStore} />}
          {tab === "messages" && <MessagesTab conversations={conversations} />}
          {tab === "settings" && <SettingsTab user={user} token={token} updateUser={updateUser} login={login} toast={toast} />}
        </main>
      </div>
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
      <h2 className="text-lg font-semibold">{title}</h2>
      {action}
    </div>
  );
}

function StatBox({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-card border border-border p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="text-muted-foreground mt-1 text-sm capitalize">{user.role} account · {user.email}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border mb-8">
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
        <StatBox icon={MessageSquare} label="Conversations" value={conversations.length} />
        <StatBox icon={BarChart3} label="Account Type" value={user.role} sub="Switch in Settings" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {isSeller ? (
          <>
            <div className="bg-card border border-border">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">My Store</span>
                </div>
                <button onClick={() => setTab("store")} className="text-xs text-primary hover:underline">Manage</button>
              </div>
              <div className="p-5">
                {store ? (
                  <div>
                    <p className="font-semibold">{store.name}</p>
                    <p className="text-xs text-muted-foreground">@{store.slug}</p>
                    {store.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{store.description}</p>}
                    <div className="flex gap-2 mt-4">
                      <Link href={`/store/${store.id}`}>
                        <Button variant="outline" size="sm" className="gap-1 text-xs">View <ArrowRight className="w-3 h-3" /></Button>
                      </Link>
                      <Link href="/sell">
                        <Button size="sm" className="gap-1 text-xs"><Plus className="w-3 h-3" />Add product</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground mb-3">No store yet</p>
                    <Link href="/store/create"><Button size="sm">Create store</Button></Link>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Recent Products</span>
                </div>
                <button onClick={() => setTab("products")} className="text-xs text-primary hover:underline">View all</button>
              </div>
              <div className="divide-y divide-border">
                {myProducts.slice(0, 4).map((p: any) => (
                  <Link key={p.id} href={`/products/${p.id}`}>
                    <div className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors cursor-pointer">
                      <ShoppingBag className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">${Number(p.price).toFixed(2)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 font-medium ${p.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {p.status}
                      </span>
                    </div>
                  </Link>
                ))}
                {myProducts.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">No products yet</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-card border border-border md:col-span-2">
            <div className="px-5 py-4 border-b border-border">
              <span className="font-semibold text-sm">Quick Actions</span>
            </div>
            <div className="divide-y divide-border">
              {[
                { href: "/catalog", icon: ShoppingBag, label: "Browse Marketplace", desc: "Discover digital products" },
                { href: "/catalog?sort=rating", icon: Star, label: "Top Rated Products", desc: "Best reviewed items" },
                { href: "/catalog", icon: TrendingUp, label: "Trending Now", desc: "What's popular this week" },
              ].map((item, i) => (
                <Link key={i} href={item.href}>
                  <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted transition-colors cursor-pointer">
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
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Recent Messages</span>
            </div>
            <Link href="/messages" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {conversations.slice(0, 4).map((conv: any) => (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <div className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                    {conv.otherUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{conv.otherUser.name}</p>
                    {conv.lastMessage && <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>}
                  </div>
                </div>
              </Link>
            ))}
            {conversations.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No messages yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsTab({ myProducts, productsLoading, refetch }: any) {
  return (
    <div>
      <SectionHeader
        title="Your Products"
        action={
          <Link href="/sell">
            <Button size="sm" className="gap-1"><Plus className="w-3.5 h-3.5" />Add Product</Button>
          </Link>
        }
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
              <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ${Number(p.price).toFixed(2)} · {p.avgRating > 0 ? `★ ${p.avgRating.toFixed(1)}` : "No ratings"}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 font-medium shrink-0 ${p.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {p.status}
                </span>
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
    if (store) {
      setName(store.name ?? "");
      setDescription(store.description ?? "");
    }
  }, [store]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/stores/${store.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Failed to update store");
      await refetch();
      setEditing(false);
      toast({ title: "Store updated" });
    } catch {
      toast({ title: "Failed to update store", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="My Store"
        action={
          !storeLoading && store && !editing ? (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1">
              <Edit2 className="w-3.5 h-3.5" />Edit
            </Button>
          ) : undefined
        }
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
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}><X className="w-3.5 h-3.5 mr-1" />Cancel</Button>
              </div>
            </div>
          ) : (
            <div>
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
                <Link href={`/store/${store.id}`}>
                  <Button variant="outline" size="sm" className="gap-1">View Store <ArrowRight className="w-3.5 h-3.5" /></Button>
                </Link>
                <Link href="/sell">
                  <Button size="sm" className="gap-1"><Plus className="w-3.5 h-3.5" />Add Product</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border p-12 text-center">
          <Store className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">No store created yet</p>
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
        action={
          <Link href="/messages">
            <Button size="sm" variant="outline" className="gap-1">Open Inbox <ArrowRight className="w-3.5 h-3.5" /></Button>
          </Link>
        }
      />
      {conversations.length === 0 ? (
        <div className="bg-card border border-border p-12 text-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">No messages yet</p>
          <p className="text-sm text-muted-foreground">Start a conversation by contacting a seller</p>
        </div>
      ) : (
        <div className="bg-card border border-border divide-y divide-border">
          {conversations.map((conv: any) => (
            <Link key={conv.id} href={`/messages/${conv.id}`}>
              <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                  {conv.otherUser.name.slice(0, 2).toUpperCase()}
                </div>
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
      toast({ title: "Profile updated successfully" });
    } catch {
      toast({ title: "Failed to save profile", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
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
    } finally {
      setSwitchingRole(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile */}
      <div className="bg-card border border-border">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Profile Information</span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="w-14 h-14 bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {avatar ? (
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                user.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Display Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell buyers/sellers about yourself..."
              rows={3}
              className="rounded-none resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Avatar URL</label>
            <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." className="rounded-none" />
          </div>
          <div className="pt-2">
            <Button onClick={saveProfile} disabled={savingProfile} className="gap-1">
              {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Account Type */}
      <div className="bg-card border border-border">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Account Type</span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">
                Currently a{" "}
                <span className="capitalize font-bold text-primary">{user.role}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {user.role === "buyer"
                  ? "Switch to a seller account to create a store and list products."
                  : "Switch to a buyer account to focus on browsing and purchasing products."}
              </p>
            </div>
            <Button
              onClick={switchRole}
              disabled={switchingRole}
              variant="outline"
              size="sm"
              className="shrink-0 gap-1"
            >
              {switchingRole ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Switch to {user.role === "buyer" ? "Seller" : "Buyer"}
            </Button>
          </div>
          {user.role === "buyer" && (
            <div className="mt-4 flex items-start gap-2 bg-primary/5 border border-primary/20 p-3">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Switching to seller gives you access to create stores, list products, and manage sales from your dashboard.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-card border border-border">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Account Details</span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {[
            { label: "Email", value: user.email },
            { label: "Member since", value: new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
            { label: "Account ID", value: `#${user.id}` },
          ].map((row, i) => (
            <div key={i} className="flex items-center px-6 py-3 gap-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-28 shrink-0">{row.label}</span>
              <span className="text-sm">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
