import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  logo: text("logo"),
  banner: text("banner"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
