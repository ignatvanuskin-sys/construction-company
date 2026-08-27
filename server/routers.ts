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
  website: z.string().max(120).optional(),
  formStartedAt: z.number().int().nonnegative().optional(),
});

const recentInquiries = new Map<string, number>();
const MIN_SUBMISSION_INTERVAL_MS = 45_000;
const MIN_FORM_DURATION_MS = 1_200;

function requestKey(req: { ip?: string; headers?: Record<string, string | string[] | undefined> }) {
  const forwarded = req.headers?.["x-forwarded-for"];
  const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return (forwardedValue || req.ip || "anonymous").trim().slice(0, 120);
}

function rejectSpam(input: z.infer<typeof inquirySchema>, req: { ip?: string; headers?: Record<string, string | string[] | undefined> }) {
  if (input.website?.trim()) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Не удалось принять заявку. Проверьте данные и попробуйте позже." });
  }
  if (input.formStartedAt && Date.now() - input.formStartedAt < MIN_FORM_DURATION_MS) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Не удалось принять заявку. Проверьте данные и попробуйте позже." });
  }
  const key = requestKey(req);
  const lastSubmission = recentInquiries.get(key);
  if (lastSubmission && Date.now() - lastSubmission < MIN_SUBMISSION_INTERVAL_MS) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Заявка уже отправлена. Попробуйте снова через минуту." });
  }
  recentInquiries.set(key, Date.now());
  return key;
}

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
    send: publicProcedure.input(inquirySchema).mutation(async ({ input, ctx }) => {
      const key = rejectSpam(input, ctx.req);
      try {
        return await sendProjectInquiry(input);
      } catch (error) {
        recentInquiries.delete(key);
        console.error("[Inquiry] Telegram delivery failed:", error instanceof Error ? error.message : "unknown error");
        throw new TRPCError({ code: "BAD_REQUEST", message: "Заявку пока не удалось отправить. Проверьте настройки Telegram и попробуйте еще раз." });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
