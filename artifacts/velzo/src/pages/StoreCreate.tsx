import { useState } from "react";
import { useLocation } from "wouter";
import { useGetMyStore, useCreateStore } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Store, Loader2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

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
    if (!name.trim()) {
      toast({ title: "Store name is required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const newStore = await createStore.mutateAsync({ data: { name, description } });
      toast({ title: "Store created!", description: `"${newStore.name}" is live.` });
      navigate(`/store/${newStore.id}`);
    } catch (err: any) {
      toast({
        title: "Failed to create store",
        description: err?.data?.error ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F1]">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#1D6146]" />
        </div>
      </div>
    );
  }

  if (store) {
    return (
      <div className="min-h-screen bg-[#F5F5F1]">
        <Navbar />
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <div className="bg-white rounded-2xl border border-gray-100 p-10">
            <div className="w-16 h-16 bg-[#1D6146]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-[#1D6146]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You already have a store</h2>
            <p className="text-gray-500 mb-6">"{store.name}" is your active store.</p>
            <div className="flex gap-3 justify-center">
              <Link href={`/store/${store.id}`}>
                <Button className="bg-[#1D6146] text-white hover:bg-[#174f38] gap-2">
                  View store
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/sell">
                <Button variant="outline" className="border-gray-200">
                  Add products
                </Button>
              </Link>
            </div>
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
            <Store className="w-8 h-8 text-[#1D6146]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create your store</h1>
          <p className="text-gray-500 mt-2">Set up your digital storefront and start selling in minutes.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Store name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Design Studio Pro"
                className="rounded-xl border-gray-200 h-11"
              />
              <p className="text-xs text-gray-400">
                This will be your store's public name and will generate your URL slug.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell buyers what you sell and what makes you unique..."
                className="rounded-xl border-gray-200 resize-none"
                rows={4}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || !name.trim()}
              className="w-full h-12 bg-[#1D6146] text-white hover:bg-[#174f38] rounded-xl text-base font-semibold"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating store...</>
              ) : (
                <>Create Store <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
