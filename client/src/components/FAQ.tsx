import { useState } from "react";
import { Plus } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const questions = [
  ["С чего начинается работа над проектом?", "С короткой встречи и анализа задачи: участок, сценарии жизни, сроки, бюджет и желаемый уровень участия команды NOVA FORMA."],
  ["Можно ли подключить вас к уже готовому проекту?", "Да. Мы подключаемся на этапе концепции, рабочей документации или строительства и сначала проводим технический аудит текущих материалов."],
  ["Берете ли вы на себя инженерные системы и комплектацию?", "Да. В полный цикл входят инженерная координация, спецификации, подбор материалов, поставки и контроль ключевых узлов на объекте."],
  ["Как формируется бюджет строительства?", "После первичного анализа мы формируем предварительный диапазон. Детальная смета появляется по мере уточнения проекта, материалов, инженерии и календарного плана."],
  ["Работаете ли вы за пределами Москвы и Санкт-Петербурга?", "Да, география обсуждается отдельно. Важны логистика, доступность площадки и возможность обеспечить регулярный контроль качества."],
  ["Как оставить заявку на консультацию?", "Заполните форму внизу страницы или напишите нам напрямую. Мы изучим задачу и вернемся с предложением по следующему шагу."],
] as const;

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="faq" aria-labelledby="faq-title">
      <div className="faq-intro">
        <div className="section-label"><span>07</span><span>Частые вопросы</span></div>
        <h2 id="faq-title">Перед<br /><em>первым шагом</em></h2>
        <p>Коротко отвечаем на вопросы, которые помогают понять формат работы с NOVA FORMA.</p>
      </div>
      <div className="faq-list">
        {questions.map(([question, answer], index) => (
          <details
            key={question}
            open={open === index}
            onToggle={(event) => {
              const nextOpen = (event.currentTarget as HTMLDetailsElement).open;
              setOpen(nextOpen ? index : null);
              if (nextOpen) trackEvent("faq_open", { question: question.slice(0, 80) });
            }}
          >
            <summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{question}</strong><Plus size={18} aria-hidden="true" /></summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
