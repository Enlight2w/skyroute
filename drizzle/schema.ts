import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  priceDropEnabled: boolean("priceDropEnabled").default(true).notNull(),
  flightStatusEnabled: boolean("flightStatusEnabled").default(true).notNull(),
  checkInEnabled: boolean("checkInEnabled").default(true).notNull(),
  gateEnabled: boolean("gateEnabled").default(true).notNull(),
  calendarEnabled: boolean("calendarEnabled").default(true).notNull(),
  inAppEnabled: boolean("inAppEnabled").default(true).notNull(),
  emailEnabled: boolean("emailEnabled").default(true).notNull(),
  smsEnabled: boolean("smsEnabled").default(false).notNull(),
  whatsappEnabled: boolean("whatsappEnabled").default(false).notNull(),
  timing: varchar("timing", { length: 64 }).default("Instant").notNull(),
  priceTarget: int("priceTarget").default(450).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("notification_preferences_user_idx").on(table.userId)]);

export const notificationDeliveryLogs = mysqlTable("notification_delivery_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: varchar("provider", { length: 64 }).notNull(),
  channel: mysqlEnum("channel", ["email", "sms"]).notNull(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  recipientMasked: varchar("recipientMasked", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 180 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["simulated", "queued", "failed"]).default("simulated").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("notification_delivery_logs_user_idx").on(table.userId)]);

export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  keyPrefix: varchar("keyPrefix", { length: 32 }).notNull(),
  keyHash: varchar("keyHash", { length: 64 }).notNull().unique(),
  scopes: text("scopes").notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("api_keys_user_idx").on(table.userId)]);

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NotificationDeliveryLog = typeof notificationDeliveryLogs.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
