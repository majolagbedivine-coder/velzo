import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useGetMyStore, useCreateProduct } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, Loader2, Store, ArrowRight, ArrowLeft } from "lucide-react";

const CATEGORIES = [
  "templates", "ebooks", "courses", "software", "graphics", "music",
  "photography", "fonts", "3d models", "plugins", "spreadsheets", "videos",
  "audio", "illustrations", "icons", "mockups", "presets", "games", "scripts",
];

export default function Sell() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: myStoreData, isLoading: storeLoading } = useGetMyStore();
  const createProduct = useCreateProduct();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const store = myStoreData?.store;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !price || !category) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast({ title: "Invalid price", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const product = await createProduct.mutateAsync({
        data: { title: title.trim(), description: description.trim(), price: priceNum, category, coverImage: coverImage.trim() || undefined, fileUrl: fileUrl.trim() || undefined },
      });
      toast({ title: "Product listed!", description: `"${product.title}" is now live.` });
      navigate(`/products/${product.id}`);
    } catch (err: any) {
      toast({ title: "Failed to create product", description: err?.data?.error ?? "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

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
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="bg-card border border-border p-10">
            <div className="w-14 h-14 bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Store className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Create a store first</h2>
            <p className="text-muted-foreground text-sm mb-6">You need a store before you can list products.</p>
            <Link href="/store/create">
              <Button className="gap-2">Create your store <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button onClick={() => navigate(`/store/${store.id}`)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to store
        </button>

        <div className="mb-7">
          <div className="flex items-center gap-3 mb-1">
            <Package className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold">List a product</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Selling in{" "}
            <Link href={`/store/${store.id}`} className="text-primary font-medium hover:underline">{store.name}</Link>
          </p>
        </div>

        <div className="bg-card border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Minimal Resume Template Pack" className="rounded-none" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what buyers will get, what's included, and how to use it..." className="rounded-none resize-none" rows={5} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Price (USD) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="9.99" className="pl-7 rounded-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-none"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cover Image URL</Label>
              <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://example.com/cover.png" className="rounded-none" />
              <p className="text-xs text-muted-foreground">Paste a public image URL for your product thumbnail.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">File / Download URL</Label>
              <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://example.com/download.zip" className="rounded-none" />
              <p className="text-xs text-muted-foreground">Direct download link buyers will receive after purchase.</p>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={submitting} className="w-full h-11 text-base font-semibold">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publishing...</> : "Publish Product"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
