import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { sendProjectInquiry } from "./telegram";

const inquirySchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(80),
  email: z.string().trim().max(160).optional(),
  objectType: z.string().trim().max(120).optional(),
  region: z.string().trim().max(160).optional(),
  area: z.string().trim().max(80).optional(),
  budget: z.string().trim().max(120).optional(),
  message: z.string().trim().max(900).optional(),
  fileName: z.string().trim().max(160).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  inquiry: router({
    send: publicProcedure.input(inquirySchema).mutation(async ({ input }) => {
      try {
        return await sendProjectInquiry(input);
      } catch (error) {
        console.error("[Inquiry] Telegram delivery failed:", error instanceof Error ? error.message : "unknown error");
        throw new TRPCError({ code: "BAD_REQUEST", message: "Заявку пока не удалось отправить. Проверьте настройки Telegram и попробуйте еще раз." });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
