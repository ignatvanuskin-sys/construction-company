import { useRef, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowDownRight, ArrowUpRight, Check, Menu, X, Upload, Plus } from "lucide-react";
import Reveal from "@/components/Reveal";
import OrbField from "@/components/OrbField";
import LiquidMetalHero from "@/components/LiquidMetalHero";
import Preloader from "@/components/Preloader";

/** NOVA FORMA style: dark cinematic editorial, asymmetric architecture, bronze precision. */
const hero = "/manus-storage/nova-forma-hero_32fadf23.png";
const materials = "/manus-storage/nova-forma-materials_2ac250db.png";
const interior = "/manus-storage/nova-forma-interior_0b4b98b6.png";
const waterfront = "/manus-storage/nova-forma-project_3f402da0.png";
const mark = "/manus-storage/nova-forma-mark_8f933ad3.png";

const projects = [
  { slug:"sosnovy-sklon", no:"01", name:"Сосновый склон", type:"Частная резиденция", meta:"Московская область · 640 м² · 2024", image:hero, tag:"Резиденция" },
  { slug:"liniya-gorizonta", no:"02", name:"Линия горизонта", type:"Частный дом", meta:"Истринский район · 420 м² · 2023", image:interior, tag:"Дом" },
  { slug:"port", no:"03", name:"Пространство «Порт»", type:"Офис и шоурум", meta:"Санкт-Петербург · 1 850 м² · 2024", image:waterfront, tag:"Коммерция" },
  { slug:"severny-sad", no:"04", name:"Северный сад", type:"Бутик-отель", meta:"Ленинградская область · 3 200 м² · 2022", image:materials, tag:"Гостеприимство" },
];
const services = [
  ["01", "Частные резиденции", "Строительство современных домов и загородных комплексов."],
  ["02", "Коммерческие объекты", "Офисы, рестораны, отели, шоурумы и бизнес-пространства."],
  ["03", "Реконструкция", "Обновление, перепланировка и техническое переоснащение зданий."],
  ["04", "Проектирование", "Архитектурная концепция, рабочая документация и координация."],
  ["05", "Инженерные системы", "Вентиляция, отопление, автоматизация и безопасность."],
  ["06", "Отделка и благоустройство", "Фасады, интерьеры, ландшафт, свет и комплектация."],
];
const steps = [["01","Анализ задачи","Изучаем участок, цели, бюджет и образ будущего объекта."],["02","Концепция","Формируем архитектурную идею, сценарии и предварительный бюджет."],["03","Проектирование","Разрабатываем документацию, инженерные решения и чертежи."],["04","Подготовка строительства","Формируем календарный план, смету, команду и поставки."],["05","Строительство","Управляем работами и контролируем соблюдение технологий."],["06","Контроль качества","Проверяем каждый этап, материалы, узлы и системы."],["07","Передача объекта","Завершаем отделку, благоустройство и передаем пространство." ]];

function Logo(){ return <a href="#top" className="logo"><img src={mark} alt="" /><span>NOVA<br/><i>FORMA</i></span></a> }
function Header(){ const [open,setOpen]=useState(false); return <header className="header"><Logo/><nav className={open?"nav open":"nav"}><a href="#about" onClick={()=>setOpen(false)}>О компании</a><a href="#services" onClick={()=>setOpen(false)}>Услуги</a><a href="#projects" onClick={()=>setOpen(false)}>Проекты</a><a href="#process" onClick={()=>setOpen(false)}>Процесс</a><a href="#contact" onClick={()=>setOpen(false)}>Контакты</a></nav><a href="#contact" className="header-cta">Обсудить проект <ArrowUpRight size={15}/></a><button className="menu-btn" onClick={()=>setOpen(!open)} aria-label="Меню">{open?<X/>:<Menu/>}</button></header> }
function SectionLabel({no,children}:{no:string,children:string}){return <div className="section-label"><span>{no}</span><span>{children}</span></div>}
function Inquiry(){
  const [sent,setSent]=useState(false);
  const [error,setError]=useState("");
  const formStartedAt = useRef(Date.now());
  const sendInquiry = trpc.inquiry.send.useMutation({
    onSuccess: () => { setSent(true); setError(""); },
    onError: (err) => setError(err.message),
  });
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    sendInquiry.mutate({
      name: String(data.get("name") || ""),
      phone: String(data.get("phone") || ""),
      email: String(data.get("email") || "") || undefined,
      objectType: String(data.get("objectType") || "") || undefined,
      region: String(data.get("region") || "") || undefined,
      area: String(data.get("area") || "") || undefined,
      budget: String(data.get("budget") || "") || undefined,
      message: String(data.get("message") || "") || undefined,
      fileName: (data.get("file") as File)?.name || undefined,
      website: String(data.get("website") || "") || undefined,
      formStartedAt: formStartedAt.current,
    });
  };
  return <section id="contact" className="inquiry"><div className="inquiry-copy"><SectionLabel no="07" children="Начало разговора"/><h2>Расскажите<br/><em>о своем проекте</em></h2><p>Опишите задачу, приложите материалы — и мы подготовим предварительное видение проекта, этапы реализации и ориентировочный бюджет.</p><div className="contact-line"><span>Москва · Санкт-Петербург</span><span>+7 (495) 000-00-00</span></div></div><form className="form" onSubmit={submit}><input name="website" className="honey-field" tabIndex={-1} autoComplete="off" aria-label="Leave this field empty" />{sent?<div className="sent"><Check size={26}/><span className="sent-kicker">Доставка подтверждена</span><h3>Заявка принята</h3><p>Сообщение уже отправлено в Telegram. Мы свяжемся с вами в течение рабочего дня.</p><span className="sent-note">NOVA FORMA · Telegram</span><button type="button" className="text-link" onClick={()=>setSent(false)}>Отправить еще одну</button></div>:<><div className="form-row"><input name="name" required placeholder="Имя *"/><input name="phone" required type="tel" placeholder="Телефон *"/></div><div className="form-row"><input name="email" type="email" placeholder="E-mail"/><select name="objectType" defaultValue=""><option value="" disabled>Тип объекта</option><option>Частная резиденция</option><option>Коммерческий объект</option><option>Реконструкция</option></select></div><div className="form-row"><input name="region" placeholder="Город или регион"/><input name="area" placeholder="Ориентировочная площадь"/></div><select name="budget" defaultValue=""><option value="" disabled>Примерный бюджет</option><option>до 30 млн ₽</option><option>30–100 млн ₽</option><option>от 100 млн ₽</option></select><textarea name="message" placeholder="Расскажите о задаче" rows={3}/><label className="file"><Upload size={16}/> Прикрепить файл <input name="file" type="file"/></label>{error&&<p className="form-error" role="alert">{error}</p>}<button className="submit" disabled={sendInquiry.isPending}>{sendInquiry.isPending?"Отправляем…":"Обсудить проект"}<ArrowUpRight size={18}/></button></>}</form></section>
}

export default function Home(){ return <div id="top" className="site"><Preloader mark={mark}/><Header/><main><section className="hero"><img src={hero} alt="Современная частная резиденция NOVA FORMA"/><LiquidMetalHero/><div className="hero-shade"/><div className="hero-content"><p className="eyebrow">Architecture & Construction <span>· Москва / Санкт-Петербург</span></p><h1>Создаем<br/><em>пространства,</em><br/>которые остаются</h1><p className="hero-sub">Строительство частных резиденций, коммерческих объектов и общественных пространств с полным контролем качества.</p><div className="hero-actions"><a className="btn btn-light" href="#projects">Посмотреть проекты <ArrowDownRight size={17}/></a><a className="btn btn-ghost" href="#contact">Обсудить проект <ArrowUpRight size={17}/></a></div></div><div className="hero-index">01 <span>/</span> 07</div><div className="scroll-note">Scroll to explore <ArrowDownRight size={15}/></div></section>
<section id="about" className="about"><div className="about-aside"><SectionLabel no="01" children="О компании"/><span className="vertical-note">NOVA FORMA · SINCE 2012</span></div><div className="about-copy"><h2>От идеи<br/><em>до пространства</em></h2><p>NOVA FORMA объединяет архитектуру, инженерию и строительство в единую систему. Мы создаем объекты, в которых каждая деталь подчинена общей идее — от первого эскиза до финального света в интерьере.</p><a href="#process" className="text-link">Как мы работаем <ArrowUpRight size={16}/></a></div><div className="stats"><div><strong>12</strong><span>лет опыта</span></div><div><strong>86</strong><span>реализованных<br/>проектов</span></div><div><strong>42</strong><span>специалиста</span></div><div><strong>5</strong><span>лет гарантии</span></div></div></section>
<section id="services" className="services"><SectionLabel no="02" children="Компетенции"/><div className="section-heading"><h2>Полный цикл.<br/><em>Одна команда.</em></h2><p>Берем на себя весь путь проекта: от предпроектной аналитики до передачи готового объекта владельцу.</p></div><div className="service-list">{services.map(([no,title,text])=><div className="service-item" key={no}><span className="service-no">{no}</span><h3>{title}</h3><p>{text}</p><Plus className="plus" size={20}/></div>)}</div></section>
<section id="projects" className="projects"><SectionLabel no="03" children="Избранные проекты"/><div className="section-heading"><h2>Пространства<br/><em>с характером</em></h2><a className="text-link" href="#contact">Запросить портфолио <ArrowUpRight size={16}/></a></div><div className="project-grid">{projects.map((p,i)=><Link href={`/projects/${p.slug}`} className={`project-card card-${i+1}`} key={p.slug}><div className="project-image"><img src={p.image} alt={p.name}/><span className="project-tag">{p.tag}</span><span className="project-arrow"><ArrowUpRight size={20}/></span></div><div className="project-meta"><span>{p.no}</span><div><h3>{p.name}</h3><p>{p.type} · {p.meta}</p></div></div></Link>)}</div></section>
<section id="process" className="process"><OrbField/><Reveal className="process-intro"><SectionLabel no="04" children="Как мы работаем"/><h2>Спокойствие<br/><em>в каждом шаге</em></h2><p>Прозрачный процесс, персональный руководитель и контроль качества на всем пути.</p></Reveal><div className="timeline">{steps.map(([no,title,text],i)=><Reveal className="step" delay={i*45} key={no}><span>{no}</span><div><h3>{title}</h3><p>{text}</p></div></Reveal>)}</div></section>
<section className="materials"><div className="material-image"><img src={materials} alt="Материалы NOVA FORMA"/></div><div className="material-copy"><SectionLabel no="05" children="Материалы и технологии"/><h2>Форма<br/><em>имеет вес</em></h2><p>Архитектурный бетон, натуральный камень, инженерная древесина и панорамное остекление. Материалы, выбранные за выразительность и срок службы.</p><div className="material-tags"><span>01 · Бетон</span><span>02 · Камень</span><span>03 · Древесина</span><span>04 · Остекление</span><span>05 · Металл</span><span>06 · Инженерия</span></div></div></section>
<section className="why"><SectionLabel no="06" children="Почему NOVA FORMA"/><div className="why-content"><h2>Важное<br/><em>остается</em></h2><div className="why-list">{["Единая команда на всех этапах","Прозрачная смета без скрытых расходов","Персональный руководитель проекта","Фото- и видеоотчеты со стройплощадки","Проверка материалов и инженерных узлов","Согласованный календарный план","Гарантия 5 лет","Архитектурная и инженерная экспертиза"].map((x,i)=><div key={x}><span>0{i+1}</span>{x}<Check size={15}/></div>)}</div></div></section>
<Inquiry/></main><footer><div className="footer-brand"><Logo/><p>Создаем пространства,<br/>которые остаются.</p></div><div className="footer-nav"><a href="#about">О компании</a><a href="#services">Услуги</a><a href="#projects">Проекты</a><a href="#process">Процесс работы</a><a href="#contact">Контакты</a></div><div className="footer-contact"><span>Москва · Санкт-Петербург</span><a href="mailto:hello@novaforma.example">hello@novaforma.example</a><a href="https://t.me/novaforma_studio">@novaforma_studio</a></div><div className="footer-bottom"><span>© 2024 NOVA FORMA</span><span>Концептуальный сайт · Все данные демонстрационные</span><span>Политика конфиденциальности</span></div></footer><a href="#contact" className="floating-cta">Обсудить проект <ArrowUpRight size={16}/></a></div> }
