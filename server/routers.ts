import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getMockInventory } from "./mockInventory";
import { protectedProcedure } from "./_core/trpc";
import {
  createNotificationDeliveryLog,
  defaultNotificationPreferences,
  getNotificationPreferences,
  listNotificationDeliveryLogs,
  saveNotificationPreferences,
} from "./db";
import { createMockNotificationDelivery } from "./mockNotificationProvider";
import { TRPCError } from "@trpc/server";
import { API_KEY_SCOPES, createApiKey, hashApiKey, type ApiKeyScope, verifyApiKey } from "./apiKeyService";
import { createApiKeyRecord, findValidApiKeyRecord, listApiKeyRecords, markApiKeyUsed, revokeApiKeyRecord } from "./db";

const notificationPreferencesSchema = z.object({
  priceDropEnabled: z.boolean(),
  flightStatusEnabled: z.boolean(),
  checkInEnabled: z.boolean(),
  gateEnabled: z.boolean(),
  calendarEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  whatsappEnabled: z.boolean(),
  timing: z.string().min(1).max(64),
  priceTarget: z.number().int().min(0).max(100000),
});

const apiKeyScopesSchema = z.array(z.enum(API_KEY_SCOPES)).min(1).max(API_KEY_SCOPES.length);

export async function verifySkyRouteApiKey(candidate: string) {
  const record = await findValidApiKeyRecord(hashApiKey(candidate));
  if (!record || !verifyApiKey(candidate, record.keyHash)) return undefined;
  await markApiKeyUsed(record.id);
  return { userId: record.userId, scopes: JSON.parse(record.scopes) as ApiKeyScope[] };
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  inventory: router({
    search: publicProcedure
      .input(z.object({ refresh: z.number().int().min(0).max(50) }))
      .query(({ input }) => getMockInventory(input.refresh)),
  }),
  notification: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const preferences = await getNotificationPreferences(ctx.user.id);
      const deliveryHistory = await listNotificationDeliveryLogs(ctx.user.id);
      return { preferences: preferences ?? defaultNotificationPreferences, deliveryHistory };
    }),
    savePreferences: protectedProcedure
      .input(notificationPreferencesSchema)
      .mutation(async ({ ctx, input }) => {
        const preferences = await saveNotificationPreferences(ctx.user.id, input);
        return { preferences: preferences ?? input, persisted: Boolean(preferences) };
      }),
    sendMock: protectedProcedure
      .input(z.object({ channel: z.enum(["email", "sms"]), eventType: z.string().min(1).max(64), message: z.string().min(1).max(600) }))
      .mutation(async ({ ctx, input }) => {
        const mockDelivery = createMockNotificationDelivery(input);
        const delivery = await createNotificationDeliveryLog({ userId: ctx.user.id, eventType: input.eventType, ...mockDelivery });
        return { delivery: delivery ?? mockDelivery, persisted: Boolean(delivery) };
      }),
  }),
  apiKeys: router({
    list: protectedProcedure.query(async ({ ctx }) => listApiKeyRecords(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({ name: z.string().trim().min(2).max(120), scopes: apiKeyScopesSchema }))
      .mutation(async ({ ctx, input }) => {
        const generated = createApiKey();
        const record = await createApiKeyRecord({
          userId: ctx.user.id,
          name: input.name,
          keyPrefix: generated.keyPrefix,
          keyHash: generated.keyHash,
          scopes: JSON.stringify(input.scopes),
        });
        if (!record) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "API key storage is unavailable" });
        return {
          apiKey: { id: record.id, name: record.name, keyPrefix: record.keyPrefix, scopes: input.scopes, createdAt: record.createdAt },
          secret: generated.plainText,
        };
      }),
    revoke: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => ({ revoked: await revokeApiKeyRecord(ctx.user.id, input.id) })),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
