import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowUpRight, Check, X } from "lucide-react";

export type ProjectDetailData = {
  name: string;
  type: string;
  location: string;
  area: string;
  year: string;
  image: string;
  gallery: string[];
  intro: string;
  concept: string;
  materials: string[];
};

const hero = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663894363217/PRiWkEKqJdzsSOmf.png";
const materialsImage = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663894363217/hWfvgAVboFJhzgVc.png";
const interior = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663894363217/AcJwDFenlEsLzwiT.png";
const waterfront = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663894363217/RKuckAROdUTAmpkD.png";

export const projectDetailData: Record<string, ProjectDetailData> = {
  "sosnovy-sklon": { name: "Сосновый склон", type: "Частный дом", location: "Московская область", area: "640 м²", year: "2024", image: hero, gallery: [hero, interior, materialsImage], intro: "Резиденция, встроенная в сосновый ландшафт и рассчитанная на тихую жизнь за городом.", concept: "Задача проекта — создать дом, который не конкурирует с лесом, а продолжает его. Панорамное остекление собирает виды в живые картины, внутренний двор защищает приватность, а тяжелый бетонный объем работает как спокойное основание для теплых деревянных интерьеров.", materials: ["Архитектурный бетон", "Дуб", "Натуральный камень", "Панорамное остекление"] },
  "liniya-gorizonta": { name: "Линия горизонта", type: "Частная резиденция", location: "Истринский район", area: "420 м²", year: "2023", image: interior, gallery: [interior, hero, waterfront], intro: "Дом, собранный вокруг вида: видовая терраса, скрытая инженерия и энергоэффективный фасад.", concept: "Лаконичная горизонталь здания раскрывается к ландшафту. Внутренние маршруты проходят вдоль света, а инженерные решения спрятаны так, чтобы архитектура оставалась чистой и цельной.", materials: ["Клинкер", "Лиственница", "Алюминий", "Бетон"] },
  "port": { name: "Пространство «Порт»", type: "Офис и шоурум", location: "Санкт-Петербург", area: "1 850 м²", year: "2024", image: waterfront, gallery: [waterfront, interior, hero], intro: "Коммерческое пространство, где выставочная функция соединяется с ежедневной работой команды.", concept: "Открытая планировка разделена не стенами, а светом, материалами и ритмом потолочных конструкций. Переговорные, шоурум и рабочие зоны складываются в единый сценарий движения.", materials: ["Металл", "Стекло", "Бетон", "Натуральный камень"] },
  "severny-sad": { name: "Северный сад", type: "Бутик-отель", location: "Ленинградская область", area: "3 200 м²", year: "2022", image: materialsImage, gallery: [materialsImage, waterfront, interior], intro: "Бутик-отель на 28 номеров с рестораном, spa-зоной и ландшафтом для замедления.", concept: "Проект строится на контрасте северного климата и теплого гостеприимства. Камень и дерево задают тактильный ритм интерьеров, а благоустроенная территория становится продолжением общественных пространств.", materials: ["Дерево", "Камень", "Штукатурка", "Стекло"] },
};

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:slug");
  const p = projectDetailData[params?.slug || ""] || projectDetailData["sosnovy-sklon"];
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setLightboxOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen]);

  return <div className="site project-detail">
    <header className="header"><Link href="/" className="back" aria-label="Вернуться к каталогу проектов"><ArrowLeft size={16}/> Все проекты</Link><span className="detail-logo">NOVA FORMA <i>Architecture & Construction</i></span><a href="/#contact" className="header-cta">Обсудить проект <ArrowUpRight size={15}/></a></header>
    <main>
      <section className="detail-hero"><img src={p.image} alt={p.name}/><div className="hero-shade"/><div className="detail-title"><span>Проект · {p.year}</span><h1>{p.name}</h1><p>{p.intro}</p></div></section>
      <section className="case-grid"><div><span className="case-kicker">01 / Концепция</span><h2>Архитектура<br/><em>как продолжение</em></h2></div><div className="case-text"><p>{p.concept}</p><a className="text-link" href="/#contact">Обсудить похожую задачу <ArrowUpRight size={16}/></a></div></section>
      <section className="case-gallery" aria-labelledby="gallery-title"><div className="gallery-head"><span className="case-kicker">02 / Визуальный архив</span><h2 id="gallery-title">Взгляд<br/><em>изнутри</em></h2><p>Материалы проекта, собранные в единую визуальную историю.</p></div><div className="gallery-stage"><button type="button" className="gallery-main" onClick={() => setLightboxOpen(true)} aria-label={`Открыть изображение проекта ${p.name}`}><img src={p.gallery[activeImage]} alt={`${p.name}, изображение ${activeImage + 1}`}/><span>Открыть на весь экран <ArrowUpRight size={14}/></span></button><div className="gallery-thumbs" role="tablist" aria-label="Изображения проекта">{p.gallery.map((image, index) => <button type="button" role="tab" aria-selected={activeImage === index} aria-label={`Изображение ${index + 1}`} className={activeImage === index ? "is-active" : ""} onClick={() => setActiveImage(index)} key={image}><img src={image} alt=""/></button>)}</div></div></section>
      <section className="case-facts"><div className="facts-head"><span>03 / Характеристики</span><h2>Точные решения<br/><em>для жизни</em></h2></div><div className="facts"><div><span>Локация</span><strong>{p.location}</strong></div><div><span>Площадь</span><strong>{p.area}</strong></div><div><span>Завершение</span><strong>{p.year}</strong></div><div><span>Тип объекта</span><strong>{p.type}</strong></div></div></section>
      <section className="case-materials"><div className="material-copy"><span className="case-kicker">04 / Материалы</span><h2>Материалы,<br/><em>которые стареют красиво</em></h2><div className="detail-material-list">{p.materials.map((m, i) => <div key={m}><span>0{i + 1}</span>{m}<Check size={14}/></div>)}</div></div><img src={materialsImage} alt="Материалы проекта"/></section>
      <section className="case-review" aria-labelledby="review-title"><span className="case-kicker">05 / Отзывы клиентов</span><h2 id="review-title">Слово<br/><em>заказчику</em></h2><p>Подтверждённые отзывы будут опубликованы после согласования с клиентами. Мы не размещаем вымышленные цитаты и оценки.</p><a className="text-link" href="/#contact">Запросить информацию о проекте <ArrowUpRight size={16}/></a></section>
    </main>
    {lightboxOpen && <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`Галерея проекта ${p.name}`}><button type="button" className="gallery-close" onClick={() => setLightboxOpen(false)} aria-label="Закрыть галерею"><X size={20}/></button><img src={p.gallery[activeImage]} alt={`${p.name}, полноэкранное изображение`}/><div className="gallery-lightbox-controls"><button type="button" onClick={() => setActiveImage((activeImage - 1 + p.gallery.length) % p.gallery.length)} aria-label="Предыдущее изображение"><ArrowLeft size={18}/></button><span>{String(activeImage + 1).padStart(2, "0")} / {String(p.gallery.length).padStart(2, "0")}</span><button type="button" onClick={() => setActiveImage((activeImage + 1) % p.gallery.length)} aria-label="Следующее изображение"><ArrowUpRight size={18}/></button></div></div>}
    <footer><div className="footer-brand"><span className="detail-logo">NOVA FORMA</span><p>Создаем пространства,<br/>которые остаются.</p></div><div className="footer-contact"><span>Москва · Санкт-Петербург</span><a href="mailto:hello@novaforma.example">hello@novaforma.example</a></div><div className="footer-bottom"><span>© 2024 NOVA FORMA</span><Link href="/">Вернуться на главную</Link></div></footer>
  </div>;
}

// The review block intentionally renders a truthful empty state until approved client copy is supplied.
