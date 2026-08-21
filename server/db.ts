import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { apiKeys, InsertUser, notificationDeliveryLogs, notificationPreferences, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _pool: mysql.Pool | null = null;

function createDatabase(pool: mysql.Pool) {
  return drizzle({ client: pool });
}

let _db: ReturnType<typeof createDatabase> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool ??= mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 3,
        connectTimeout: 5000,
      });
      _db = createDatabase(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export type NotificationPreferenceInput = {
  priceDropEnabled: boolean;
  flightStatusEnabled: boolean;
  checkInEnabled: boolean;
  gateEnabled: boolean;
  calendarEnabled: boolean;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  timing: string;
  priceTarget: number;
};

export const defaultNotificationPreferences: NotificationPreferenceInput = {
  priceDropEnabled: true,
  flightStatusEnabled: true,
  checkInEnabled: true,
  gateEnabled: true,
  calendarEnabled: true,
  inAppEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  whatsappEnabled: false,
  timing: "Instant",
  priceTarget: 450,
};

export async function getNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1);
  return result[0];
}

export async function saveNotificationPreferences(userId: number, settings: NotificationPreferenceInput) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(notificationPreferences).values({ userId, ...settings }).onDuplicateKeyUpdate({ set: settings });
  return getNotificationPreferences(userId);
}

export async function createNotificationDeliveryLog(input: {
  userId: number;
  provider: string;
  channel: "email" | "sms";
  eventType: string;
  recipientMasked: string;
  subject: string;
  message: string;
  status: "simulated" | "queued" | "failed";
}) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(notificationDeliveryLogs).values(input);
  const result = await db.select().from(notificationDeliveryLogs)
    .where(eq(notificationDeliveryLogs.userId, input.userId))
    .orderBy(desc(notificationDeliveryLogs.id))
    .limit(1);
  return result[0];
}

export async function listNotificationDeliveryLogs(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notificationDeliveryLogs)
    .where(eq(notificationDeliveryLogs.userId, userId))
    .orderBy(desc(notificationDeliveryLogs.id))
    .limit(12);
}

export async function createApiKeyRecord(input: {
  userId: number;
  name: string;
  keyPrefix: string;
  keyHash: string;
  scopes: string;
}) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(apiKeys).values(input);
  const result = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, input.keyHash)).limit(1);
  return result[0];
}

export async function listApiKeyRecords(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: apiKeys.id,
    name: apiKeys.name,
    keyPrefix: apiKeys.keyPrefix,
    scopes: apiKeys.scopes,
    lastUsedAt: apiKeys.lastUsedAt,
    revokedAt: apiKeys.revokedAt,
    createdAt: apiKeys.createdAt,
  }).from(apiKeys).where(eq(apiKeys.userId, userId)).orderBy(desc(apiKeys.id));
}

export async function revokeApiKeyRecord(userId: number, id: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.update(apiKeys).set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)));
  return result[0].affectedRows > 0;
}

export async function findValidApiKeyRecord(keyHash: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, keyHash)).limit(1);
  const record = result[0];
  if (!record || record.revokedAt) return undefined;
  return record;
}

export async function markApiKeyUsed(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, id));
}
