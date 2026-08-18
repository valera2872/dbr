import { useMemo, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ACT3_STORAGE_KEY } from './build';
import './identityEvidenceV2.css';

type Act3State = {
  archive: string[];
  identity: string[];
  questions: string[];
  checkpointAnswer: string | null;
  complete: boolean;
};

type IdentitySourceId = 'registration' | 'festival' | 'message';
type OpportunityMarker = 'e009:vera-corridor' | 'e009:vera-device' | 'e009:vera-route';

type IdentitySource = {
  id: IdentitySourceId;
  code: string;
  label: string;
  subtitle: string;
};

const SOURCES: IdentitySource[] = [
  { id: 'registration', code: 'REG', label: 'Карточка гостя 307', subtitle: 'Проверить данные Елены Ветровой' },
  { id: 'festival', code: 'FAM', label: 'Архив семьи Белова', subtitle: 'Сопоставить данные Веры' },
  { id: 'message', code: 'MSG', label: 'Черновик Ильи', subtitle: 'Понять условия встречи' }
];

const OPPORTUNITY: { id: OpportunityMarker; code: string; label: string; result: string }[] = [
  {
    id: 'e009:vera-corridor',
    code: 'C3',
    label: 'Проверить коридор C3 после 23:04',
    result: 'Камера фиксирует вход Елены/Веры в 307 в 23:04. До конца критического окна 00:18–00:31 выход из 307 в гостевой коридор не зафиксирован.'
  },
  {
    id: 'e009:vera-device',
    code: 'NET',
    label: 'Сверить устройство в 00:19',
    result: 'Сообщение Ильи открыто на устройстве Веры в 00:19; в этот момент телефон остаётся подключён к точке доступа сектора 307. Это подтверждает присутствие в своей части этажа, но само по себе не является абсолютным алиби.'
  },
  {
    id: 'e009:vera-route',
    code: 'MAP',
    label: 'Сверить 307 со старой сетью',
    result: 'План E006 показывает: старая служебная сеть имеет ветви к 312, 314 и staff-зоне P3/M3. Связи с номером 307 нет.'
  }
];

const EMPTY: Act3State = { archive: [], identity: [], questions: [], checkpointAnswer: null, complete: false };

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
  window.dispatchEvent(new CustomEvent('dbr:act3-updated', { detail: { source: 'e009-v2', complete: next.complete } }));
}

function RegistrationSource() {
  return <section className="identity-v2-document identity-v2-registration">
    <header><div><small>HOTEL REGISTRATION · ROOM 307</small><strong>Регистрационная карточка гостя</strong></div><span>ТЕКУЩАЯ ПОЕЗДКА</span></header>
    <div className="identity-v2-form">
      <label><small>ИМЯ</small><strong>Елена Ветрова</strong></label>
      <label><small>НОМЕР</small><strong>307</strong></label>
      <label><small>ДАТА РОЖДЕНИЯ</small><strong>совпадение с архивной записью</strong></label>
      <label><small>ПОДПИСЬ</small><strong className="signature">E. Vetrova</strong></label>
    </div>
    <div className="identity-v2-note"><span>История фамилии</span><strong>«Ветрова» появляется в доступных регистрационных документах после 2018 года.</strong></div>
    <p>Карточка сама по себе не доказывает подмену личности. Она создаёт проверяемое совпадение с архивом семьи Белова.</p>
  </section>;
}

function FamilySource() {
  return <section className="identity-v2-document identity-v2-family">
    <header><div><small>FAMILY / INCIDENT FILE · 2015</small><strong>Контактный лист семьи Антона Белова</strong></div><span>АРХИВ</span></header>
    <div className="identity-v2-family-card">
      <div className="identity-v2-initials">ВБ</div>
      <div><small>БЛИЗКИЙ РОДСТВЕННИК</small><h3>Вера Белова</h3><p>младшая сестра Антона Белова</p><span>Дата рождения совпадает с карточкой гостьи 307.</span></div>
    </div>
    <div className="identity-v2-ledger">
      <div><span>2015</span><b>семейный контакт после происшествия</b></div>
      <div><span>2018</span><b>получатель оригинала 314-17 после оцифровки</b></div>
      <div className="open"><span>2026</span><b>в списке встречи имя «Вера Белова» отсутствует</b></div>
    </div>
    <p>Архив устанавливает человека и связь с B-17, но пока не говорит, под каким именем Вера приехала сейчас.</p>
  </section>;
}

function MessageSource() {
  return <section className="identity-v2-document identity-v2-message">
    <header><div><small>ILYA / UNSENT DRAFT</small><strong>Черновик сообщения источнику</strong></div><span>21:58</span></header>
    <div className="identity-v2-chat">
      <p><b>Илья</b><span>«В., приезжай под фамилией матери. До копирования не раскрывай, кто ты».</span></p>
      <p><b>Илья</b><span>«Сначала сверю оригинал и сделаю контрольную копию. После этого решим, что можно публиковать».</span></p>
      <p className="draft"><b>Черновик</b><span>«Я понимаю, почему ты не хочешь снова вытаскивать имя Антона в публичную историю».</span></p>
    </div>
    <footer><span>Документ объясняет причину скрытого имени.</span><b>Он не доказывает невиновность источника.</b></footer>
  </section>;
}

function SourceBody({ source }: { source: IdentitySourceId }) {
  if (source === 'registration') return <RegistrationSource />;
  if (source === 'festival') return <FamilySource />;
  return <MessageSource />;
}

const CHECKPOINT = [
  {
    id: 'vera_attack',
    text: 'Вера скрывала имя и спорила с Ильёй из-за B-17, значит именно она напала на него.',
    feedback: 'Это правдоподобная версия, но мотив и ложь ещё не равны физической возможности. Сверьте критическое окно и доступ к маршруту.'
  },
  {
    id: 'denis_route',
    text: 'Раз Вера не могла попасть в 314 в критическое окно, виновником автоматически становится Денис.',
    feedback: 'Исключение одной версии не доказывает другую. Дениса, Кирилла и staff-доступ нужно проверять собственными независимыми следами.'
  },
  {
    id: 'separate_lies',
    text: 'Вера — реальный источник B-17 и реальная участница конфликта, но её положение в 307 и отсутствие маршрута из 307 исключают её как ночного исполнителя.',
    feedback: 'Верно. Её ложь имеет собственную причину и остаётся важной для истории B-17, но не объясняет проникновение в 314 в 00:22.',
    correct: true
  },
  {
    id: 'common_plot',
    text: 'Скрытая личность Веры доказывает общий сговор всех участников встречи.',
    feedback: 'Нет. Документы объясняют отдельный секрет Веры; общего плана между участниками они не устанавливают.'
  }
] as const;

function IdentityEvidenceV2({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<Act3State>(() => readState());
  const [source, setSource] = useState<IdentitySourceId>('registration');
  const identityDone = useMemo(() => SOURCES.every((item) => state.identity.includes(item.id)), [state.identity]);
  const admitted = state.questions.includes('v-name');
  const opportunityDone = useMemo(() => OPPORTUNITY.every((item) => state.questions.includes(item.id)), [state.questions]);

  const inspect = (id: IdentitySourceId) => {
    setSource(id);
    if (state.identity.includes(id)) return;
    const next = { ...state, identity: unique(state.identity, id) };
    setState(next);
    saveState(next);
  };

  const confront = () => {
    if (!identityDone || admitted) return;
    const questions = unique(unique(state.questions, 'd-original'), 'v-name');
    const next = { ...state, questions };
    setState(next);
    saveState(next);
  };

  const checkOpportunity = (id: OpportunityMarker) => {
    if (!admitted || state.questions.includes(id)) return;
    const next = { ...state, questions: unique(state.questions, id) };
    setState(next);
    saveState(next);
  };

  const chooseCheckpoint = (id: string, correct?: boolean) => {
    if (!opportunityDone || state.complete) return;
    const next = { ...state, checkpointAnswer: id, complete: correct ? true : state.complete };
    setState(next);
    saveState(next);
  };

  const selected = CHECKPOINT.find((item) => item.id === state.checkpointAnswer);

  return <div className="premium-modal-backdrop react-case-modal-backdrop identity-v2-backdrop" onMouseDown={onClose}>
    <section className="premium-modal evidence-modal-premium react-case-modal evidence-e009 identity-v2-modal" data-e009-identity-v2="1" onMouseDown={(event) => event.stopPropagation()}>
      <header className="premium-modal-header">
        <div><p className="premium-kicker">ДОКУМЕНТАЛЬНАЯ СВЕРКА · E009</p><h1>Елена Ветрова / неизвестный участник цепочки B-17</h1><p>Сначала установите личность по независимым документам. Затем отдельно проверьте, могла ли эта версия физически объяснить нападение в критическое окно.</p></div>
        <button className="premium-icon-button close" onClick={onClose} aria-label="Закрыть">×</button>
      </header>

      <div className="premium-modal-body identity-v2-layout">
        <aside className="identity-v2-source-list react-point-list">
          <div className="identity-v2-source-head"><small>ИСТОЧНИКИ ЛИЧНОСТИ</small><strong>{state.identity.length}/3 сверено</strong></div>
          {SOURCES.map((item) => {
            const done = state.identity.includes(item.id);
            return <button key={item.id} className={`${done ? 'done' : ''} ${source === item.id ? 'active' : ''}`} onClick={() => inspect(item.id)}>
              <span>{done ? '✓' : item.code}</span><div><strong>{item.label}</strong><small>{item.subtitle}</small></div>
            </button>;
          })}
          <div className="identity-v2-rule"><span>Разделяйте два вопроса</span><p><b>Кто она?</b> и <b>могла ли она совершить нападение?</b> — это разные доказательные задачи.</p></div>
        </aside>

        <section className="identity-v2-workspace react-scene">
          <div className="identity-v2-workspace-bar"><span>IDENTITY DESK / CASE 001</span><b>{SOURCES.find((item) => item.id === source)?.label}</b><em>COMPARE</em></div>
          <SourceBody source={source} />
        </section>

        <aside className="react-investigation-panel identity-v2-findings">
          <div className={`react-finding ${identityDone ? 'success' : ''}`}>
            {identityDone ? <>
              <p className="premium-kicker">ДОКУМЕНТАЛЬНЫЙ ВЫВОД</p>
              <h3>«Елена Ветрова» и Вера Белова — один человек</h3>
              <p>Совпадают регистрационные данные, семейный архив и условия встречи в черновике Ильи. Скрытая фамилия была частью договорённости вокруг передачи оригинала.</p>
              {!admitted ? <button className="premium-cta compact identity-v2-confront" onClick={confront}>Предъявить сопоставление Елене →</button> : <div className="identity-v2-statement"><small>ОБЪЯСНЕНИЕ ВЕРЫ</small><p>«Да. Я Вера Белова. Антон был моим братом. Я привезла Илье оригинал 314-17. Мы спорили: я не хотела публикации до проверки копии и не хотела снова превращать смерть Антона в сенсацию».</p><strong>Это подтверждает секрет, источник и конфликт — но ещё не отвечает, где Вера была во время нападения.</strong></div>}
            </> : <>
              <span>◎</span><strong>Не угадывайте псевдоним</strong><p>Сверьте текущую регистрацию, семейную запись и черновик Ильи. Личность должна возникнуть из совпадений, а не из подписи интерфейса.</p>
            </>}
          </div>

          {admitted && <section className="identity-v2-opportunity">
            <header><small>СЛЕДУЮЩАЯ ГИПОТЕЗА</small><h3>Могла ли Вера попасть в 314 в 00:22?</h3><p>Теперь у неё есть мотив и скрытая связь с B-17. Проверьте возможность отдельно.</p></header>
            <div className="identity-v2-opportunity-list">
              {OPPORTUNITY.map((item) => {
                const done = state.questions.includes(item.id);
                return <button key={item.id} className={done ? 'done' : ''} onClick={() => checkOpportunity(item.id)} disabled={done}>
                  <span>{done ? '✓' : item.code}</span><div><strong>{item.label}</strong><small>{done ? item.result : 'Проверить'}</small></div>
                </button>;
              })}
            </div>
          </section>}

          {opportunityDone && <section className="identity-v2-checkpoint react-checkpoint">
            <p className="premium-kicker">ПРОМЕЖУТОЧНЫЙ ОТЧЁТ №2</p>
            <h3>Что теперь можно утверждать о Вере?</h3>
            {CHECKPOINT.map((option) => <button key={option.id} disabled={state.complete} className={state.checkpointAnswer === option.id ? option.correct ? 'correct' : 'wrong' : ''} onClick={() => chooseCheckpoint(option.id, option.correct)}>
              <span>{state.checkpointAnswer === option.id ? option.correct ? '✓' : '×' : '○'}</span><strong>{option.text}</strong>
            </button>)}
            {selected && <p className={selected.correct ? 'identity-v2-feedback success' : 'identity-v2-feedback warning'}>{selected.feedback}</p>}
          </section>}
        </aside>
      </div>

      <footer className="premium-modal-footer"><span>{state.complete ? 'Версия Веры проверена фактами критического окна.' : 'Личность, мотив и физическая возможность проверяются отдельно.'}</span><button className="premium-cta compact" onClick={onClose}>Вернуться в штаб <span>→</span></button></footer>
    </section>
  </div>;
}

let host: HTMLDivElement | null = null;
let root: Root | null = null;
let installed = false;

function ensureRoot(): Root {
  if (!host) {
    host = document.createElement('div');
    host.id = 'dbr-e009-v2-root';
    document.body.append(host);
  }
  if (!root) root = createRoot(host);
  return root;
}

function closeIdentity(): void {
  root?.render(<></>);
}

function openIdentity(): void {
  ensureRoot().render(<IdentityEvidenceV2 onClose={closeIdentity} />);
}

function patchCardCopy(): void {
  const card = document.querySelector<HTMLElement>('[data-evidence-id="E009"]');
  if (!card) return;
  const summary = card.querySelector<HTMLElement>('.evidence-card-copy p');
  const category = card.querySelector<HTMLElement>('.evidence-card-copy small');
  if (summary) summary.textContent = 'Сопоставьте личность источника B-17, затем отдельно проверьте её возможность в критическое окно.';
  if (category) category.textContent = 'Документальная сверка';
}

export function installIdentityEvidenceV2(): void {
  if (installed) return;
  installed = true;
  ensureRoot();

  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    const card = target?.closest<HTMLButtonElement>('[data-evidence-id="E009"]');
    if (!card || card.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openIdentity();
  }, true);

  const patch = () => window.requestAnimationFrame(() => patchCardCopy());
  document.addEventListener('click', patch, true);
  ['dbr:runtime-settled', 'dbr:act3-updated', 'pageshow'].forEach((name) => window.addEventListener(name, patch));
  patch();
}
