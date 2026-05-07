import { useState } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetProduct,
  useListReviews,
  useCreateReview,
  useCreateConversation,
} from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Star,
  ShoppingBag,
  Store,
  MessageSquare,
  Download,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

function StarRow({ rating, onSelect }: { rating: number; onSelect: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              s <= (hover || rating)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-200"
            }`}
          />
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

  async function handleReview() {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!rating) { toast({ title: "Please select a rating", variant: "destructive" }); return; }
    setSubmittingReview(true);
    try {
      await createReview.mutateAsync({ productId, data: { rating, comment } });
      setRating(0);
      setComment("");
      qc.invalidateQueries({ queryKey: ["/api/products/" + productId + "/reviews"] });
      toast({ title: "Review submitted!" });
    } catch {
      toast({ title: "Could not submit review", variant: "destructive" });
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleContact() {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!product) return;
    try {
      const conv = await createConversation.mutateAsync({
        data: { recipientId: product.storeId },
      });
      navigate(`/messages/${conv.id}`);
    } catch {
      toast({ title: "Could not start conversation", variant: "destructive" });
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

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5F5F1]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h2 className="text-xl font-bold text-gray-700">Product not found</h2>
          <Link href="/catalog">
            <Button variant="ghost" className="mt-4 text-[#1D6146]">
              Browse marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-[#F5F5F1]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link href="/catalog">
          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1D6146] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to marketplace
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Product info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-[#1D6146]/10 to-[#1D6146]/5 flex items-center justify-center">
                {product.coverImage ? (
                  <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-16 h-16 text-[#1D6146]/20" />
                )}
              </div>
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <Badge className="mb-2 bg-[#1D6146]/10 text-[#1D6146] capitalize">{product.category}</Badge>
                    <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
                    {product.storeName && (
                      <p className="text-sm text-gray-500 mt-1">
                        by{" "}
                        <Link href={`/store/${product.storeId}`} className="text-[#1D6146] hover:underline font-medium">
                          {product.storeName}
                        </Link>
                      </p>
                    )}
                  </div>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-gray-800">{avgRating.toFixed(1)}</span>
                      <span className="text-gray-400 text-sm">({reviews.length})</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-[#1D6146]/10 text-[#1D6146] text-xs font-bold">
                            {review.userName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{review.userName}</p>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 ml-11">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Write a review */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Write a review</h3>
                <StarRow rating={rating} onSelect={setRating} />
                <Textarea
                  placeholder="Share your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-3 resize-none border-gray-200 rounded-xl"
                  rows={3}
                />
                <Button
                  onClick={handleReview}
                  disabled={submittingReview}
                  className="mt-3 bg-[#1D6146] text-white hover:bg-[#174f38]"
                >
                  {submittingReview && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Review
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Purchase card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <p className="text-3xl font-bold text-[#1D6146] mb-1">
                ${Number(product.price).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mb-6">One-time payment · Instant download</p>
              {product.fileUrl ? (
                <a href={product.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-[#1D6146] text-white hover:bg-[#174f38] h-12 rounded-xl gap-2 text-base font-semibold">
                    <Download className="w-5 h-5" />
                    Download Now
                  </Button>
                </a>
              ) : (
                <Button className="w-full bg-[#1D6146] text-white hover:bg-[#174f38] h-12 rounded-xl gap-2 text-base font-semibold" disabled>
                  <ShoppingBag className="w-5 h-5" />
                  Purchase
                </Button>
              )}
              <Button
                onClick={handleContact}
                variant="outline"
                className="w-full mt-3 h-11 rounded-xl border-gray-200 gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Contact Seller
              </Button>

              {product.storeName && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link href={`/store/${product.storeId}`}>
                    <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                      <div className="w-9 h-9 bg-[#1D6146]/10 rounded-xl flex items-center justify-center">
                        <Store className="w-4 h-4 text-[#1D6146]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{product.storeName}</p>
                        <p className="text-xs text-gray-400">View all products →</p>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
