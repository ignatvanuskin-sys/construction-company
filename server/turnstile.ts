import { ENV } from "./_core/env";

export type TurnstileValidation = {
  success: boolean;
  hostname?: string;
  errorCodes?: string[];
};

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function validateTurnstileToken(token: string | undefined, remoteip?: string): Promise<TurnstileValidation> {
  if (!token || token.length > 2048 || !ENV.turnstileSecretKey) {
    return { success: false, errorCodes: ["missing-or-unconfigured"] };
  }

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        secret: ENV.turnstileSecretKey,
        response: token,
        ...(remoteip ? { remoteip } : {}),
        idempotency_key: crypto.randomUUID(),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const payload = await response.json() as { success?: boolean; hostname?: string; "error-codes"?: string[] };
    return {
      success: response.ok && payload.success === true,
      hostname: payload.hostname,
      errorCodes: payload["error-codes"],
    };
  } catch {
    return { success: false, errorCodes: ["internal-error"] };
  }
}
