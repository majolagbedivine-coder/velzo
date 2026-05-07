import { Router } from "express";
import { db } from "@workspace/db";
import { stores, users, products } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";
import { authenticate } from "../lib/auth";

const router = Router();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

router.get("/stores", async (_req, res) => {
  const rows = await db
    .select({
      id: stores.id,
      userId: stores.userId,
      name: stores.name,
      slug: stores.slug,
      description: stores.description,
      logo: stores.logo,
      banner: stores.banner,
      createdAt: stores.createdAt,
      ownerName: users.name,
      ownerEmail: users.email,
      ownerAvatar: users.avatar,
    })
    .from(stores)
    .innerJoin(users, eq(stores.userId, users.id));

  const productCounts = await db
    .select({ storeId: products.storeId, cnt: count() })
    .from(products)
    .groupBy(products.storeId);
  const countMap = Object.fromEntries(productCounts.map((r) => [r.storeId, Number(r.cnt)]));

  res.json(
    rows.map((s) => ({
      id: s.id,
      userId: s.userId,
      name: s.name,
      slug: s.slug,
      description: s.description,
      logo: s.logo,
      banner: s.banner,
      productCount: countMap[s.id] ?? 0,
      owner: {
        id: s.userId,
        name: s.ownerName,
        email: s.ownerEmail,
        avatar: s.ownerAvatar,
        role: "seller",
        createdAt: new Date().toISOString(),
      },
      createdAt: s.createdAt.toISOString(),
    }))
  );
});

router.get("/stores/my", authenticate, async (req, res) => {
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.userId, req.user!.userId))
    .limit(1);
  res.json({ store: store ? { ...store, productCount: 0, createdAt: store.createdAt.toISOString() } : null });
});

router.get("/stores/:storeId", async (req, res) => {
  const storeId = Number(req.params.storeId);
  const [row] = await db
    .select({
      id: stores.id,
      userId: stores.userId,
      name: stores.name,
      slug: stores.slug,
      description: stores.description,
      logo: stores.logo,
      banner: stores.banner,
      createdAt: stores.createdAt,
      ownerName: users.name,
      ownerEmail: users.email,
      ownerAvatar: users.avatar,
    })
    .from(stores)
    .innerJoin(users, eq(stores.userId, users.id))
    .where(eq(stores.id, storeId))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Store not found" });
    return;
  }
  const [productCountRow] = await db
    .select({ cnt: count() })
    .from(products)
    .where(eq(products.storeId, storeId));
  res.json({
    id: row.id,
    userId: row.userId,
    name: row.name,
    slug: row.slug,
    description: row.description,
    logo: row.logo,
    banner: row.banner,
    productCount: Number(productCountRow?.cnt ?? 0),
    owner: {
      id: row.userId,
      name: row.ownerName,
      email: row.ownerEmail,
      avatar: row.ownerAvatar,
      role: "seller",
      createdAt: new Date().toISOString(),
    },
    createdAt: row.createdAt.toISOString(),
  });
});

router.post("/stores", authenticate, async (req, res) => {
  const { name, description, logo, banner } = req.body as {
    name: string;
    description?: string;
    logo?: string;
    banner?: string;
  };
  if (!name) {
    res.status(400).json({ error: "Store name is required" });
    return;
  }
  const existing = await db
    .select()
    .from(stores)
    .where(eq(stores.userId, req.user!.userId))
    .limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "You already have a store" });
    return;
  }
  let slug = slugify(name);
  const conflicting = await db
    .select()
    .from(stores)
    .where(eq(stores.slug, slug))
    .limit(1);
  if (conflicting.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }
  const [store] = await db
    .insert(stores)
    .values({ userId: req.user!.userId, name, slug, description, logo, banner })
    .returning();
  res.status(201).json({ ...store, productCount: 0, createdAt: store.createdAt.toISOString() });
});

router.put("/stores/:storeId", authenticate, async (req, res) => {
  const storeId = Number(req.params.storeId);
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  if (!store || store.userId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { name, description, logo, banner } = req.body as {
    name?: string;
    description?: string;
    logo?: string;
    banner?: string;
  };
  const [updated] = await db
    .update(stores)
    .set({ name, description, logo, banner })
    .where(eq(stores.id, storeId))
    .returning();
  res.json({ ...updated, productCount: 0, createdAt: updated.createdAt.toISOString() });
});

router.get("/stores/:storeId/products", async (req, res) => {
  const storeId = Number(req.params.storeId);
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId));
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

export default router;
