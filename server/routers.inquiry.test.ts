import { afterEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("inquiry.send", () => {
  afterEach(() => vi.restoreAllMocks());

  it("accepts a valid anonymous inquiry and returns success when Telegram accepts it", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true, result: { message_id: 7 } }), { status: 200 }));
    const ctx = { user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
    const result = await appRouter.createCaller(ctx).inquiry.send({ name: "Иван", phone: "+7 900 000-00-00", objectType: "Офис", message: "Нужна консультация." });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, request] = fetchMock.mock.calls[0] ?? [];
    const body = JSON.parse(String(request?.body));
    expect(body.chat_id).toBe(process.env.TELEGRAM_CHAT_ID);
    expect(body.text).toContain("Имя: Иван");
    expect(body.text).toContain("Телефон: +7 900 000-00-00");
  });

  it("rejects incomplete inquiries before calling Telegram", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const ctx = { user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
    await expect(appRouter.createCaller(ctx).inquiry.send({ name: "", phone: "" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("inquiry anti-spam", () => {
  afterEach(() => vi.restoreAllMocks());

  it("rejects a filled honeypot without contacting Telegram", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const ctx = { user: null, req: { ip: "honeypot-test", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
    await expect(appRouter.createCaller(ctx).inquiry.send({ name: "Bot", phone: "+7 900 000-00-00", website: "https://spam.example" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects submissions made too quickly", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const ctx = { user: null, req: { ip: "speed-test", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
    await expect(appRouter.createCaller(ctx).inquiry.send({ name: "Bot", phone: "+7 900 000-00-00", formStartedAt: Date.now() })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throttles repeated submissions from the same request key", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const ctx = { user: null, req: { ip: "repeat-test", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
    const caller = appRouter.createCaller(ctx);
    await caller.inquiry.send({ name: "Ольга", phone: "+7 900 000-00-00" });
    await expect(caller.inquiry.send({ name: "Ольга", phone: "+7 900 000-00-00" })).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });
});
