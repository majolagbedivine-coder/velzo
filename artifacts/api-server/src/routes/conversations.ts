import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages, users } from "@workspace/db/schema";
import { eq, or, desc, and, count, sql } from "drizzle-orm";
import { authenticate } from "../lib/auth";

const router = Router();

router.get("/conversations", authenticate, async (req, res) => {
  const userId = req.user!.userId;
  const convRows = await db
    .select()
    .from(conversations)
    .where(or(eq(conversations.userAId, userId), eq(conversations.userBId, userId)))
    .orderBy(desc(conversations.createdAt));

  const result = await Promise.all(
    convRows.map(async (conv) => {
      const otherUserId = conv.userAId === userId ? conv.userBId : conv.userAId;
      const [otherUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, otherUserId))
        .limit(1);
      const [lastMsg] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      return {
        id: conv.id,
        otherUser: {
          id: otherUser.id,
          email: otherUser.email,
          name: otherUser.name,
          role: otherUser.role,
          avatar: otherUser.avatar,
          bio: otherUser.bio,
          createdAt: otherUser.createdAt.toISOString(),
        },
        lastMessage: lastMsg?.content ?? null,
        lastMessageAt: lastMsg?.createdAt.toISOString() ?? null,
        unreadCount: 0,
        createdAt: conv.createdAt.toISOString(),
      };
    })
  );
  res.json(result);
});

router.post("/conversations", authenticate, async (req, res) => {
  const userId = req.user!.userId;
  const { recipientId } = req.body as { recipientId: number };
  if (!recipientId) {
    res.status(400).json({ error: "recipientId required" });
    return;
  }
  const [existing] = await db
    .select()
    .from(conversations)
    .where(
      or(
        and(eq(conversations.userAId, userId), eq(conversations.userBId, recipientId)),
        and(eq(conversations.userAId, recipientId), eq(conversations.userBId, userId))
      )
    )
    .limit(1);

  const conv = existing ?? (
    await db
      .insert(conversations)
      .values({ userAId: userId, userBId: recipientId })
      .returning()
  )[0];

  const [otherUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, recipientId))
    .limit(1);

  res.json({
    id: conv.id,
    otherUser: {
      id: otherUser.id,
      email: otherUser.email,
      name: otherUser.name,
      role: otherUser.role,
      avatar: otherUser.avatar,
      bio: otherUser.bio,
      createdAt: otherUser.createdAt.toISOString(),
    },
    lastMessage: null,
    lastMessageAt: null,
    unreadCount: 0,
    createdAt: conv.createdAt.toISOString(),
  });
});

router.get("/conversations/:conversationId/messages", authenticate, async (req, res) => {
  const conversationId = Number(req.params.conversationId);
  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  if (
    !conv ||
    (conv.userAId !== req.user!.userId && conv.userBId !== req.user!.userId)
  ) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const rows = await db
    .select({
      id: messages.id,
      conversationId: messages.conversationId,
      senderId: messages.senderId,
      senderName: users.name,
      senderAvatar: users.avatar,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);

  res.json(
    rows.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: m.senderName,
      senderAvatar: m.senderAvatar,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    }))
  );
});

router.post("/conversations/:conversationId/messages", authenticate, async (req, res) => {
  const conversationId = Number(req.params.conversationId);
  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  if (
    !conv ||
    (conv.userAId !== req.user!.userId && conv.userBId !== req.user!.userId)
  ) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { content } = req.body as { content: string };
  if (!content) {
    res.status(400).json({ error: "Content required" });
    return;
  }
  const [msg] = await db
    .insert(messages)
    .values({ conversationId, senderId: req.user!.userId, content })
    .returning();
  const [sender] = await db
    .select()
    .from(users)
    .where(eq(users.id, req.user!.userId))
    .limit(1);
  res.status(201).json({
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    senderName: sender?.name ?? "",
    senderAvatar: sender?.avatar ?? null,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
  });
});

export default router;
