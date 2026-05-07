import { useState } from "react";
import { useLocation } from "wouter";
import { useGetMyStore, useCreateProduct } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Package, Loader2, Store, ArrowRight } from "lucide-react";

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
        data: {
          title: title.trim(),
          description: description.trim(),
          price: priceNum,
          category,
          coverImage: coverImage.trim() || undefined,
          fileUrl: fileUrl.trim() || undefined,
        },
      });
      toast({ title: "Product listed!", description: `"${product.title}" is now live.` });
      navigate(`/products/${product.id}`);
    } catch (err: any) {
      toast({
        title: "Failed to create product",
        description: err?.data?.error ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

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
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <div className="bg-white rounded-2xl border border-gray-100 p-10">
            <div className="w-16 h-16 bg-[#1D6146]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-[#1D6146]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create a store first</h2>
            <p className="text-gray-500 mb-6">You need a store before you can list products.</p>
            <Link href="/store/create">
              <Button className="bg-[#1D6146] text-white hover:bg-[#174f38] gap-2">
                Create your store
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F1]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1D6146]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-[#1D6146]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">List a product</h1>
          <p className="text-gray-500 mt-2">
            Selling in{" "}
            <Link href={`/store/${store.id}`} className="text-[#1D6146] font-medium hover:underline">
              {store.name}
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Title <span className="text-red-400">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Minimal Resume Template Pack"
                className="rounded-xl border-gray-200 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Description <span className="text-red-400">*</span>
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what buyers will get, what's included, and how to use it..."
                className="rounded-xl border-gray-200 resize-none"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Price (USD) <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="9.99"
                    className="pl-7 rounded-xl border-gray-200 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Category <span className="text-red-400">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-xl border-gray-200 h-11">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Cover Image URL</Label>
              <Input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/cover.png"
                className="rounded-xl border-gray-200 h-11"
              />
              <p className="text-xs text-gray-400">Paste a public image URL for your product thumbnail.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">File/Download URL</Label>
              <Input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://example.com/download.zip"
                className="rounded-xl border-gray-200 h-11"
              />
              <p className="text-xs text-gray-400">Direct download link buyers will receive.</p>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-[#1D6146] text-white hover:bg-[#174f38] rounded-xl text-base font-semibold"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publishing...</>
              ) : (
                "Publish Product"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
