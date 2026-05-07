import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { conversations } from "./conversations";
import { users } from "./users";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
