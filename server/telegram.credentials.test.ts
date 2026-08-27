import { describe, expect, it } from "vitest";

describe("Telegram credentials", () => {
  it("accepts the configured bot token", async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    expect(token, "TELEGRAM_BOT_TOKEN must be configured").toBeTruthy();

    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const payload = await response.json() as { ok?: boolean; result?: { is_bot?: boolean } };

    expect(response.ok).toBe(true);
    expect(payload.ok).toBe(true);
    expect(payload.result?.is_bot).toBe(true);
  }, 15_000);

  it("can resolve the configured recipient chat", async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    expect(token, "TELEGRAM_BOT_TOKEN must be configured").toBeTruthy();
    expect(chatId, "TELEGRAM_CHAT_ID must be configured").toBeTruthy();

    const response = await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(chatId ?? "")}`);
    const payload = await response.json() as { ok?: boolean; result?: { id?: number } };

    expect(response.ok).toBe(true);
    expect(payload.ok).toBe(true);
    expect(String(payload.result?.id)).toBe(chatId);
  }, 15_000);
});
