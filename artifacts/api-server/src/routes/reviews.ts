import { Router } from "express";
import { db } from "@workspace/db";
import { reviews, users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticate } from "../lib/auth";

const router = Router();

router.get("/products/:productId/reviews", async (req, res) => {
  const productId = Number(req.params.productId);
  const rows = await db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      userId: reviews.userId,
      userName: users.name,
      userAvatar: users.avatar,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.productId, productId));

  res.json(
    rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      userId: r.userId,
      userName: r.userName,
      userAvatar: r.userAvatar,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.post("/products/:productId/reviews", authenticate, async (req, res) => {
  const productId = Number(req.params.productId);
  const { rating, comment } = req.body as { rating: number; comment?: string };
  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ error: "Rating must be 1-5" });
    return;
  }
  const [review] = await db
    .insert(reviews)
    .values({
      productId,
      userId: req.user!.userId,
      rating,
      comment,
    })
    .returning();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, req.user!.userId))
    .limit(1);
  res.status(201).json({
    id: review.id,
    productId: review.productId,
    userId: review.userId,
    userName: user?.name ?? "",
    userAvatar: user?.avatar ?? null,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  });
});

export default router;
