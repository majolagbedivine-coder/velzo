import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import {
  useGetProduct, useListReviews, useCreateReview, useCreateConversation,
} from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Star, ShoppingBag, Store, MessageSquare, Download, ArrowLeft, Loader2, Heart, Share2, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

function StarRow({ rating, onSelect }: { rating: number; onSelect: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} onClick={() => onSelect(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}>
          <Star className={`w-5 h-5 transition-colors ${s <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: product, isLoading } = useGetProduct(productId);
  const { data: reviews = [] } = useListReviews(productId);
  const createReview = useCreateReview();
  const createConversation = useCreateConversation();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleReview() {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!rating) { toast({ title: "Please select a rating", variant: "destructive" }); return; }
    setSubmittingReview(true);
    try {
      await createReview.mutateAsync({ productId, data: { rating, comment } });
      setRating(0); setComment("");
      qc.invalidateQueries({ queryKey: ["/api/products/" + productId + "/reviews"] });
      toast({ title: "Review submitted!" });
    } catch {
      toast({ title: "Could not submit review", variant: "destructive" });
    } finally { setSubmittingReview(false); }
  }

  async function handleContact() {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!product) return;
    try {
      const conv = await createConversation.mutateAsync({ data: { recipientId: product.storeId } });
      navigate(`/messages/${conv.id}`);
    } catch {
      toast({ title: "Could not start conversation", variant: "destructive" });
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied to clipboard" });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center h-64"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h2 className="text-xl font-bold">Product not found</h2>
          <Link href="/catalog"><Button variant="ghost" className="mt-4">Browse marketplace</Button></Link>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link href="/catalog">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to marketplace
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Left */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-card border border-border overflow-hidden">
              <div className="aspect-video bg-primary/5 flex items-center justify-center overflow-hidden">
                {product.coverImage ? (
                  <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-16 h-16 text-primary/20" />
                )}
              </div>
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <Badge className="mb-2 capitalize">{product.category}</Badge>
                    <h1 className="text-2xl font-bold">{product.title}</h1>
                    {product.storeName && (
                      <p className="text-sm text-muted-foreground mt-1">
                        by{" "}
                        <Link href={`/store/${product.storeId}`} className="text-primary hover:underline font-medium">{product.storeName}</Link>
                      </p>
                    )}
                  </div>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{avgRating.toFixed(1)}</span>
                      <span className="text-muted-foreground text-sm">({reviews.length})</span>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">{product.description}</p>

                {/* What's included */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Included with purchase</p>
                  <div className="space-y-2">
                    {[
                      "Instant digital download",
                      "Lifetime access to updates",
                      "Commercial use license",
                      "Email support from seller",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-card border border-border p-6">
              <h2 className="text-base font-semibold mb-4">Customer Reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {review.userName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{review.userName}</p>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      {review.comment && <p className="text-sm text-muted-foreground ml-11">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-5 border-t border-border">
                <h3 className="text-sm font-semibold mb-3">Write a Review</h3>
                <StarRow rating={rating} onSelect={setRating} />
                <Textarea placeholder="Share your experience with this product..." value={comment} onChange={(e) => setComment(e.target.value)} className="mt-3 resize-none rounded-none" rows={3} />
                <Button onClick={handleReview} disabled={submittingReview} className="mt-3 gap-1">
                  {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}Submit Review
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Purchase card */}
          <div className="space-y-4">
            <div className="bg-card border border-border p-6 sticky top-20">
              <p className="text-3xl font-bold text-primary mb-0.5">${Number(product.price).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mb-6">One-time payment · Instant download</p>

              {product.fileUrl ? (
                <a href={product.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full h-11 gap-2 text-base font-semibold mb-3">
                    <Download className="w-4 h-4" />Download Now
                  </Button>
                </a>
              ) : (
                <Button className="w-full h-11 gap-2 text-base font-semibold mb-3" disabled>
                  <ShoppingBag className="w-4 h-4" />Purchase
                </Button>
              )}

              <Button onClick={handleContact} variant="outline" className="w-full h-10 gap-2 mb-3">
                <MessageSquare className="w-4 h-4" />Contact Seller
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={() => setSaved((s) => !s)}
                  variant="outline"
                  className={`flex-1 h-9 gap-1.5 text-sm ${saved ? "text-primary border-primary" : ""}`}
                >
                  <Heart className={`w-4 h-4 ${saved ? "fill-primary" : ""}`} />
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button onClick={handleShare} variant="outline" className="flex-1 h-9 gap-1.5 text-sm">
                  <Share2 className="w-4 h-4" />Share
                </Button>
              </div>

              {product.storeName && (
                <div className="mt-5 pt-5 border-t border-border">
                  <Link href={`/store/${product.storeId}`}>
                    <div className="flex items-center gap-3 hover:bg-muted p-2 -mx-2 transition-colors cursor-pointer">
                      <div className="w-9 h-9 bg-primary/10 flex items-center justify-center shrink-0">
                        <Store className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{product.storeName}</p>
                        <p className="text-xs text-muted-foreground">View all products →</p>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-border space-y-2">
                {[
                  { icon: CheckCircle2, text: "Instant delivery" },
                  { icon: CheckCircle2, text: "Secure checkout" },
                  { icon: CheckCircle2, text: "Money-back guarantee" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <item.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
