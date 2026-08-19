import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ACT4_STORAGE_KEY } from './build';
import { refreshInvestigationState } from './investigationState';

type ActiveEvidence = 'E010' | 'E011' | null;
type Act4State = {
  search: string[];
  card: string[];
  finalAnswer: string | null;
  wrongAnswers: string[];
  complete: boolean;
  startedAt: string | null;
  completedAt: string | null;
};

type Point = {
  id: string;
  n: string;
  label: string;
  title: string;
  text: string;
};

const E010_CONCLUSION = 'e010:bounded-conclusion';
const E011_CONCLUSION = 'e011:historical-boundary';

const SEARCH: Point[] = [
  {
    id: 'entry',
    n: '01',
    label: 'Дверь и сервисная защёлка',
    title: 'Защёлка переведена снаружи',
    text: 'Механизм исправен. Человек внутри не мог открыть эту дверь без инструмента: после помещения Ильи в S-3 кто-то сознательно ограничил ему выход.'
  },
  {
    id: 'ilya',
    n: '02',
    label: 'Пространство за ширмой',
    title: 'Илья найден живым и травмированным',
    text: 'Он дезориентирован, реагирует на голос и нуждается в медицинской помощи. Сам факт обнаружения не устанавливает, кто перенёс его сюда.'
  },
  {
    id: 'medical',
    n: '03',
    label: 'Аптечный шкаф',
    title: 'До изоляции была оказана минимальная помощь',
    text: 'Использованы бинт и антисептик. Это показывает, что человек, оставивший Илью в S-3, понимал: тот жив и травмирован.'
  },
  {
    id: 'lamp',
    n: '04',
    label: 'Аварийный светильник',
    title: 'Адаптер найден, microSD — отдельно',
    text: 'Под плафоном лежит пустой адаптер 314-17. Сама microSD спрятана в технической нише: искомый носитель не был изъят у Ильи.'
  }
];

const LAB: Point[] = [
  {
    id: 'serial',
    n: '01',
    label: 'Идентификация носителя',
    title: 'Серийный номер совпадает',
    text: 'Номер microSD совпадает с журналом хранения B-17 и маркировкой футляра, который был у Ильи.'
  },
  {
    id: 'copy',
    n: '02',
    label: 'Контрольная копия 23:56',
    title: 'До нападения зафиксирован независимый хэш',
    text: 'Черновик Ильи содержит контрольную сумму, рассчитанную во время копирования в 23:56. Это даёт независимую точку сравнения до критического окна.'
  },
  {
    id: 'integrity',
    n: '03',
    label: 'Целостность данных',
    title: 'Текущий файл совпадает с контрольной копией',
    text: 'Хэш, длительность потока и последовательность кадров совпадают с данными, сохранёнными Ильёй до нападения. Следов позднего монтажа не обнаружено.'
  }
];

const EMPTY: Act4State = {
  search: [],
  card: [],
  finalAnswer: null,
  wrongAnswers: [],
  complete: false,
  startedAt: null,
  completedAt: null
};

function readState(): Act4State {
  try {
    const raw = JSON.parse(localStorage.getItem(ACT4_STORAGE_KEY) ?? '{}') as Partial<Act4State>;
    return {
      ...EMPTY,
      ...raw,
      search: Array.isArray(raw.search) ? raw.search : [],
      card: Array.isArray(raw.card) ? raw.card : [],
      wrongAnswers: Array.isArray(raw.wrongAnswers) ? raw.wrongAnswers : []
    };
  } catch {
    return EMPTY;
  }
}

function unique(list: string[], id: string): string[] {
  return list.includes(id) ? list : [...list, id];
}

function saveState(next: Act4State, source: string): void {
  localStorage.setItem(ACT4_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('dbr:act4-updated', { detail: { source, complete: next.complete } }));
  refreshInvestigationState(source);
}

function allSelected(selected: string[], points: Point[]): boolean {
  return points.every((point) => selected.includes(point.id));
}

function Shell({ id, title, summary, onClose, children }: {
  id: 'E010' | 'E011';
  title: string;
  summary: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return createPortal(
    <div className="premium-modal-backdrop act4-v2-backdrop" onMouseDown={onClose}>
      <section className={`premium-modal evidence-modal-premium act4-v2-modal evidence-${id.toLowerCase()}`} onMouseDown={(event) => event.stopPropagation()}>
        <header className="premium-modal-header">
          <div>
            <p className="premium-kicker">{id === 'E010' ? 'Финальная операция' : 'Цифровая экспертиза'} · {id}</p>
            <h1>{title}</h1>
            <p>{summary}</p>
          </div>
          <button className="premium-icon-button close" onClick={onClose} aria-label="Закрыть">×</button>
        </header>
        <div className="premium-modal-body act4-v2-body">{children}</div>
        <footer className="premium-modal-footer">
          <span>Факты сохраняются автоматически; вывод нужно сформулировать отдельно</span>
          <button className="premium-cta compact" onClick={onClose}>Вернуться в штаб <span>→</span></button>
        </footer>
      </section>
    </div>,
    document.body
  );
}

function EvidenceRows({ points, selected, onSelect }: {
  points: Point[];
  selected: string[];
  onSelect: (id: string) => void;
}) {
  return <div className="act4-v2-rows">{points.map((point) => {
    const done = selected.includes(point.id);
    return <button key={point.id} type="button" className={done ? 'done' : ''} onClick={() => onSelect(point.id)}>
      <span>{done ? '✓' : point.n}</span>
      <div><strong>{point.label}</strong><small>{done ? point.title : 'Проверить'}</small></div>
    </button>;
  })}</div>;
}

function LatestFinding({ points, selected }: { points: Point[]; selected: string[] }) {
  const latest = [...selected].reverse().map((id) => points.find((point) => point.id === id)).find(Boolean);
  if (!latest) return <div className="act4-v2-finding"><strong>Начните с фактов</strong><p>Каждая точка отвечает только на один вопрос. Не приписывайте ей личность исполнителя или мотив, которых она сама не устанавливает.</p></div>;
  return <div className="act4-v2-finding"><p className="premium-kicker">Зафиксированный факт</p><h3>{latest.title}</h3><p>{latest.text}</p></div>;
}

function Conclusion({ children }: { children: React.ReactNode }) {
  return <section className="act4-v2-conclusion"><p className="premium-kicker">Проверка вывода</p>{children}</section>;
}

export function Act4EvidenceV2() {
  const [active, setActive] = useState<ActiveEvidence>(null);
  const [state, setState] = useState(readState);
  const [feedback, setFeedback] = useState('');
  const [clipViewed, setClipViewed] = useState(false);

  const searchFactsDone = useMemo(() => allSelected(state.search, SEARCH), [state.search]);
  const e010Done = state.search.includes(E010_CONCLUSION);
  const labChecksDone = useMemo(() => allSelected(state.card, LAB), [state.card]);
  const e011Done = state.card.includes(E011_CONCLUSION);

  useEffect(() => {
    const sync = () => setState(readState());
    window.addEventListener('dbr:act4-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('dbr:act4-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    const intercept = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const card = target?.closest<HTMLElement>('[data-evidence-id]');
      const id = card?.dataset.evidenceId;
      if (id !== 'E010' && id !== 'E011') return;
      if (card instanceof HTMLButtonElement && card.disabled) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setFeedback('');
      setClipViewed(false);
      if (id === 'E011' && !readState().search.includes(E010_CONCLUSION)) {
        setActive('E010');
      } else {
        setActive(id);
      }
    };
    document.addEventListener('click', intercept, true);
    return () => document.removeEventListener('click', intercept, true);
  }, []);

  const update = (next: Act4State, source: string) => {
    setState(next);
    saveState(next, source);
  };

  const selectSearch = (id: string) => {
    update({
      ...state,
      startedAt: state.startedAt ?? new Date().toISOString(),
      search: unique(state.search, id)
    }, `act4-v2:search:${id}`);
    setFeedback('');
  };

  const chooseE010 = (id: string) => {
    if (id === 'bounded') {
      const next = { ...state, search: unique(state.search, E010_CONCLUSION) };
      update(next, 'act4-v2:e010-conclusion');
      setFeedback('Принято. E010 устанавливает умышленную изоляцию травмированного Ильи и неудавшийся поиск носителя, но не устанавливает личность человека только по комнате S-3.');
      return;
    }
    const messages: Record<string, string> = {
      kirill: 'Слишком сильный вывод: помещение S-3 само по себе не индивидуализирует Кирилла. Личность должна опираться на независимые доказательства из допроса и микроследа.',
      staged: 'Версия не объясняет внешнюю защёлку, травму и минимальную помощь, оказанную перед изоляцией.',
      murder: 'Илья найден живым. Эти факты не доказывают намерение убить его.'
    };
    setFeedback(messages[id] ?? 'Вывод выходит за пределы фактов E010.');
  };

  const selectLab = (id: string) => {
    update({ ...state, card: unique(state.card, id) }, `act4-v2:lab:${id}`);
    setFeedback('');
  };

  const chooseE011 = (id: string) => {
    if (id === 'bounded') {
      const next = {
        ...state,
        card: unique(unique(state.card, 'clip'), E011_CONCLUSION)
      };
      update(next, 'act4-v2:e011-conclusion');
      setFeedback('Принято. B-17 доказывает знание опасного состояния и решение продолжить работу; вместе с архивной цепочкой — последующее сокрытие значения нарушения. Умысел на гибель Антона не доказан.');
      return;
    }
    const messages: Record<string, string> = {
      murder: 'Запись не доказывает заранее подготовленное убийство Антона. Она фиксирует известный риск и решение не останавливать работу.',
      no_link: 'После проверки подлинности полный кадр индивидуализирует Кирилла как операционного руководителя, участвующего в споре об опасном участке.',
      denis: 'Целостность файла не подтверждает монтаж Дениса; его отдельная ложь касается исключения B-17 из общего цифрового архива.'
    };
    setFeedback(messages[id] ?? 'Этот вывод не соответствует доказательному пределу B-17.');
  };

  return <>
    {active === 'E010' && <Shell
      id="E010"
      title="Старая служебная комната S-3"
      summary="Зафиксируйте, что произошло с Ильёй после нападения. Не используйте помещение как автоматическое доказательство личности исполнителя."
      onClose={() => setActive(null)}
    >
      <div className="act4-v2-layout">
        <section className="act4-v2-scene" aria-label="Осмотр S-3">
          <div className="act4-v2-room-label"><span>S-3 · СЛУЖЕБНАЯ ЗОНА</span><strong>{SEARCH.filter((point) => state.search.includes(point.id)).length}/4</strong></div>
          <div className="act4-v2-scene-copy"><b>{state.search.includes('ilya') ? 'Илья обнаружен. Медики вызваны.' : 'Помещение фиксируется до изменения обстановки.'}</b><span>Отделяйте наблюдаемый факт от версии о том, кто его создал.</span></div>
          <EvidenceRows points={SEARCH} selected={state.search} onSelect={selectSearch} />
        </section>
        <aside className="act4-v2-panel">
          {!searchFactsDone ? <LatestFinding points={SEARCH} selected={state.search} /> : !e010Done ? <Conclusion>
            <h3>Какой вывод допустим только по обстановке S-3?</h3>
            <button onClick={() => chooseE010('kirill')}>Кирилл перенёс Илью сюда и запер дверь.</button>
            <button onClick={() => chooseE010('bounded')}>Илью после травмы намеренно изолировали; оставивший его здесь понимал, что он жив, и не получил спрятанную microSD.</button>
            <button onClick={() => chooseE010('murder')}>Помещение доказывает попытку убийства Ильи.</button>
            <button onClick={() => chooseE010('staged')}>Илья сам устроил сцену и запер себя.</button>
          </Conclusion> : <div className="act4-v2-finding success"><p className="premium-kicker">Вывод E010 зафиксирован</p><h3>Факт сокрытия отделён от личности исполнителя</h3><p>Теперь можно исследовать найденную microSD как самостоятельный источник.</p><button className="premium-cta compact" onClick={() => { setFeedback(''); setClipViewed(false); setActive('E011'); }}>Открыть E011 →</button></div>}
          {feedback && <div className={`act4-v2-feedback ${e010Done ? 'success' : ''}`} role="status">{feedback}</div>}
        </aside>
      </div>
    </Shell>}

    {active === 'E011' && <Shell
      id="E011"
      title="Карта памяти 314-17"
      summary="Сначала установите, что перед вами именно исходный B-17 и что файл не менялся после контрольной копии. Только затем оценивайте содержание."
      onClose={() => setActive(null)}
    >
      <div className="act4-v2-layout">
        <section className="act4-v2-scene act4-v2-lab" aria-label="Экспертиза карты 314-17">
          <div className="act4-v2-room-label"><span>DBR FORENSIC READER</span><strong>{LAB.filter((point) => state.card.includes(point.id)).length}/3</strong></div>
          <div className="act4-v2-card-object"><span>microSD</span><b>314-17</b><small>{labChecksDone ? 'PROVENANCE + INTEGRITY VERIFIED' : 'EVIDENTIARY STATUS PENDING'}</small></div>
          <EvidenceRows points={LAB} selected={state.card} onSelect={selectLab} />
          <button
            className="act4-v2-open-clip"
            disabled={!labChecksDone}
            onClick={() => { setClipViewed(true); setFeedback(''); }}
          >{labChecksDone ? 'Просмотреть полный B-17 →' : 'Содержание не оценивается до проверки носителя'}</button>
        </section>
        <aside className="act4-v2-panel">
          {!labChecksDone ? <LatestFinding points={LAB} selected={state.card} /> : !clipViewed && !e011Done ? <div className="act4-v2-finding"><p className="premium-kicker">Подлинность установлена</p><h3>Теперь содержание имеет доказательную опору</h3><p>Контрольная сумма существовала до нападения, текущий файл ей соответствует, а носитель связан с архивной цепочкой B-17.</p></div> : !e011Done ? <>
            <div className="act4-v2-clip">
              <p className="premium-kicker">B-17 · полный кадр 21:42</p>
              <h3>Спор у незакрытого участка ST3</h3>
              <p>Антон фиксирует снятое ограждение и требует остановить работу зоны. В полном кадре виден бейдж: <strong>«К. Бессонов · операционная часть»</strong>. Кирилл настаивает, чтобы мероприятие продолжили и материал об опасном участке не входил в общую публикацию.</p>
              <small>Ранний фрагмент E008 не содержал имени; индивидуализация появляется только в полном проверенном B-17.</small>
            </div>
            <Conclusion>
              <h3>Что эта запись позволяет утверждать о 2015 году?</h3>
              <button onClick={() => chooseE011('murder')}>Кирилл заранее спланировал гибель Антона.</button>
              <button onClick={() => chooseE011('bounded')}>Кирилл знал об опасном открытом участке и решил продолжить работу; вместе с архивной цепочкой это подтверждает последующее сокрытие значения нарушения, но не умысел на убийство.</button>
              <button onClick={() => chooseE011('no_link')}>Запись не связывает Кирилла с опасным участком.</button>
              <button onClick={() => chooseE011('denis')}>B-17 доказывает, что Денис смонтировал запись.</button>
            </Conclusion>
          </> : <div className="act4-v2-finding success"><p className="premium-kicker">Вывод E011 зафиксирован</p><h3>Историческая ответственность сформулирована в пределах доказательств</h3><p>B-17 больше не является готовым «ответом»: отдельно доказаны происхождение, неизменность, содержание и допустимый вывод.</p><button className="premium-cta compact" onClick={() => { setActive(null); document.querySelector<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button')?.blur(); }}>Вернуться к окончательному отчёту →</button></div>}
          {feedback && <div className={`act4-v2-feedback ${e011Done ? 'success' : ''}`} role="status">{feedback}</div>}
        </aside>
      </div>
    </Shell>}
  </>;
}
