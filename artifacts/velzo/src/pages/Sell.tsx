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
import { useNotifications } from "@/contexts/NotificationsContext";
import {
  Package, Loader2, Store, ArrowRight, ArrowLeft,
  Image, Video, FileText, Music, Ticket, Code, File, Info
} from "lucide-react";

const GREEN = "#0D3B27";
const GREEN_LIGHT = "#e6f0ea";

const CATEGORIES = [
  "templates", "ebooks", "courses", "software", "graphics", "music",
  "photography", "fonts", "3d models", "plugins", "spreadsheets", "videos",
  "audio", "illustrations", "icons", "mockups", "presets", "games", "scripts",
  "tickets",
];

type FileType = "image" | "video" | "document" | "audio" | "ticket" | "software" | "other";

const FILE_TYPES: { value: FileType; label: string; icon: React.ElementType; placeholder: string; hint: string }[] = [
  {
    value: "image",
    label: "Image / Artwork",
    icon: Image,
    placeholder: "https://drive.google.com/file/your-image-pack.zip",
    hint: "PNG, JPG, SVG packs, Photoshop/Illustrator files, etc.",
  },
  {
    value: "video",
    label: "Video / Course",
    icon: Video,
    placeholder: "https://vimeo.com/your-video or https://drive.google.com/...",
    hint: "MP4, stream links, Vimeo/YouTube private links, LMS links, etc.",
  },
  {
    value: "document",
    label: "Document / E-Book",
    icon: FileText,
    placeholder: "https://drive.google.com/file/your-ebook.pdf",
    hint: "PDF, DOCX, EPUB, Notion templates, Google Docs links, etc.",
  },
  {
    value: "audio",
    label: "Audio / Music",
    icon: Music,
    placeholder: "https://drive.google.com/file/your-track.mp3",
    hint: "MP3, WAV, FLAC, sample packs, loops, stems, etc.",
  },
  {
    value: "ticket",
    label: "Event Ticket / Access",
    icon: Ticket,
    placeholder: "https://your-event-platform.com/event/your-event",
    hint: "Webinar links, event access codes, Zoom/Discord invite links, etc.",
  },
  {
    value: "software",
    label: "Software / Plugin",
    icon: Code,
    placeholder: "https://github.com/you/your-repo or download link",
    hint: "App installers, browser extensions, scripts, CLI tools, etc.",
  },
  {
    value: "other",
    label: "Other File",
    icon: File,
    placeholder: "https://your-download-link.com/file",
    hint: "Any other digital file or product.",
  },
];

export default function Sell() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { add: addNotif } = useNotifications();
  const { data: myStoreData, isLoading: storeLoading } = useGetMyStore();
  const createProduct = useCreateProduct();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState<FileType>("document");
  const [submitting, setSubmitting] = useState(false);

  const store = myStoreData?.store;
  const selectedFileType = FILE_TYPES.find(t => t.value === fileType) ?? FILE_TYPES[2];
  const FileIcon = selectedFileType.icon;

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
      addNotif({
        kind: "product",
        title: "Product published",
        body: `"${product.title}" is now live on the marketplace.`,
        href: `/products/${product.id}`,
      });
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
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: GREEN }} />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="bg-white border border-gray-200 p-10">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4" style={{ background: GREEN_LIGHT }}>
              <Store className="w-6 h-6" style={{ color: GREEN }} />
            </div>
            <h2 className="text-lg font-bold mb-2">Create a store first</h2>
            <p className="text-gray-500 text-sm mb-6">You need a store before you can list products.</p>
            <Link href="/store/create">
              <Button className="gap-2">Create your store <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f4] text-foreground">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate(`/store/${store.id}`)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 mb-5 transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />Back to store
        </button>

        {/* Page title */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 flex items-center justify-center" style={{ background: GREEN }}>
              <Package className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">List a product</h1>
          </div>
          <p className="text-xs text-gray-500 ml-11">
            Selling in{" "}
            <Link href={`/store/${store.id}`} className="font-semibold hover:underline" style={{ color: GREEN }}>{store.name}</Link>
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Minimal Resume Template Pack" className="border-gray-200" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what buyers get, what's included, and how to use it..."
                className="border-gray-200 resize-none" rows={4} />
            </div>

            {/* Price + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Price (USD) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <Input type="number" min="0" step="0.01" value={price}
                    onChange={(e) => setPrice(e.target.value)} placeholder="9.99"
                    className="pl-7 border-gray-200" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-gray-200"><SelectValue placeholder="Select..." /></SelectTrigger>
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

            {/* Cover image */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cover Image URL</Label>
              <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/cover.png" className="border-gray-200" />
              <p className="text-[10px] text-gray-400">Paste a public image URL for your product thumbnail.</p>
            </div>

            {/* File section */}
            <div className="border border-gray-200 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2" style={{ background: GREEN_LIGHT }}>
                <FileIcon className="w-3.5 h-3.5" style={{ color: GREEN }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: GREEN }}>Product File / Download</span>
              </div>
              <div className="p-4 space-y-3">
                {/* File type selector */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">File Type</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {FILE_TYPES.map(ft => {
                      const Ic = ft.icon;
                      const sel = fileType === ft.value;
                      return (
                        <button
                          key={ft.value}
                          type="button"
                          onClick={() => setFileType(ft.value)}
                          className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium border transition-colors`}
                          style={sel ? { borderColor: GREEN, background: GREEN_LIGHT, color: GREEN }
                            : { borderColor: "#e5e7eb", color: "#6b7280" }}
                        >
                          <Ic className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{ft.label.split(" ")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* URL input */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {selectedFileType.label} URL
                  </Label>
                  <div className="relative">
                    <FileIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)}
                      placeholder={selectedFileType.placeholder}
                      className="pl-8 border-gray-200 text-sm" />
                  </div>
                </div>

                {/* Hint */}
                <div className="flex items-start gap-2 p-2.5 bg-gray-50 border border-gray-100">
                  <Info className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-gray-500 leading-relaxed">{selectedFileType.hint}</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: GREEN }}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</>
                ) : (
                  <><Package className="w-4 h-4" />Publish Product</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
