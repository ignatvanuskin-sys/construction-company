import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowDownRight, ArrowUpRight, Check, Menu, X, Upload, Plus } from "lucide-react";
import Reveal from "@/components/Reveal";
import Preloader from "@/components/Preloader";
import TurnstileWidget from "@/components/TurnstileWidget";
import FAQ from "@/components/FAQ";
import { trackEvent } from "@/lib/analytics";

const OrbField = lazy(() => import("@/components/OrbField"));
const LiquidMetalHero = lazy(() => import("@/components/LiquidMetalHero"));

/** NOVA FORMA style: dark cinematic editorial, asymmetric architecture, bronze precision. */
const hero = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663894363217/PRiWkEKqJdzsSOmf.png";
const materials = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663894363217/hWfvgAVboFJhzgVc.png";
const interior = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663894363217/AcJwDFenlEsLzwiT.png";
const waterfront = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663894363217/RKuckAROdUTAmpkD.png";
const mark = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663894363217/WQHdhkpOeJSOmhIp.png";

const projects = [
  { slug:"sosnovy-sklon", no:"01", name:"Сосновый склон", type:"Частная резиденция", category:"Резиденции", year:"2024", region:"Московская область", keywords:"лесной дом загородная архитектура", addedAt:"2024-06-15", meta:"Московская область · 640 м² · 2024", image:hero, tag:"Резиденция" },
  { slug:"liniya-gorizonta", no:"02", name:"Линия горизонта", type:"Частный дом", category:"Резиденции", year:"2023", region:"Истринский район", keywords:"частный дом интерьер панорамное остекление", addedAt:"2024-02-20", meta:"Истринский район · 420 м² · 2023", image:interior, tag:"Дом" },
  { slug:"port", no:"03", name:"Пространство «Порт»", type:"Офис и шоурум", category:"Коммерция", year:"2024", region:"Санкт-Петербург", keywords:"офис шоурум коммерческое пространство", addedAt:"2024-08-04", meta:"Санкт-Петербург · 1 850 м² · 2024", image:waterfront, tag:"Коммерция" },
  { slug:"severny-sad", no:"04", name:"Северный сад", type:"Бутик-отель", category:"Гостиницы", year:"2022", region:"Ленинградская область", keywords:"отель гостеприимство ландшафт", addedAt:"2023-11-09", meta:"Ленинградская область · 3 200 м² · 2022", image:materials, tag:"Гостеприимство" },
];
export const projectFilters = ["Все", ...Array.from(new Set(projects.map(project => project.category)))];
export const projectYears = ["Все", ...Array.from(new Set(projects.map(project => project.year))).sort((a, b) => Number(b) - Number(a))];
export const projectRegions = ["Все", ...Array.from(new Set(projects.map(project => project.region)))];
export type ProjectFilterState = { category: string; year: string; region: string; query: string };
export const defaultProjectFilterState = { category: "Все", year: "Все", region: "Все", sort: "newest" as const, query: "" };
export function resetProjectFilterState() {
  return { ...defaultProjectFilterState };
}
export const projectSortOptions = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
  { value: "az", label: "По алфавиту А–Я" },
  { value: "za", label: "По алфавиту Я–А" },
] as const;
export type ProjectSort = typeof projectSortOptions[number]["value"];
export type ProjectUrlState = ProjectFilterState & { sort: ProjectSort; page: number };
export function parseProjectUrlState(search: string): ProjectUrlState {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const category = projectFilters.includes(params.get("type") || "") ? params.get("type")! : "Все";
  const year = projectYears.includes(params.get("year") || "") ? params.get("year")! : "Все";
  const region = projectRegions.includes(params.get("region") || "") ? params.get("region")! : "Все";
  const sort = projectSortOptions.some(option => option.value === params.get("sort")) ? params.get("sort") as ProjectSort : "newest";
  const pageValue = Number(params.get("page"));
  return { category, year, region, sort, query: params.get("q") || "", page: Number.isFinite(pageValue) && pageValue > 0 ? Math.floor(pageValue) : 1 };
}
export function serializeProjectUrlState(state: ProjectUrlState) {
  const params = new URLSearchParams();
  if (state.category !== "Все") params.set("type", state.category);
  if (state.year !== "Все") params.set("year", state.year);
  if (state.region !== "Все") params.set("region", state.region);
  if (state.sort !== "newest") params.set("sort", state.sort);
  if (state.query.trim()) params.set("q", state.query.trim());
  if (state.page > 1) params.set("page", String(state.page));
  return params.toString();
}
export function sortProjects<T extends { name: string; addedAt: string }>(items: T[], sort: ProjectSort) {
  return [...items].sort((a, b) => sort === "az" ? a.name.localeCompare(b.name, "ru") : sort === "za" ? b.name.localeCompare(a.name, "ru") : sort === "oldest" ? a.addedAt.localeCompare(b.addedAt) : b.addedAt.localeCompare(a.addedAt));
}
const PROJECT_PAGE_SIZE = 2;
export function paginateProjects<T>(items: T[], count: number) {
  return items.slice(0, Math.max(0, count));
}
export function filterProjects({ category, year, region, query }: ProjectFilterState) {
  const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");
  return projects.filter(project => {
    const matchesCategory = category === "Все" || project.category === category;
    const matchesYear = year === "Все" || project.year === year;
    const matchesRegion = region === "Все" || project.region === region;
    const searchableText = [project.name, project.type, project.category, project.year, project.region, project.tag, project.keywords].join(" ").toLocaleLowerCase("ru-RU");
    return matchesCategory && matchesYear && matchesRegion && (!normalizedQuery || searchableText.includes(normalizedQuery));
  });
}
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
function Header(){ const [open,setOpen]=useState(false); useEffect(() => { const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; window.addEventListener("keydown", closeOnEscape); return () => window.removeEventListener("keydown", closeOnEscape); }, []); return <header className="header"><Logo/><nav id="site-navigation" aria-label="Основная навигация" className={open?"nav open":"nav"}><a href="#about" onClick={()=>setOpen(false)}>О компании</a><a href="#services" onClick={()=>setOpen(false)}>Услуги</a><a href="#projects" onClick={()=>setOpen(false)}>Проекты</a><a href="#process" onClick={()=>setOpen(false)}>Процесс</a><a href="#contact" onClick={()=>setOpen(false)}>Контакты</a></nav><a href="#contact" className="header-cta">Обсудить проект <ArrowUpRight size={15}/></a><button className="menu-btn" onClick={()=>setOpen(!open)} aria-label={open?"Закрыть меню":"Открыть меню"} aria-expanded={open} aria-controls="site-navigation">{open?<X/>:<Menu/>}</button></header> }
function SectionLabel({no,children}:{no:string,children:string}){return <div className="section-label"><span>{no}</span><span>{children}</span></div>}
function Inquiry(){
  const [sent,setSent]=useState(false);
  const [error,setError]=useState("");
  const [turnstileToken,setTurnstileToken]=useState("");
  const [turnstileResetKey,setTurnstileResetKey]=useState(0);
  const formStartedAt = useRef(Date.now());
  useEffect(() => { trackEvent("contact_form_view"); }, []);
  const sendInquiry = trpc.inquiry.send.useMutation({
    onSuccess: () => { setSent(true); setError(""); trackEvent("contact_form_submit_success"); },
    onError: (err) => { setError(err.message); setTurnstileResetKey(key => key + 1); trackEvent("contact_form_submit_error"); },
  });
  const submit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    trackEvent("contact_form_submit_attempt");
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
      turnstileToken: turnstileToken || undefined,
    });
  };
  return <section id="contact" className="inquiry"><div className="inquiry-copy"><SectionLabel no="08" children="Начало разговора"/><h2>Расскажите<br/><em>о своем проекте</em></h2><p>Опишите задачу, приложите материалы — и мы подготовим предварительное видение проекта, этапы реализации и ориентировочный бюджет.</p><div className="contact-line"><span>Москва · Санкт-Петербург</span><span>+7 (495) 000-00-00</span></div></div><form className="form" onSubmit={submit}><input name="website" className="honey-field" tabIndex={-1} autoComplete="off" aria-label="Leave this field empty" />{sent?<div className="sent"><Check size={26}/><span className="sent-kicker">Доставка подтверждена</span><h3>Заявка принята</h3><p>Сообщение уже отправлено в Telegram. Мы свяжемся с вами в течение рабочего дня.</p><span className="sent-note">NOVA FORMA · Telegram</span><button type="button" className="text-link" onClick={()=>{setSent(false);setTurnstileResetKey(key=>key+1)}}>Отправить еще одну</button></div>:<><div className="form-row"><input name="name" required placeholder="Имя *" aria-label="Имя *"/><input name="phone" required type="tel" placeholder="Телефон *" aria-label="Телефон *"/></div><div className="form-row"><input name="email" type="email" placeholder="E-mail" aria-label="E-mail"/><select name="objectType" defaultValue="" aria-label="Тип объекта"><option value="" disabled>Тип объекта</option><option>Частная резиденция</option><option>Коммерческий объект</option><option>Реконструкция</option></select></div><div className="form-row"><input name="region" placeholder="Город или регион" aria-label="Город или регион"/><input name="area" placeholder="Ориентировочная площадь" aria-label="Ориентировочная площадь"/></div><select name="budget" defaultValue="" aria-label="Примерный бюджет"><option value="" disabled>Примерный бюджет</option><option>до 30 млн ₽</option><option>30–100 млн ₽</option><option>от 100 млн ₽</option></select><textarea name="message" placeholder="Расскажите о задаче" rows={3} aria-label="Расскажите о задаче"/><TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileResetKey}/><label className="file"><Upload size={16}/> Прикрепить файл <input name="file" type="file" aria-label="Прикрепить файл"/></label>{error&&<p className="form-error" role="alert">{error}</p>}<button className="submit" disabled={sendInquiry.isPending}>{sendInquiry.isPending?"Отправляем…":"Обсудить проект"}<ArrowUpRight size={18}/></button><p className="form-reassurance">Ответим в течение рабочего дня · Без обязательств · Конфиденциально</p></>}</form></section>
}

export default function Home(){
  const initialUrlState: ProjectUrlState = typeof window !== "undefined" ? parseProjectUrlState(window.location.search) : { ...resetProjectFilterState(), page: 1 };
  const [selectedProjectFilter, setSelectedProjectFilter] = useState(initialUrlState.category);
  const [selectedProjectYear, setSelectedProjectYear] = useState(initialUrlState.year);
  const [selectedProjectRegion, setSelectedProjectRegion] = useState(initialUrlState.region);
  const [projectQuery, setProjectQuery] = useState(initialUrlState.query);
  const [selectedProjectSort, setSelectedProjectSort] = useState<ProjectSort>(initialUrlState.sort);
  const [visibleProjectCount, setVisibleProjectCount] = useState(initialUrlState.page * PROJECT_PAGE_SIZE);
  const filteredProjects = useMemo(() => filterProjects({ category: selectedProjectFilter, year: selectedProjectYear, region: selectedProjectRegion, query: projectQuery }), [selectedProjectFilter, selectedProjectYear, selectedProjectRegion, projectQuery]);
  const sortedFilteredProjects = useMemo(() => sortProjects(filteredProjects, selectedProjectSort), [filteredProjects, selectedProjectSort]);
  const visibleFilteredProjects = useMemo(() => paginateProjects(sortedFilteredProjects, visibleProjectCount), [sortedFilteredProjects, visibleProjectCount]);
  const [displayedProjects, setDisplayedProjects] = useState(() => visibleFilteredProjects);
  const [exitingProjectSlugs, setExitingProjectSlugs] = useState<Set<string>>(() => new Set());
  const [projectGridVersion, setProjectGridVersion] = useState(0);
  const [isProjectGridUpdating, setIsProjectGridUpdating] = useState(false);
  const isApplyingHistoryState = useRef(false);
  const isInitialProjectState = useRef(true);
  useEffect(() => {
    if (isApplyingHistoryState.current) return;
    if (isInitialProjectState.current) { isInitialProjectState.current = false; return; }
    setVisibleProjectCount(PROJECT_PAGE_SIZE);
  }, [selectedProjectFilter, selectedProjectYear, selectedProjectRegion, projectQuery, selectedProjectSort]);
  useEffect(() => {
    if (displayedProjects === visibleFilteredProjects) return;
    setIsProjectGridUpdating(true);
    const nextSlugs = new Set(visibleFilteredProjects.map(project => project.slug));
    setDisplayedProjects(previous => {
      const previousSlugs = new Set(previous.map(project => project.slug));
      const additions = visibleFilteredProjects.filter(project => !previousSlugs.has(project.slug));
      return [...previous, ...additions];
    });
    setExitingProjectSlugs(previous => {
      const next = new Set(previous);
      displayedProjects.forEach(project => { if (!nextSlugs.has(project.slug)) next.add(project.slug); });
      return next;
    });
    const timer = window.setTimeout(() => {
      setDisplayedProjects(visibleFilteredProjects);
      setExitingProjectSlugs(new Set());
      setProjectGridVersion(version => version + 1);
      setIsProjectGridUpdating(false);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [visibleFilteredProjects]);
  const hasProjectFilters = selectedProjectFilter !== "Все" || selectedProjectYear !== "Все" || selectedProjectRegion !== "Все" || projectQuery.trim() !== "" || selectedProjectSort !== "newest";
  const hasMoreProjects = visibleProjectCount < filteredProjects.length;
  useEffect(() => {
    const onPopState = () => {
      const next = parseProjectUrlState(window.location.search);
      isApplyingHistoryState.current = true;
      setSelectedProjectFilter(next.category); setSelectedProjectYear(next.year); setSelectedProjectRegion(next.region); setProjectQuery(next.query); setSelectedProjectSort(next.sort); setVisibleProjectCount(next.page * PROJECT_PAGE_SIZE);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = serializeProjectUrlState({ category: selectedProjectFilter, year: selectedProjectYear, region: selectedProjectRegion, sort: selectedProjectSort, query: projectQuery, page: Math.max(1, Math.ceil(visibleProjectCount / PROJECT_PAGE_SIZE)) });
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
      if (isApplyingHistoryState.current) isApplyingHistoryState.current = false;
      else window.history.pushState(null, "", nextUrl);
    } else {
      isApplyingHistoryState.current = false;
    }
  }, [selectedProjectFilter, selectedProjectYear, selectedProjectRegion, selectedProjectSort, projectQuery, visibleProjectCount]);
  useEffect(() => {
    if (selectedProjectFilter !== "Все") trackEvent("project_filter_select", { filter: selectedProjectFilter });
  }, [selectedProjectFilter]);
  useEffect(() => {
    if (selectedProjectYear !== "Все") trackEvent("project_year_select", { year: selectedProjectYear });
  }, [selectedProjectYear]);
  useEffect(() => {
    if (selectedProjectSort !== "newest") trackEvent("project_sort_select", { sort: selectedProjectSort });
  }, [selectedProjectSort]);
  useEffect(() => {
    if (selectedProjectRegion !== "Все") trackEvent("project_region_select", { region: selectedProjectRegion });
  }, [selectedProjectRegion]);
  const resetProjectFilters = (source = "toolbar") => { setSelectedProjectFilter(defaultProjectFilterState.category); setSelectedProjectYear(defaultProjectFilterState.year); setSelectedProjectRegion(defaultProjectFilterState.region); setSelectedProjectSort(defaultProjectFilterState.sort); setProjectQuery(defaultProjectFilterState.query); trackEvent("project_filters_reset", { source }); };
  return <div id="top" className="site"><Preloader mark={mark}/><Header/><main><section className="hero"><img src={hero} alt="Современная частная резиденция NOVA FORMA" fetchPriority="high" decoding="async"/><Suspense fallback={null}><LiquidMetalHero/></Suspense><div className="hero-shade"/><div className="hero-content"><p className="eyebrow">Architecture & Construction <span>· Москва / Санкт-Петербург</span></p><h1>Создаем<br/><em>пространства,</em><br/>которые остаются</h1><p className="hero-sub">Строительство частных резиденций, коммерческих объектов и общественных пространств с полным контролем качества.</p><div className="hero-actions"><a className="btn btn-light" href="#projects">Посмотреть проекты <ArrowDownRight size={17}/></a><a className="btn btn-ghost" href="#contact">Обсудить проект <ArrowUpRight size={17}/></a></div></div><div className="hero-index">01 <span>/</span> 07</div><div className="scroll-note">Scroll to explore <ArrowDownRight size={15}/></div></section>
<section id="about" className="about"><div className="about-aside"><SectionLabel no="01" children="О компании"/><span className="vertical-note">NOVA FORMA · SINCE 2012</span></div><div className="about-copy"><h2>От идеи<br/><em>до пространства</em></h2><p>NOVA FORMA объединяет архитектуру, инженерию и строительство в единую систему. Мы создаем объекты, в которых каждая деталь подчинена общей идее — от первого эскиза до финального света в интерьере.</p><a href="#process" className="text-link">Как мы работаем <ArrowUpRight size={16}/></a></div><div className="stats"><div><strong>12</strong><span>лет опыта</span></div><div><strong>86</strong><span>реализованных<br/>проектов</span></div><div><strong>42</strong><span>специалиста</span></div><div><strong>5</strong><span>лет гарантии</span></div></div></section>
<section id="services" className="services"><SectionLabel no="02" children="Компетенции"/><div className="section-heading"><h2>Полный цикл.<br/><em>Одна команда.</em></h2><p>Берем на себя весь путь проекта: от предпроектной аналитики до передачи готового объекта владельцу.</p></div><div className="service-list">{services.map(([no,title,text])=><div className="service-item" key={no}><span className="service-no">{no}</span><h3>{title}</h3><p>{text}</p><Plus className="plus" size={20}/></div>)}</div></section>
<section id="projects" className="projects" aria-busy={isProjectGridUpdating}><SectionLabel no="03" children="Избранные проекты"/><div className="section-heading"><h2>Пространства<br/><em>с характером</em></h2><a className="text-link" href="#contact">Запросить портфолио <ArrowUpRight size={16}/></a></div><div className="project-search-row"><label className="project-search"><span className="sr-only">Поиск по проектам</span><input type="search" value={projectQuery} onChange={event => setProjectQuery(event.target.value)} placeholder="Найти проект или ключевое слово" aria-label="Поиск по проектам"/><span aria-hidden="true">⌕</span></label>{hasProjectFilters && <button type="button" className="project-reset" onClick={() => resetProjectFilters()}>Сбросить фильтры</button>}</div><div className="project-filter-bar" role="group" aria-label="Фильтры проектов"><div className="project-filter-control"><span className="project-filter-label">Тип объекта</span><div className="project-filters">{projectFilters.map(filter => <button type="button" key={filter} className={selectedProjectFilter === filter ? "is-active" : ""} aria-pressed={selectedProjectFilter === filter} onClick={() => setSelectedProjectFilter(filter)}>{filter}</button>)}</div></div><label className="project-select"><span>Сортировка</span><select value={selectedProjectSort} onChange={event => setSelectedProjectSort(event.target.value as ProjectSort)} aria-label="Сортировка проектов">{projectSortOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="project-select"><span>Год</span><select value={selectedProjectYear} onChange={event => setSelectedProjectYear(event.target.value)} aria-label="Фильтр по году"><option value="Все">Все годы</option>{projectYears.filter(year => year !== "Все").map(year => <option key={year} value={year}>{year}</option>)}</select></label><label className="project-select"><span>Регион</span><select value={selectedProjectRegion} onChange={event => setSelectedProjectRegion(event.target.value)} aria-label="Фильтр по региону"><option value="Все">Все регионы</option>{projectRegions.filter(region => region !== "Все").map(region => <option key={region} value={region}>{region}</option>)}</select></label><span className="project-filter-count" aria-live="polite">{filteredProjects.length} {filteredProjects.length === 1 ? "проект" : "проекта"}</span></div><span className="sr-only" aria-live="polite">Показано {Math.min(visibleProjectCount, filteredProjects.length)} из {filteredProjects.length} проектов</span>{isProjectGridUpdating && <span className="project-updating" role="status">Обновляем список проектов…</span>}{displayedProjects.length === 0 ? <div className="project-empty-state" role="status"><span className="project-empty-index">NOVA / 00</span><h3>Пространство<br/><em>еще не найдено</em></h3><p>По этому сочетанию параметров нет опубликованных проектов. Измените запрос или вернитесь ко всему архиву.</p><button type="button" className="project-empty-reset" onClick={() => resetProjectFilters("empty_state")}>Сбросить поиск и фильтры <ArrowUpRight size={15}/></button></div> : <div key={projectGridVersion} className="project-grid project-grid-animated">{displayedProjects.map((p,i)=>{ const isExiting = exitingProjectSlugs.has(p.slug); return <Link href={`/projects/${p.slug}`} onMouseEnter={() => trackEvent("project_card_hover", { project: p.slug })} aria-hidden={isExiting} tabIndex={isExiting ? -1 : undefined} className={`project-card card-${i+1}${isExiting ? " is-exiting" : ""}`} key={p.slug}><div className="project-image"><img src={p.image} alt={p.name} loading="lazy" decoding="async"/><span className="project-tag">{p.tag}</span><span className="project-arrow"><ArrowUpRight size={20}/></span></div><div className="project-meta"><span>{p.no}</span><div><h3>{p.name}</h3><p>{p.type} · {p.meta}</p></div></div></Link>})}</div>}{hasMoreProjects && <div className="project-load-more"><button type="button" className="project-load-more-button" disabled={isProjectGridUpdating} onClick={() => { setVisibleProjectCount(count => count + PROJECT_PAGE_SIZE); trackEvent("project_load_more", { nextCount: Math.min(visibleProjectCount + PROJECT_PAGE_SIZE, filteredProjects.length) }); }}>Показать еще проектов <span>{filteredProjects.length - visibleProjectCount}</span><ArrowDownRight size={15}/></button><span className="project-load-more-note">Показано {Math.min(visibleProjectCount, filteredProjects.length)} из {filteredProjects.length}</span></div>}</section>
<section id="process" className="process"><Suspense fallback={null}><OrbField/></Suspense><Reveal className="process-intro"><SectionLabel no="04" children="Как мы работаем"/><h2>Спокойствие<br/><em>в каждом шаге</em></h2><p>Прозрачный процесс, персональный руководитель и контроль качества на всем пути.</p></Reveal><div className="timeline">{steps.map(([no,title,text],i)=><Reveal className="step" delay={i*45} key={no}><span>{no}</span><div><h3>{title}</h3><p>{text}</p></div></Reveal>)}</div></section>
<section className="materials"><div className="material-image"><img src={materials} alt="Материалы NOVA FORMA" loading="lazy" decoding="async"/></div><div className="material-copy"><SectionLabel no="05" children="Материалы и технологии"/><h2>Форма<br/><em>имеет вес</em></h2><p>Архитектурный бетон, натуральный камень, инженерная древесина и панорамное остекление. Материалы, выбранные за выразительность и срок службы.</p><div className="material-tags"><span>01 · Бетон</span><span>02 · Камень</span><span>03 · Древесина</span><span>04 · Остекление</span><span>05 · Металл</span><span>06 · Инженерия</span></div></div></section>
<section className="why"><SectionLabel no="06" children="Почему NOVA FORMA"/><div className="why-content"><h2>Важное<br/><em>остается</em></h2><div className="why-list">{["Единая команда на всех этапах","Прозрачная смета без скрытых расходов","Персональный руководитель проекта","Фото- и видеоотчеты со стройплощадки","Проверка материалов и инженерных узлов","Согласованный календарный план","Гарантия 5 лет","Архитектурная и инженерная экспертиза"].map((x,i)=><div key={x}><span>0{i+1}</span>{x}<Check size={15}/></div>)}</div></div></section>
<FAQ/><Inquiry/></main><footer><div className="footer-brand"><Logo/><p>Создаем пространства,<br/>которые остаются.</p></div><div className="footer-nav"><a href="#about">О компании</a><a href="#services">Услуги</a><a href="#projects">Проекты</a><a href="#process">Процесс работы</a><a href="#contact">Контакты</a></div><div className="footer-contact"><span>Москва · Санкт-Петербург</span><a href="mailto:hello@novaforma.example">hello@novaforma.example</a><a href="https://t.me/novaforma_studio">@novaforma_studio</a></div><div className="footer-bottom"><span>© 2024 NOVA FORMA</span><span>Концептуальный сайт · Все данные демонстрационные</span><span>Политика конфиденциальности</span></div></footer><a href="#contact" className="floating-cta">Обсудить проект <ArrowUpRight size={16}/></a></div> }
