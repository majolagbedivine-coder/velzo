import { pgTable, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userAId: integer("user_a_id")
    .notNull()
    .references(() => users.id),
  userBId: integer("user_b_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
