import { describe, expect, it } from "vitest";
import { formatProjectInquiry } from "./telegram";

describe("formatProjectInquiry", () => {
  it("creates a readable Telegram message from the inquiry fields", () => {
    const message = formatProjectInquiry({
      name: "Елена",
      phone: "+7 900 000-00-00",
      email: "elena@example.com",
      objectType: "Частная резиденция",
      region: "Москва",
      area: "480 м²",
      budget: "30–100 млн ₽",
      message: "Нужна предварительная концепция дома.",
      fileName: "brief.pdf",
    });
    expect(message).toContain("НОВАЯ ЗАЯВКА · NOVA FORMA");
    expect(message).toContain("Имя: Елена");
    expect(message).toContain("Файл: brief.pdf");
    expect(message).toContain("Сообщение: Нужна предварительная концепция дома.");
  });

  it("normalizes whitespace and limits long free-form content", () => {
    const message = formatProjectInquiry({
      name: "  Анна   Петрова ",
      phone: "  +7 999 123 45 67  ",
      message: "x".repeat(1200),
    });
    expect(message).toContain("Имя: Анна Петрова");
    expect(message.match(/Сообщение: /)?.[0]).toBe("Сообщение: ");
    expect(message.length).toBeLessThan(1700);
  });
});
