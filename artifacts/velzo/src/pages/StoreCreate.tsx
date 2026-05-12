import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useGetMyStore, useCreateStore } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Store, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

export default function StoreCreate() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: myStoreData, isLoading } = useGetMyStore();
  const createStore = useCreateStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const store = myStoreData?.store;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast({ title: "Store name is required", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const newStore = await createStore.mutateAsync({ data: { name, description } });
      toast({ title: "Store created!", description: `"${newStore.name}" is live.` });
      navigate(`/store/${newStore.id}`);
    } catch (err: any) {
      toast({ title: "Failed to create store", description: err?.data?.error ?? "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center h-64"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (store) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="bg-card border border-border p-10">
            <div className="w-14 h-14 bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Store className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">You already have a store</h2>
            <p className="text-muted-foreground text-sm mb-6">"{store.name}" is your active store.</p>
            <div className="flex gap-3 justify-center">
              <Link href={`/store/${store.id}`}>
                <Button className="gap-2">View store <ArrowRight className="w-4 h-4" /></Button>
              </Link>
              <Link href="/sell">
                <Button variant="outline">Add products</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-10">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to dashboard
        </button>

        <div className="mb-7">
          <div className="flex items-center gap-3 mb-1">
            <Store className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold">Create your store</h1>
          </div>
          <p className="text-muted-foreground text-sm">Set up your digital storefront and start selling in minutes.</p>
        </div>

        <div className="bg-card border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Store Name <span className="text-destructive">*</span>
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Design Studio Pro" className="rounded-none" />
              <p className="text-xs text-muted-foreground">This becomes your public store name and URL slug.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell buyers what you sell and what makes you unique..." className="rounded-none resize-none" rows={4} />
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={submitting || !name.trim()} className="w-full h-11 text-base font-semibold gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Creating store...</> : <>Create Store <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
