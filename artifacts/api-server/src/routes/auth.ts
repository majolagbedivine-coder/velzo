import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticate, signToken } from "../lib/auth";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const { email, password, name, role } = req.body as {
    email: string;
    password: string;
    name: string;
    role: string;
  };
  if (!email || !password || !name || !role) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }
  if (!["buyer", "seller"].includes(role)) {
    res.status(400).json({ error: "Role must be buyer or seller" });
    return;
  }
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, name, role })
    .returning();
  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
    },
  });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
    },
  });
});

router.get("/auth/me", authenticate, async (req, res) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, req.user!.userId))
    .limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
