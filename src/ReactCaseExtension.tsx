import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ACT2_STORAGE_KEY,
  ACT3_STORAGE_KEY,
  ACT4_STORAGE_KEY,
  CORE_STORAGE_KEY,
  INTERROGATION_STORAGE_KEY
} from './build';
import { CASE_MEDIA } from './mediaCatalog';

type EvidenceId = 'E006' | 'E007' | 'E008' | 'E009' | 'E010' | 'E011';
type ActiveModal = EvidenceId | 'report' | null;

type Act2State = { plan: string[]; room: string[]; questions: string[] };
type Act3State = {
  archive: string[];
  identity: string[];
  questions: string[];
  checkpointAnswer: string | null;
  complete: boolean;
};
type Act4State = {
  search: string[];
  card: string[];
  finalAnswer: string | null;
  wrongAnswers: string[];
  complete: boolean;
  startedAt: string | null;
  completedAt: string | null;
};

type Point = { id: string; n: string; label: string; title: string; text: string };

type Targets = {
  evidence: HTMLElement | null;
  dashboard: HTMLElement | null;
};

const PLAN: Point[] = [
  { id: 'wall', n: '01', label: 'Стык 312 / 314', title: 'Старый дверной проём', text: 'На архивном плане между номерами отмечена дверная коробка шириной 820 мм.' },
  { id: 'stamp', n: '02', label: 'Штамп реконструкции', title: 'Заделка не подтверждена актом', text: 'Проект предписывал закрыть проём панелями, но окончательный акт в архиве отсутствует.' },
  { id: 'width', n: '03', label: 'Толщина стены', title: 'Сохранилась служебная полость', text: 'Промежуток почти на метр шире обычной перегородки и допускает узкий технический маршрут.' }
];

const ROOM: Point[] = [
  { id: 'panel', n: '01', label: 'Шкаф у общей стены', title: 'Панель открывали недавно', text: 'Новые винты скрывают старую металлическую дверную коробку.' },
  { id: 'tracks', n: '02', label: 'Ковёр', title: 'Следы совпадают с номером 314', text: 'Две параллельные полосы образуют единый маршрут между комнатами.' },
  { id: 'envelope', n: '03', label: 'Письменный стол', title: 'Конверт из архива 2015 года', text: 'На обороте рукой Дениса записано: «оригинал — у А.Б.».' },
  { id: 'fibres', n: '04', label: 'Решётка у панели', title: 'Свежие волокна тёмной ткани', text: 'Маршрут через скрытый проём использовали недавно.' }
];

const ARCHIVE: Point[] = [
  { id: 'catalog', n: '01', label: 'Каталог оцифровки', title: 'В цифровой папке нет одного оригинала', text: 'В бумажной описи 48 файлов, Денис передал Илье только 47.' },
  { id: 'contact', n: '02', label: 'Контактный лист B', title: 'Кадр B-17 существовал', text: 'Между B-16 и B-18 сохранилась отметка «оригинал отдельно» и номер 314-17.' },
  { id: 'audio', n: '03', label: 'Расшифровка диктофона', title: 'Антон спорил с Кириллом', text: 'На записи обсуждается незакрытый служебный проход перед гибелью Антона.' },
  { id: 'custody', n: '04', label: 'Журнал носителей', title: 'Второй носитель не был возвращён', text: 'Серийный номер совпадает с пустым футляром из сумки Ильи.' }
];

const IDENTITY: Point[] = [
  { id: 'registration', n: '01', label: 'Регистрационная карточка', title: 'Фамилия Ветрова появилась после 2018 года', text: 'Дата рождения и подпись совпадают со старыми документами.' },
  { id: 'festival', n: '02', label: 'Список родственников 2015', title: 'Елена Ветрова — Вера Белова', text: 'Вера указана как младшая сестра погибшего Антона Белова.' },
  { id: 'message', n: '03', label: 'Черновик Ильи', title: 'Илья знал настоящее имя Веры', text: 'Он просил приехать под фамилией матери и не раскрывать личность до копирования карты.' }
];

const SEARCH: Point[] = [
  { id: 'entry', n: '01', label: 'Дверь и защёлка', title: 'Комнату заперли снаружи', text: 'Человек внутри не мог открыть сервисную защёлку без инструмента.' },
  { id: 'ilya', n: '02', label: 'За ширмой', title: 'Илья найден живым', text: 'Он дезориентирован, но реагирует на голос и сообщает, что успел спрятать карту.' },
  { id: 'medical', n: '03', label: 'Аптечный шкаф', title: 'Кто-то пытался остановить кровь', text: 'После минимальной помощи пострадавшего оставили без связи и врача.' },
  { id: 'lamp', n: '04', label: 'Аварийный светильник', title: 'Найден адаптер 314-17', text: 'Пустой адаптер указывает на техническую нишу, где спрятана microSD.' }
];

const CARD: Point[] = [
  { id: 'serial', n: '01', label: 'Серийный номер', title: 'Носитель совпадает с архивной записью', text: 'Идентификатор совпадает с журналом выдачи и футляром Ильи.' },
  { id: 'copy', n: '02', label: 'Журнал копирования', title: 'Илья создал проверочную копию', text: 'Контрольная сумма из черновика совпадает с файлом на карте.' },
  { id: 'clip', n: '03', label: 'Фрагмент B-17', title: 'Запись раскрывает старый мотив', text: 'Кирилл требует продолжить мероприятие, несмотря на опасный открытый маршрут.' },
  { id: 'integrity', n: '04', label: 'Проверка целостности', title: 'Фрагмент не редактировался', text: 'Метаданные и последовательность кадров подтверждают непрерывную оригинальную запись.' }
];

const CHECKPOINT = [
  { id: 'vera_attack', text: 'Вера похитила Илью, чтобы вернуть карту.', feedback: 'Она скрывала личность, но её перемещения не связывают её со скрытым проходом.' },
  { id: 'denis_route', text: 'Денис вывел Илью через проход и уничтожил оригинал.', feedback: 'Денис лгал об архиве, но его присутствие в баре подтверждено.' },
  { id: 'separate_lies', text: 'Денис скрывал оригинал, Вера — личность; их ложь не устанавливает исполнителя, использовавшего проход из 312.', feedback: 'Верно. Мотив карты установлен, а физический маршрут по-прежнему ведёт к номеру 312.', correct: true },
  { id: 'common_plot', text: 'Все участники заранее договорились инсценировать исчезновение.', feedback: 'Материалы показывают разные причины для лжи, а не общий сговор.' }
];

const FINAL = [
  { id: 'premeditated', text: 'Кирилл заранее планировал убийство Антона и Ильи.', feedback: 'Доказано сокрытие нарушения и нападение, но не заранее подготовленное убийство.' },
  { id: 'conspiracy', text: 'Денис, Вера и Кирилл совместно инсценировали исчезновение.', feedback: 'Их ложь имела разные причины; общий сговор не подтверждён.' },
  { id: 'kirill_responsibility', text: 'Кирилл пришёл за картой через скрытый проход, травмировал Илью, перенёс и запер его без вызова помощи. Карта подтверждает его роль в сокрытии опасного нарушения 2015 года.', feedback: 'Верно. Мотив, маршрут и действия после нападения образуют единую цепочку.', correct: true },
  { id: 'staged', text: 'Илья сам инсценировал исчезновение.', feedback: 'Состояние Ильи, внешняя защёлка и признание Кирилла исключают инсценировку.' }
];

const emptyAct2: Act2State = { plan: [], room: [], questions: [] };
const emptyAct3: Act3State = { archive: [], identity: [], questions: [], checkpointAnswer: null, complete: false };
const emptyAct4: Act4State = { search: [], card: [], finalAnswer: null, wrongAnswers: [], complete: false, startedAt: null, completedAt: null };

function readJson<T>(key: string, fallback: T): T {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '{}') as Partial<T>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function unique(list: string[], id: string): string[] {
  return list.includes(id) ? list : [...list, id];
}

function all(list: string[], points: Point[]): boolean {
  return points.every((point) => list.includes(point.id));
}

function coreComplete(): boolean {
  return readJson<{ act1Complete?: boolean }>(CORE_STORAGE_KEY, {}).act1Complete === true;
}

function interrogationComplete(): boolean {
  return readJson<{ complete?: boolean }>(INTERROGATION_STORAGE_KEY, {}).complete === true;
}

function clickTab(label: string): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button'));
  buttons.find((button) => button.textContent?.includes(label))?.click();
}

function EvidenceCard({ id, title, category, summary, image, enabled, progress, onOpen }: {
  id: EvidenceId;
  title: string;
  category: string;
  summary: string;
  image: string;
  enabled: boolean;
  progress: number;
  onOpen: () => void;
}) {
  const complete = progress >= (id === 'E006' || id === 'E009' ? 3 : 4);
  return (
    <button
      type="button"
      data-evidence-id={id}
      className={`premium-evidence-card react-evidence-card evidence-${id.toLowerCase()} ${complete ? 'seen' : ''} ${enabled ? '' : 'locked'}`}
      disabled={!enabled}
      onClick={onOpen}
    >
      <img src={image} alt="" />
      <div className="evidence-card-shade" />
      <div className="evidence-card-top"><span>{id}</span><span className={`premium-pill ${complete ? 'secure' : enabled ? 'live' : 'neutral'}`}>{complete ? 'Изучено' : progress ? 'В работе' : enabled ? 'Новое' : 'Закрыто'}</span></div>
      <div className="evidence-card-icon">{id === 'E006' ? '⌗' : id === 'E008' ? '▤' : id === 'E009' ? '◎' : id === 'E011' ? '▣' : '⌖'}</div>
      <div className="evidence-card-copy"><small>{category}</small><h2>{title}</h2><p>{enabled ? summary : 'Откроется после завершения предыдущего шага.'}</p></div>
      <span className="evidence-number">{id.slice(1)}</span>
    </button>
  );
}

function ModalShell({ id, category, title, summary, onClose, children }: {
  id: EvidenceId;
  category: string;
  title: string;
  summary: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return createPortal(
    <div className="premium-modal-backdrop react-case-modal-backdrop" onMouseDown={onClose}>
      <section className={`premium-modal evidence-modal-premium react-case-modal evidence-${id.toLowerCase()}`} onMouseDown={(event) => event.stopPropagation()}>
        <header className="premium-modal-header"><div><p className="premium-kicker">{category} · {id}</p><h1>{title}</h1><p>{summary}</p></div><button className="premium-icon-button close" onClick={onClose} aria-label="Закрыть">×</button></header>
        <div className="premium-modal-body react-case-modal-body">{children}</div>
        <footer className="premium-modal-footer"><span>Прогресс сохраняется автоматически</span><button className="premium-cta compact" onClick={onClose}>Вернуться в штаб <span>→</span></button></footer>
      </section>
    </div>,
    document.body
  );
}

function PointList({ points, selected, onSelect }: { points: Point[]; selected: string[]; onSelect: (id: string) => void }) {
  return <div className="react-point-list">{points.map((point) => {
    const done = selected.includes(point.id);
    return <button key={point.id} className={done ? 'done' : ''} onClick={() => onSelect(point.id)}><span>{done ? '✓' : point.n}</span><div><strong>{point.label}</strong><small>{done ? point.title : 'Проверить'}</small></div></button>;
  })}</div>;
}

function Finding({ points, selected, completeText }: { points: Point[]; selected: string[]; completeText: React.ReactNode }) {
  const latest = points.find((point) => point.id === selected.at(-1));
  const complete = all(selected, points);
  return <div className={`react-finding ${complete ? 'success' : ''}`}>{complete ? completeText : latest ? <><p className="premium-kicker">Обнаружено</p><h3>{latest.title}</h3><p>{latest.text}</p></> : <><span>⌖</span><strong>Выберите контрольную точку</strong><p>Каждая проверка фиксируется в сохранении немедленно.</p></>}</div>;
}

function Report({ act4, onClose }: { act4: Act4State; onClose: () => void }) {
  const rank = act4.wrongAnswers.length === 0 ? 'Следователь высшей категории' : act4.wrongAnswers.length <= 2 ? 'Точная реконструкция' : 'Дело раскрыто';
  const copy = () => navigator.clipboard?.writeText(`ДБР — дело №001 «Номер 314»\nИлья найден живым.\nКирилл использовал скрытый проход, травмировал Илью и скрыл его без вызова помощи.\nИтог: ${rank}.`);
  return createPortal(<div className="act4-report-overlay" onMouseDown={onClose}><article className="act4-report" onMouseDown={(event) => event.stopPropagation()}><div className="act4-report-grid"/><header><p>ДБР · ДЕЛО №001</p><span>РАССЛЕДОВАНИЕ ЗАВЕРШЕНО</span><h1>Номер 314</h1><h2>{rank}</h2></header><section className="act4-report-hero"><strong>Илья найден живым</strong><p>После госпитализации он подтвердил обстоятельства нападения и происхождение карты 314-17.</p></section><div className="act4-report-columns"><section><small>ЭТОЙ НОЧЬЮ</small><h3>Нападение и сокрытие</h3><p>Кирилл прошёл из 312 в 314, потребовал карту, травмировал Илью и перенёс его в служебную комнату.</p></section><section><small>ДЕЛО 2015 ГОДА</small><h3>Мотив подтверждён</h3><p>Оригинал B-17 доказывает сокрытие опасного служебного маршрута после гибели Антона.</p></section></div><div className="act4-responsibility"><div><span>КИРИЛЛ</span><strong>Нападение и сокрытие</strong><p>Использовал проход и не вызвал помощь.</p></div><div><span>ДЕНИС</span><strong>Сокрытие архива</strong><p>Удалил B-17 из цифровой копии.</p></div><div><span>ВЕРА</span><strong>Ложные сведения</strong><p>Скрыла личность, но передала оригинал Илье.</p></div></div><footer><div><small>ИТОГОВАЯ ОЦЕНКА</small><strong>{rank}</strong><span>Ошибочных финальных версий: {act4.wrongAnswers.length}</span></div><div className="act4-report-actions"><button onClick={copy}>Скопировать итог</button><button onClick={onClose}>Закрыть</button></div></footer></article></div>, document.body);
}

export function ReactCaseExtension() {
  const [act2, setAct2] = useState(() => readJson(ACT2_STORAGE_KEY, emptyAct2));
  const [act3, setAct3] = useState(() => readJson(ACT3_STORAGE_KEY, emptyAct3));
  const [act4, setAct4] = useState(() => readJson(ACT4_STORAGE_KEY, emptyAct4));
  const [active, setActive] = useState<ActiveModal>(null);
  const [targets, setTargets] = useState<Targets>({ evidence: null, dashboard: null });
  const [externalTick, setExternalTick] = useState(0);

  const refreshTargets = useCallback(() => {
    window.requestAnimationFrame(() => {
      const evidence = document.querySelector<HTMLElement>('.premium-evidence-grid');
      const dashboard = document.querySelector<HTMLElement>('.premium-dashboard');
      setTargets((current) => current.evidence === evidence && current.dashboard === dashboard ? current : { evidence, dashboard });
    });
  }, []);

  const refreshExternal = useCallback(() => {
    setAct2(readJson(ACT2_STORAGE_KEY, emptyAct2));
    setAct3(readJson(ACT3_STORAGE_KEY, emptyAct3));
    setAct4(readJson(ACT4_STORAGE_KEY, emptyAct4));
    setExternalTick((value) => value + 1);
    refreshTargets();
  }, [refreshTargets]);

  useEffect(() => {
    refreshTargets();
    const events = ['dbr:runtime-settled', 'dbr:interrogation-updated', 'dbr:act2-updated', 'dbr:act3-updated', 'dbr:act4-updated', 'pageshow', 'storage'];
    events.forEach((name) => window.addEventListener(name, refreshExternal));
    document.addEventListener('click', refreshTargets, true);
    return () => {
      events.forEach((name) => window.removeEventListener(name, refreshExternal));
      document.removeEventListener('click', refreshTargets, true);
    };
  }, [refreshExternal, refreshTargets]);

  function saveAct2(next: Act2State) {
    setAct2(next);
    localStorage.setItem(ACT2_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('dbr:act2-updated'));
  }

  function saveAct3(next: Act3State) {
    setAct3(next);
    localStorage.setItem(ACT3_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('dbr:act3-updated', { detail: { complete: next.complete } }));
  }

  function saveAct4(next: Act4State) {
    setAct4(next);
    localStorage.setItem(ACT4_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('dbr:act4-updated', { detail: { complete: next.complete } }));
  }

  const act1 = useMemo(() => coreComplete(), [externalTick]);
  const planDone = all(act2.plan, PLAN);
  const roomDone = all(act2.room, ROOM);
  const archiveDone = all(act3.archive, ARCHIVE);
  const identityDone = all(act3.identity, IDENTITY);
  const questionsDone = act3.questions.includes('d-original') && act3.questions.includes('v-name');
  const searchDone = all(act4.search, SEARCH);
  const cardDone = all(act4.card, CARD);
  const interrogation = useMemo(() => interrogationComplete(), [externalTick]);
  const act4Unlocked = act3.complete && interrogation;

  const open = (id: EvidenceId) => setActive(id);
  const close = () => setActive(null);

  const cards = act1 && targets.evidence ? createPortal(<>
    <EvidenceCard id="E006" title="Архивный план третьего этажа" category="Архивный документ" summary="Найдите конструктивное отличие между номерами 312 и 314." image={CASE_MEDIA.evidence.archivePlan} enabled progress={act2.plan.length} onOpen={() => open('E006')} />
    <EvidenceCard id="E007" title="Осмотр номера 312" category="Интерактивная сцена" summary="Проверьте общую стену и следы в комнате Кирилла." image={CASE_MEDIA.room314} enabled={planDone} progress={act2.room.length} onOpen={() => open('E007')} />
    <EvidenceCard id="E008" title="Оригиналы фестиваля 2015" category="Архивное расследование" summary="Восстановите происхождение карты памяти 314-17." image={CASE_MEDIA.evidence.archiveTable} enabled={roomDone} progress={act3.archive.length} onOpen={() => open('E008')} />
    <EvidenceCard id="E009" title="Кто такая Елена Ветрова?" category="Проверка личности" summary="Сопоставьте документы гостьи с архивом семьи Белова." image={CASE_MEDIA.portraits.vera} enabled={archiveDone} progress={act3.identity.length} onOpen={() => open('E009')} />
    <EvidenceCard id="E010" title="Старая служебная комната" category="Финальная операция" summary="Найдите Илью и зафиксируйте действия после нападения." image={CASE_MEDIA.evidence.serviceRoom} enabled={act4Unlocked} progress={act4.search.length} onOpen={() => open('E010')} />
    <EvidenceCard id="E011" title="Карта памяти 314-17" category="Цифровая экспертиза" summary="Подтвердите происхождение и содержание B-17." image={CASE_MEDIA.evidence.cardLab} enabled={searchDone} progress={act4.card.length} onOpen={() => open('E011')} />
  </>, targets.evidence) : null;

  let nextTitle = 'Изучить архивный план';
  let nextText = 'Найдите скрытый проход между номерами 312 и 314.';
  let nextAction = () => { clickTab('Материалы'); setActive('E006'); };
  if (planDone && !roomDone) { nextTitle = 'Осмотреть номер 312'; nextText = 'Подтвердите физическое использование прохода.'; nextAction = () => { clickTab('Материалы'); setActive('E007'); }; }
  else if (roomDone && !archiveDone) { nextTitle = 'Восстановить архив B-17'; nextText = 'Установите происхождение карты 314-17.'; nextAction = () => { clickTab('Материалы'); setActive('E008'); }; }
  else if (archiveDone && !act3.complete) { nextTitle = 'Установить личность Веры'; nextText = identityDone && questionsDone ? 'Сдайте промежуточный отчёт №2.' : 'Завершите E009 и получите объяснения Дениса и Веры.'; nextAction = () => { clickTab('Материалы'); setActive('E009'); }; }
  else if (act3.complete && !interrogation) { nextTitle = 'Разрушить алиби Кирилла'; nextText = 'Откройте Кирилла в разделе «Люди» и предъявите доказательства.'; nextAction = () => clickTab('Люди'); }
  else if (act4Unlocked && !searchDone) { nextTitle = 'Найти Илью'; nextText = 'Проведите финальную операцию в служебной зоне.'; nextAction = () => { clickTab('Материалы'); setActive('E010'); }; }
  else if (searchDone && !cardDone) { nextTitle = 'Проверить карту 314-17'; nextText = 'Подтвердите подлинность фрагмента B-17.'; nextAction = () => { clickTab('Материалы'); setActive('E011'); }; }
  else if (cardDone && !act4.complete) { nextTitle = 'Сформулировать окончательное обвинение'; nextText = 'Разделите нападение, сокрытие прошлого и отдельную ложь свидетелей.'; nextAction = () => clickTab('Дело'); }
  else if (act4.complete) { nextTitle = 'Открыть итог дела'; nextText = 'Расследование завершено. Итоговый отчёт готов.'; nextAction = () => setActive('report'); }

  const selectedFinal = FINAL.find((option) => option.id === act4.finalAnswer);
  const dashboard = act1 && targets.dashboard ? createPortal(<section className="react-case-dashboard" data-react-case-core="v0.8.5"><button className="next-action-card react-next-action" onClick={nextAction}><div className="action-index">React Core · следующий шаг</div><div><strong>{nextTitle}</strong><span>{nextText}</span></div><span className="react-action-arrow">→</span></button>{cardDone && <article className="premium-panel react-final-panel"><div className="panel-title"><div><p className="premium-kicker">Окончательный отчёт</p><h2>Кто и за что несёт ответственность?</h2></div><span className={`premium-pill ${act4.complete ? 'secure' : 'live'}`}>{act4.complete ? 'Принят' : 'Готов'}</span></div>{!act4.complete && <div className="act4-final-question">{FINAL.map((option) => <button key={option.id} className={act4.finalAnswer === option.id ? option.correct ? 'chosen correct' : 'chosen wrong' : ''} onClick={() => {
    const next: Act4State = { ...act4, finalAnswer: option.id };
    if (option.correct) { next.complete = true; next.completedAt = new Date().toISOString(); }
    else next.wrongAnswers = unique(next.wrongAnswers, option.id);
    saveAct4(next);
    if (option.correct) setActive('report');
  }}><span>{act4.finalAnswer === option.id ? option.correct ? '✓' : '×' : '○'}</span><strong>{option.text}</strong></button>)}</div>}{selectedFinal && !act4.complete && <div className="act4-final-feedback warning"><strong>Вывод требует проверки</strong><p>{selectedFinal.feedback}</p></div>}{act4.complete && <div className="act4-final-feedback success"><strong>Доказательная цепочка принята</strong><p>{selectedFinal?.feedback}</p><button onClick={() => setActive('report')}>Открыть итог дела →</button></div>}</article>}</section>, targets.dashboard) : null;

  return <>
    {cards}
    {dashboard}
    {active === 'E006' && <ModalShell id="E006" category="Архивный документ" title="Архивный план третьего этажа" summary="Найдите отметки, исчезнувшие из современной схемы." onClose={close}><div className="act2-plan-layout"><section className="archive-plan-sheet react-scene"><div className="react-scene-label">ОБМЕРНЫЙ ПЛАН 2004 · ЛИСТ 3-А</div>{PLAN.map((point, index) => <button key={point.id} className={`plan-hotspot ${act2.plan.includes(point.id) ? 'inspected' : ''}`} style={{ left: `${28 + index * 24}%`, top: `${32 + (index % 2) * 22}%` }} onClick={() => saveAct2({ ...act2, plan: unique(act2.plan, point.id) })}><span>{act2.plan.includes(point.id) ? '✓' : point.n}</span><i>{point.label}</i></button>)}</section><aside className="react-investigation-panel"><PointList points={PLAN} selected={act2.plan} onSelect={(id) => saveAct2({ ...act2, plan: unique(act2.plan, id) })}/><Finding points={PLAN} selected={act2.plan} completeText={<><p className="premium-kicker">Вывод по E006</p><h3>Проход сохранился за панелями</h3><p>Архив объясняет маршрут, которого нет на современной схеме.</p></>}/></aside></div></ModalShell>}
    {active === 'E007' && <ModalShell id="E007" category="Интерактивная сцена" title="Осмотр номера 312" summary="Подтвердите, использовался ли скрытый маршрут этой ночью." onClose={close}><div className="act2-room-layout"><section className="act2-room-photo react-scene">{ROOM.map((point, index) => <button key={point.id} className={`act2-room-marker ${act2.room.includes(point.id) ? 'inspected' : ''}`} style={{ left: `${18 + index * 20}%`, top: `${25 + (index % 2) * 35}%` }} onClick={() => saveAct2({ ...act2, room: unique(act2.room, point.id) })}><span>{act2.room.includes(point.id) ? '✓' : point.n}</span><i>{point.label}</i></button>)}</section><aside className="react-investigation-panel"><PointList points={ROOM} selected={act2.room} onSelect={(id) => saveAct2({ ...act2, room: unique(act2.room, id) })}/><Finding points={ROOM} selected={act2.room} completeText={<><p className="premium-kicker">Вывод по E007</p><h3>Маршрут использовали этой ночью</h3><p>Панель, следы и волокна связывают номера 312 и 314.</p></>}/></aside></div></ModalShell>}
    {active === 'E008' && <ModalShell id="E008" category="Архивное расследование" title="Оригиналы фестиваля 2015" summary="Восстановите цепочку карты памяти 314-17." onClose={close}><div className="act3-archive-layout"><section className="archive-worktable react-scene"><div className="react-scene-label">ARCHIVE / BOX 15-B · B-17</div></section><aside className="react-investigation-panel"><PointList points={ARCHIVE} selected={act3.archive} onSelect={(id) => saveAct3({ ...act3, archive: unique(act3.archive, id) })}/><Finding points={ARCHIVE} selected={act3.archive} completeText={<><p className="premium-kicker">Вывод по E008</p><h3>Денис скрывал уникальный оригинал B-17</h3><p>Карта существовала, была у Ильи и стала вероятной целью нападения.</p></>}/></aside></div></ModalShell>}
    {active === 'E009' && <ModalShell id="E009" category="Проверка личности" title="Кто такая Елена Ветрова?" summary="Сопоставьте регистрационные сведения, архив и переписку Ильи." onClose={close}><div className="react-identity-layout"><section className="identity-comparison"><div className="identity-current-card"><div className="identity-portrait">ЕВ</div><div><small>ГОСТЬ · 307</small><strong>Елена Ветрова</strong><span>Заявленная связь отсутствует</span></div></div><div className={`identity-link ${identityDone ? 'confirmed' : ''}`}><span>⇄</span><small>{identityDone ? 'СОВПАДЕНИЕ' : 'СОПОСТАВЛЕНИЕ'}</small></div><div className="identity-archive-card"><div className="identity-portrait old">ВБ</div><div><small>АРХИВ · 2015</small><strong>Вера Белова</strong><span>Сестра Антона Белова</span></div></div><PointList points={IDENTITY} selected={act3.identity} onSelect={(id) => saveAct3({ ...act3, identity: unique(act3.identity, id) })}/></section><aside className="react-investigation-panel"><div className="react-question-block"><p className="premium-kicker">Ключевые объяснения</p><button disabled={!archiveDone} className={act3.questions.includes('d-original') ? 'done' : ''} onClick={() => saveAct3({ ...act3, questions: unique(act3.questions, 'd-original') })}><strong>Денис: почему отсутствует B-17?</strong><span>{act3.questions.includes('d-original') ? '«Я убрал его из общей копии, но карту отдал Илье». ✓' : 'Получить ответ'}</span></button><button disabled={!identityDone} className={act3.questions.includes('v-name') ? 'done' : ''} onClick={() => saveAct3({ ...act3, questions: unique(act3.questions, 'v-name') })}><strong>Елена: ваше настоящее имя — Вера Белова?</strong><span>{act3.questions.includes('v-name') ? '«Да. Антон был моим братом». ✓' : 'Получить ответ'}</span></button></div><div className="react-checkpoint"><p className="premium-kicker">Промежуточный отчёт №2</p>{CHECKPOINT.map((option) => <button key={option.id} disabled={!archiveDone || !identityDone || !questionsDone || act3.complete} className={act3.checkpointAnswer === option.id ? option.correct ? 'correct' : 'wrong' : ''} onClick={() => saveAct3({ ...act3, checkpointAnswer: option.id, complete: option.correct ? true : act3.complete })}><span>{act3.checkpointAnswer === option.id ? option.correct ? '✓' : '×' : '○'}</span><strong>{option.text}</strong></button>)}{act3.checkpointAnswer && <p>{CHECKPOINT.find((option) => option.id === act3.checkpointAnswer)?.feedback}</p>}</div></aside></div></ModalShell>}
    {active === 'E010' && <ModalShell id="E010" category="Финальная операция" title="Старая служебная комната" summary="Проверьте помещение, куда Кирилл перенёс Илью." onClose={close}><div className="act4-search-layout"><section className="act4-room-scene react-scene">{SEARCH.map((point, index) => <button key={point.id} className={`act4-hotspot ${['door','person','cabinet','lamp'][index]} ${act4.search.includes(point.id) ? 'done' : ''}`} onClick={() => saveAct4({ ...act4, startedAt: act4.startedAt ?? new Date().toISOString(), search: unique(act4.search, point.id) })}><i>{act4.search.includes(point.id) ? '✓' : point.n}</i><span>{point.label}</span></button>)}</section><aside className="react-investigation-panel"><PointList points={SEARCH} selected={act4.search} onSelect={(id) => saveAct4({ ...act4, startedAt: act4.startedAt ?? new Date().toISOString(), search: unique(act4.search, id) })}/><Finding points={SEARCH} selected={act4.search} completeText={<><p className="premium-kicker">Вывод по E010</p><h3>Илья был спрятан живым</h3><p>Кирилл запер дверь снаружи и продолжил искать карту.</p><button onClick={() => setActive('E011')}>Извлечь карту 314-17 →</button></>}/></aside></div></ModalShell>}
    {active === 'E011' && <ModalShell id="E011" category="Цифровая экспертиза" title="Карта памяти 314-17" summary="Подтвердите происхождение и подлинность B-17." onClose={close}><div className="act4-card-layout"><section className="act4-card-lab react-scene"><div className="act4-reader"><div className="act4-microsd"><span>314</span><strong>17</strong><i>ORIGINAL</i></div><div className="act4-reader-slot"/><div className={`act4-reader-light ${act4.card.length ? 'active' : ''}`}/></div></section><aside className="react-investigation-panel"><PointList points={CARD} selected={act4.card} onSelect={(id) => saveAct4({ ...act4, card: unique(act4.card, id) })}/><Finding points={CARD} selected={act4.card} completeText={<><p className="premium-kicker">Вывод по E011</p><h3>Старое дело стало мотивом нападения</h3><p>Подлинный B-17 связывает Кирилла с сокрытием опасного нарушения 2015 года.</p><button onClick={() => { close(); clickTab('Дело'); }}>Перейти к обвинению →</button></>}/></aside></div></ModalShell>}
    {active === 'report' && <Report act4={act4} onClose={close}/>} 
  </>;
}
