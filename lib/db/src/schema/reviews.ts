import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { products } from "./products";
import { users } from "./users";

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
