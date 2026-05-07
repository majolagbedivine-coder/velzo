import { Router } from "express";
import { db } from "@workspace/db";
import { products, stores, reviews } from "@workspace/db/schema";
import { eq, like, gte, lte, and, desc, avg, count, sql } from "drizzle-orm";
import { authenticate } from "../lib/auth";

const router = Router();

router.get("/products", async (req, res) => {
  const { category, search, minPrice, maxPrice } = req.query as Record<string, string>;
  const conditions = [];
  if (category) conditions.push(eq(products.category, category));
  if (search) conditions.push(like(products.title, `%${search}%`));
  if (minPrice) conditions.push(gte(products.price, minPrice));
  if (maxPrice) conditions.push(lte(products.price, maxPrice));
  conditions.push(eq(products.status, "active"));

  const rows = await db
    .select({
      id: products.id,
      storeId: products.storeId,
      storeName: stores.name,
      title: products.title,
      description: products.description,
      price: products.price,
      category: products.category,
      coverImage: products.coverImage,
      fileUrl: products.fileUrl,
      status: products.status,
      createdAt: products.createdAt,
      reviewCount: count(reviews.id),
      avgRating: avg(reviews.rating),
    })
    .from(products)
    .leftJoin(stores, eq(products.storeId, stores.id))
    .leftJoin(reviews, eq(reviews.productId, products.id))
    .where(and(...conditions))
    .groupBy(products.id, stores.name)
    .orderBy(desc(products.createdAt));

  res.json(
    rows.map((p) => ({
      id: p.id,
      storeId: p.storeId,
      storeName: p.storeName,
      title: p.title,
      description: p.description,
      price: Number(p.price),
      category: p.category,
      coverImage: p.coverImage,
      fileUrl: p.fileUrl,
      status: p.status,
      reviewCount: Number(p.reviewCount ?? 0),
      avgRating: Number(p.avgRating ?? 0),
      createdAt: p.createdAt.toISOString(),
    }))
  );
});

router.get("/products/featured", async (_req, res) => {
  const rows = await db
    .select({
      id: products.id,
      storeId: products.storeId,
      storeName: stores.name,
      title: products.title,
      description: products.description,
      price: products.price,
      category: products.category,
      coverImage: products.coverImage,
      fileUrl: products.fileUrl,
      status: products.status,
      createdAt: products.createdAt,
      reviewCount: count(reviews.id),
      avgRating: avg(reviews.rating),
    })
    .from(products)
    .leftJoin(stores, eq(products.storeId, stores.id))
    .leftJoin(reviews, eq(reviews.productId, products.id))
    .where(eq(products.status, "active"))
    .groupBy(products.id, stores.name)
    .orderBy(desc(products.createdAt))
    .limit(12);

  res.json(
    rows.map((p) => ({
      id: p.id,
      storeId: p.storeId,
      storeName: p.storeName,
      title: p.title,
      description: p.description,
      price: Number(p.price),
      category: p.category,
      coverImage: p.coverImage,
      fileUrl: p.fileUrl,
      status: p.status,
      reviewCount: Number(p.reviewCount ?? 0),
      avgRating: Number(p.avgRating ?? 0),
      createdAt: p.createdAt.toISOString(),
    }))
  );
});

router.get("/products/my", authenticate, async (req, res) => {
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.userId, req.user!.userId))
    .limit(1);
  if (!store) {
    res.json([]);
    return;
  }
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.storeId, store.id))
    .orderBy(desc(products.createdAt));
  res.json(
    rows.map((p) => ({
      id: p.id,
      storeId: p.storeId,
      title: p.title,
      description: p.description,
      price: Number(p.price),
      category: p.category,
      coverImage: p.coverImage,
      fileUrl: p.fileUrl,
      status: p.status,
      reviewCount: 0,
      avgRating: 0,
      createdAt: p.createdAt.toISOString(),
    }))
  );
});

router.get("/products/:productId", async (req, res) => {
  const productId = Number(req.params.productId);
  const [row] = await db
    .select({
      id: products.id,
      storeId: products.storeId,
      storeName: stores.name,
      title: products.title,
      description: products.description,
      price: products.price,
      category: products.category,
      coverImage: products.coverImage,
      fileUrl: products.fileUrl,
      status: products.status,
      createdAt: products.createdAt,
      reviewCount: count(reviews.id),
      avgRating: avg(reviews.rating),
    })
    .from(products)
    .leftJoin(stores, eq(products.storeId, stores.id))
    .leftJoin(reviews, eq(reviews.productId, products.id))
    .where(eq(products.id, productId))
    .groupBy(products.id, stores.name)
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({
    id: row.id,
    storeId: row.storeId,
    storeName: row.storeName,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    coverImage: row.coverImage,
    fileUrl: row.fileUrl,
    status: row.status,
    reviewCount: Number(row.reviewCount ?? 0),
    avgRating: Number(row.avgRating ?? 0),
    createdAt: row.createdAt.toISOString(),
  });
});

router.post("/products", authenticate, async (req, res) => {
  const { title, description, price, category, coverImage, fileUrl } = req.body as {
    title: string;
    description: string;
    price: number;
    category: string;
    coverImage?: string;
    fileUrl?: string;
  };
  if (!title || !description || price === undefined || !category) {
    res.status(400).json({ error: "Required fields missing" });
    return;
  }
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.userId, req.user!.userId))
    .limit(1);
  if (!store) {
    res.status(400).json({ error: "You must create a store first" });
    return;
  }
  const [product] = await db
    .insert(products)
    .values({
      storeId: store.id,
      title,
      description,
      price: String(price),
      category,
      coverImage,
      fileUrl,
    })
    .returning();
  res.status(201).json({
    id: product.id,
    storeId: product.storeId,
    title: product.title,
    description: product.description,
    price: Number(product.price),
    category: product.category,
    coverImage: product.coverImage,
    fileUrl: product.fileUrl,
    status: product.status,
    reviewCount: 0,
    avgRating: 0,
    createdAt: product.createdAt.toISOString(),
  });
});

router.put("/products/:productId", authenticate, async (req, res) => {
  const productId = Number(req.params.productId);
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, product.storeId))
    .limit(1);
  if (!store || store.userId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { title, description, price, category, coverImage, fileUrl, status } = req.body as {
    title?: string;
    description?: string;
    price?: number;
    category?: string;
    coverImage?: string;
    fileUrl?: string;
    status?: string;
  };
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = String(price);
  if (category !== undefined) updates.category = category;
  if (coverImage !== undefined) updates.coverImage = coverImage;
  if (fileUrl !== undefined) updates.fileUrl = fileUrl;
  if (status !== undefined) updates.status = status;

  const [updated] = await db
    .update(products)
    .set(updates)
    .where(eq(products.id, productId))
    .returning();
  res.json({
    id: updated.id,
    storeId: updated.storeId,
    title: updated.title,
    description: updated.description,
    price: Number(updated.price),
    category: updated.category,
    coverImage: updated.coverImage,
    fileUrl: updated.fileUrl,
    status: updated.status,
    reviewCount: 0,
    avgRating: 0,
    createdAt: updated.createdAt.toISOString(),
  });
});

router.delete("/products/:productId", authenticate, async (req, res) => {
  const productId = Number(req.params.productId);
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, product.storeId))
    .limit(1);
  if (!store || store.userId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  await db.delete(products).where(eq(products.id, productId));
  res.status(204).send();
});

router.get("/catalog/stats", async (_req, res) => {
  const [productCount] = await db.select({ cnt: count() }).from(products);
  const [storeCount] = await db.select({ cnt: count() }).from(stores);
  const categoryRows = await db
    .selectDistinct({ category: products.category })
    .from(products);
  res.json({
    totalProducts: Number(productCount?.cnt ?? 0),
    totalStores: Number(storeCount?.cnt ?? 0),
    totalCategories: categoryRows.length,
    totalSellers: Number(storeCount?.cnt ?? 0),
  });
});

export default router;
