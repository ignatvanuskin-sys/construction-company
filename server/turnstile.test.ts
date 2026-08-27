import { describe, expect, it, vi } from "vitest";
import { ENV } from "./_core/env";
import { validateTurnstileToken } from "./turnstile";

describe("Turnstile validation", () => {
  it("rejects a missing token without a network call", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const result = await validateTurnstileToken("");
    expect(result.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockRestore();
  });

  it("maps a successful Siteverify response", async () => {
    const originalSecret = ENV.turnstileSecretKey;
    ENV.turnstileSecretKey = "test-secret";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true, hostname: "example.com" }), { status: 200 }));
    const result = await validateTurnstileToken("test-token", "127.0.0.1");
    expect(result).toEqual({ success: true, hostname: "example.com", errorCodes: undefined });
    ENV.turnstileSecretKey = originalSecret;
    vi.restoreAllMocks();
  });
  it("accepts Cloudflare's documented always-pass test token", async () => {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        secret: "1x0000000000000000000000000000000AA",
        response: "XXXX.DUMMY.TOKEN.XXXX",
      }),
    });
    const payload = await response.json() as { success?: boolean };
    expect(response.ok).toBe(true);
    expect(payload.success).toBe(true);
  }, 15_000);
});
