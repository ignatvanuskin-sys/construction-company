import { ENV } from "./_core/env";

export type ProjectInquiry = {
  name: string;
  phone: string;
  email?: string;
  objectType?: string;
  region?: string;
  area?: string;
  budget?: string;
  message?: string;
  fileName?: string;
};

const clean = (value: string | undefined, max = 700) =>
  (value ?? "").trim().replace(/\s+/g, " ").slice(0, max);

export function formatProjectInquiry(input: ProjectInquiry) {
  const rows = [
    "НОВАЯ ЗАЯВКА · NOVA FORMA",
    "",
    `Имя: ${clean(input.name, 120)}`,
    `Телефон: ${clean(input.phone, 80)}`,
    `E-mail: ${clean(input.email, 160) || "—"}`,
    `Тип объекта: ${clean(input.objectType, 120) || "—"}`,
    `Город / регион: ${clean(input.region, 160) || "—"}`,
    `Площадь: ${clean(input.area, 80) || "—"}`,
    `Бюджет: ${clean(input.budget, 120) || "—"}`,
    `Файл: ${clean(input.fileName, 160) || "не прикреплен"}`,
    "",
    `Сообщение: ${clean(input.message, 900) || "—"}`,
  ];
  return rows.join("\n");
}

export async function sendProjectInquiry(input: ProjectInquiry) {
  if (!ENV.telegramBotToken) throw new Error("Telegram bot token is not configured");
  if (!ENV.telegramChatId) throw new Error("Telegram recipient chat id is not configured");

  const response = await fetch(`https://api.telegram.org/bot${ENV.telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: ENV.telegramChatId, text: formatProjectInquiry(input), disable_web_page_preview: true }),
    signal: AbortSignal.timeout(12_000),
  });
  const payload = await response.json() as { ok?: boolean; description?: string };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.description || "Telegram delivery failed");
  }
  return { ok: true as const };
}
