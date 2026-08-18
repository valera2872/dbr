import { useMemo, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ACT3_STORAGE_KEY } from './build';
import './archiveEvidenceV2.css';

type Act3State = {
  archive: string[];
  identity: string[];
  questions: string[];
  checkpointAnswer: string | null;
  complete: boolean;
};

type ArchiveSourceId = 'catalog' | 'contact' | 'audio' | 'custody';

type ArchiveSource = {
  id: ArchiveSourceId;
  code: string;
  label: string;
  subtitle: string;
};

const SOURCES: ArchiveSource[] = [
  { id: 'catalog', code: 'INV', label: 'Опись оцифровки', subtitle: 'Сверить количество позиций' },
  { id: 'contact', code: 'B', label: 'Контактный лист B', subtitle: 'Проверить место B-17' },
  { id: 'audio', code: 'AUD', label: 'Фрагмент диктофона', subtitle: 'Прослушать спор о безопасности' },
  { id: 'custody', code: 'LOG', label: 'Журнал носителей', subtitle: 'Восстановить цепочку 314-17' }
];

const EMPTY: Act3State = {
  archive: [],
  identity: [],
  questions: [],
  checkpointAnswer: null,
  complete: false
};

function unique(values: string[], value: string): string[] {
  return values.includes(value) ? values : [...values, value];
}

function readState(): Act3State {
  try {
    const raw = JSON.parse(localStorage.getItem(ACT3_STORAGE_KEY) ?? '{}') as Partial<Act3State>;
    return {
      archive: Array.isArray(raw.archive) ? raw.archive.filter((item): item is string => typeof item === 'string') : [],
      identity: Array.isArray(raw.identity) ? raw.identity.filter((item): item is string => typeof item === 'string') : [],
      questions: Array.isArray(raw.questions) ? raw.questions.filter((item): item is string => typeof item === 'string') : [],
      checkpointAnswer: typeof raw.checkpointAnswer === 'string' ? raw.checkpointAnswer : null,
      complete: raw.complete === true
    };
  } catch {
    return EMPTY;
  }
}

function saveState(next: Act3State): void {
  localStorage.setItem(ACT3_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('dbr:act3-updated', { detail: { source: 'e008-v2', complete: next.complete } }));
}

function CatalogSource() {
  return <section className="archive-v2-document archive-v2-inventory">
    <header><div><small>BOX 15-B · INVENTORY</small><strong>Опись материалов фестиваля 2015</strong></div><span>Лист 2/4</span></header>
    <div className="archive-v2-counts">
      <article><small>БУМАЖНАЯ ОПИСЬ</small><strong>48</strong><span>физических позиций</span></article>
      <article><small>ЦИФРОВОЙ ЭКСПОРТ</small><strong>47</strong><span>файлов передано</span></article>
      <article className="mismatch"><small>РАСХОЖДЕНИЕ</small><strong>−1</strong><span>позиция отсутствует</span></article>
    </div>
    <div className="archive-v2-table">
      <div className="head"><span>№</span><span>Носитель</span><span>Оригинал</span><span>Экспорт</span><span>Оператор</span></div>
      <div><span>46</span><span>B-16</span><span>есть</span><span>DSC_B16.mov</span><span>Д. Ракитин</span></div>
      <div className="alert"><span>47</span><span>B-17</span><span>отдельно</span><span>—</span><span>Д. Ракитин</span></div>
      <div><span>48</span><span>B-18</span><span>есть</span><span>DSC_B18.mov</span><span>Д. Ракитин</span></div>
    </div>
    <footer><span>Примечание к B-17:</span><b>«ORIGINAL OUT / в общий экспорт не включать»</b></footer>
  </section>;
}

function ContactSource() {
  return <section className="archive-v2-document archive-v2-contact">
    <header><div><small>CONTACT B · FRAME INDEX</small><strong>Контактный лист носителя B</strong></div><span>2015-06-14</span></header>
    <div className="archive-v2-filmstrip">
      <article><div className="frame">B-16</div><small>22:11:08</small><span>служебный коридор</span></article>
      <article className="missing"><div className="frame">B-17</div><small>ORIGINAL OUT</small><span>маркировка 314-17</span></article>
      <article><div className="frame">B-18</div><small>22:19:42</small><span>техническая лестница</span></article>
    </div>
    <div className="archive-v2-note"><span>Карандашная пометка архивиста</span><strong>«B-17 снят с общего листа. Оригинал хранится отдельно»</strong></div>
    <p className="archive-v2-raw-note">На листе нет подписи, объясняющей содержание B-17 или называющей человека на записи. Он доказывает только существование отдельного оригинала между B-16 и B-18.</p>
  </section>;
}

function AudioSource() {
  return <section className="archive-v2-document archive-v2-audio">
    <header><div><small>VOICE RECORDER · PARTIAL TRANSCRIPT</small><strong>Фрагмент служебного разговора</strong></div><span>00:31</span></header>
    <div className="archive-v2-wave" aria-hidden="true">{Array.from({ length: 42 }, (_, index) => <i key={index} style={{ height: `${18 + ((index * 17) % 54)}%` }} />)}</div>
    <div className="archive-v2-transcript">
      <p><b>ГОЛОС 1</b><span>«Эту техническую ветку надо закрыть сейчас. Я уже предупреждал: там небезопасно».</span></p>
      <p><b>ГОЛОС 2</b><span>«Программу не останавливаем. До утра ничего не меняем».</span></p>
      <p><b>ГОЛОС 1</b><span>«Тогда я фиксирую, что предупреждение было».</span></p>
      <p className="cut"><b>ФАЙЛ</b><span>[обрыв записи]</span></p>
    </div>
    <footer><span>Архивная пометка:</span><b>имена в сохранившемся фрагменте не произносятся</b></footer>
  </section>;
}

function CustodySource() {
  return <section className="archive-v2-document archive-v2-custody">
    <header><div><small>MEDIA CUSTODY · 314-17</small><strong>Журнал движения оригинала</strong></div><span>серия B</span></header>
    <div className="archive-v2-ledger">
      <div className="head"><span>Дата</span><span>Действие</span><span>Носитель</span><span>Получатель / подпись</span></div>
      <div><span>14.06.2015</span><span>зарегистрирован</span><span>314-17</span><span>архив фестиваля</span></div>
      <div><span>15.06.2015</span><span>изъят из общей оцифровки</span><span>314-17</span><span>Д. Ракитин</span></div>
      <div className="highlight"><span>16.06.2015</span><span>передан на хранение</span><span>314-17</span><span>В. Белова / семья потерпевшего</span></div>
      <div><span>—</span><span>возврат в цифровой архив</span><span>314-17</span><span>не зарегистрирован</span></div>
    </div>
    <div className="archive-v2-serial"><small>СЕРИЙНЫЙ ИДЕНТИФИКАТОР</small><strong>SD-314-17 / BATCH 06-15</strong><span>Совпадает с маркировкой пустого футляра из сумки Ильи.</span></div>
  </section>;
}

function SourceBody({ source }: { source: ArchiveSourceId }) {
  if (source === 'catalog') return <CatalogSource />;
  if (source === 'contact') return <ContactSource />;
  if (source === 'audio') return <AudioSource />;
  return <CustodySource />;
}

function ArchiveEvidenceV2({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<Act3State>(() => readState());
  const [source, setSource] = useState<ArchiveSourceId>('catalog');
  const complete = useMemo(() => SOURCES.every((item) => state.archive.includes(item.id)), [state.archive]);

  const inspect = (id: ArchiveSourceId) => {
    setSource(id);
    if (state.archive.includes(id)) return;
    const next = { ...state, archive: unique(state.archive, id) };
    setState(next);
    saveState(next);
  };

  return <div className="premium-modal-backdrop react-case-modal-backdrop archive-v2-backdrop" onMouseDown={onClose}>
    <section className="premium-modal evidence-modal-premium react-case-modal evidence-e008 archive-v2-modal" data-e008-archive-v2="1" onMouseDown={(event) => event.stopPropagation()}>
      <header className="premium-modal-header">
        <div><p className="premium-kicker">АРХИВ 2015 · E008</p><h1>BOX 15-B / происхождение B-17</h1><p>Работайте с исходными архивными записями. Сначала установите, что именно исчезло из цифрового набора и куда ушёл оригинал; не назначайте виновного по одному документу.</p></div>
        <button className="premium-icon-button close" onClick={onClose} aria-label="Закрыть">×</button>
      </header>

      <div className="premium-modal-body archive-v2-layout">
        <aside className="archive-v2-source-list react-point-list">
          <div className="archive-v2-source-head"><small>ИСТОЧНИКИ BOX 15-B</small><strong>{state.archive.length}/4 просмотрено</strong></div>
          {SOURCES.map((item) => {
            const done = state.archive.includes(item.id);
            return <button key={item.id} className={`${done ? 'done' : ''} ${source === item.id ? 'active' : ''}`} onClick={() => inspect(item.id)}>
              <span>{done ? '✓' : item.code}</span><div><strong>{item.label}</strong><small>{item.subtitle}</small></div>
            </button>;
          })}
          <div className="archive-v2-source-rule"><span>Правило доказательства</span><p>Архив может показать сокрытие носителя и исторический конфликт. Личность нападавшего этой ночью должна подтверждаться другой семьёй улик.</p></div>
        </aside>

        <section className="archive-worktable react-scene archive-v2-workspace">
          <div className="archive-v2-workspace-bar"><span>ARCHIVE TERMINAL / BOX 15-B</span><b>{SOURCES.find((item) => item.id === source)?.label}</b><em>READ ONLY</em></div>
          <SourceBody source={source} />
        </section>

        <aside className="react-investigation-panel archive-v2-findings">
          <div className={`react-finding ${complete ? 'success' : ''}`}>
            {complete ? <>
              <p className="premium-kicker">ВЫВОД ПО E008</p>
              <h3>Денис скрывал уникальный оригинал B-17 из цифрового набора</h3>
              <p>Бумажная опись содержит 48 позиций, экспорт — 47. B-17 существовал, был намеренно выведен из общей оцифровки и передан на хранение семье Белова. Серийный номер связывает эту цепочку с пустым футляром Ильи.</p>
              <div className="archive-v2-proof-boundary"><strong>Что ещё не доказано</strong><span>Фрагмент подтверждает спор об опасной служебной зоне и решение продолжить мероприятие, но в сохранившейся части нет имени. E008 не устанавливает ни точную историческую ответственность конкретного человека, ни исполнителя нынешнего нападения.</span></div>
            </> : <>
              <span>▤</span><strong>Сверьте независимые архивные источники</strong><p>Откройте опись, контактный лист, фрагмент записи и журнал движения носителя. Значим не порядок, а совпадение фактов между источниками.</p>
            </>}
          </div>
          <div className="archive-v2-observations">
            <small>УЖЕ УСТАНОВЛЕНО</small>
            <ul>
              {state.archive.includes('catalog') && <li>В бумажной описи 48 позиций, в цифровом экспорте 47.</li>}
              {state.archive.includes('contact') && <li>B-17 реально существовал между B-16 и B-18 и имел маркировку 314-17.</li>}
              {state.archive.includes('audio') && <li>До происшествия был зафиксирован спор о небезопасной технической ветке и решении не останавливать программу.</li>}
              {state.archive.includes('custody') && <li>314-17 вывели из общей оцифровки и передали семье Белова; возврат в цифровой архив не зарегистрирован.</li>}
            </ul>
          </div>
        </aside>
      </div>

      <footer className="premium-modal-footer"><span>Это архивный источник: выводы отделены от самих документов.</span><button className="premium-cta compact" onClick={onClose}>Вернуться в штаб <span>→</span></button></footer>
    </section>
  </div>;
}

let host: HTMLDivElement | null = null;
let root: Root | null = null;
let installed = false;

function ensureRoot(): Root {
  if (!host) {
    host = document.createElement('div');
    host.id = 'dbr-e008-v2-root';
    document.body.append(host);
  }
  if (!root) root = createRoot(host);
  return root;
}

function closeArchive(): void {
  root?.render(<></>);
}

function openArchive(): void {
  ensureRoot().render(<ArchiveEvidenceV2 onClose={closeArchive} />);
}

function patchCardCopy(): void {
  const card = document.querySelector<HTMLElement>('[data-evidence-id="E008"]');
  if (!card) return;
  const summary = card.querySelector<HTMLElement>('.evidence-card-copy p');
  const category = card.querySelector<HTMLElement>('.evidence-card-copy small');
  if (summary) summary.textContent = 'Сверьте бумажную опись, цифровой экспорт, контактный лист и журнал движения B-17.';
  if (category) category.textContent = 'Архивная система';
}

export function installArchiveEvidenceV2(): void {
  if (installed) return;
  installed = true;
  ensureRoot();

  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    const card = target?.closest<HTMLButtonElement>('[data-evidence-id="E008"]');
    if (!card || card.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openArchive();
  }, true);

  const patch = () => window.requestAnimationFrame(() => patchCardCopy());
  document.addEventListener('click', patch, true);
  ['dbr:runtime-settled', 'dbr:act3-updated', 'pageshow'].forEach((name) => window.addEventListener(name, patch));
  patch();
}
