import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ACT4_STORAGE_KEY } from './build';
import {
  refreshInvestigationState,
  subscribeInvestigationState,
  type InvestigationSnapshot
} from './investigationState';

type ChoiceGroup = 'actor' | 'actorEvidence' | 'route' | 'motive' | 'past' | 'routeEvidence' | 'motiveEvidence';
type Selections = Record<ChoiceGroup, string>;

type Option = { id: string; label: string; note?: string };
type Group = { id: ChoiceGroup; kicker: string; title: string; options: Option[] };

const E011_CONCLUSION = 'e011:historical-boundary';

const EMPTY: Selections = {
  actor: '',
  actorEvidence: '',
  route: '',
  motive: '',
  past: '',
  routeEvidence: '',
  motiveEvidence: ''
};

const CORRECT: Selections = {
  actor: 'kirill',
  actorEvidence: 'constellation',
  route: 'passage',
  motive: 'card',
  past: 'unsafe-route',
  routeEvidence: 'e006-e007',
  motiveEvidence: 'e008-e011'
};

const GROUPS: Group[] = [
  {
    id: 'actor',
    kicker: '1 · Исполнитель',
    title: 'Кто совершил действия этой ночью?',
    options: [
      { id: 'kirill', label: 'Кирилл Бессонов' },
      { id: 'denis', label: 'Денис Ракитин' },
      { id: 'vera', label: 'Вера Белова / Елена Ветрова' },
      { id: 'ilya', label: 'Илья Соколов — инсценировка' }
    ]
  },
  {
    id: 'actorEvidence',
    kicker: '2 · Индивидуализация исполнителя',
    title: 'Какая совокупность связывает именно Кирилла с 314 этой ночью?',
    options: [
      { id: 'constellation', label: 'Окно возможности C3 + действующий маршрут E006/E007 + отсутствие открытия M3 + STR-совпадение микроследа из 314' },
      { id: 'plan-only', label: 'Только старый план E006: проход начинается со стороны 312' },
      { id: 'str-only', label: 'Только STR-совпадение микроследа со стола в 314' },
      { id: 'motive-only', label: 'Только конфликт Кирилла из-за публикации B-17' }
    ]
  },
  {
    id: 'route',
    kicker: '3 · Способ',
    title: 'Как был преодолён «запертый номер»?',
    options: [
      { id: 'passage', label: 'Через прежний служебный проём между 312 и 314' },
      { id: 'door', label: 'Через главную дверь после 23:50' },
      { id: 'window', label: 'Через окно номера 314' },
      { id: 'systems', label: 'Замок и камера были временно отключены' }
    ]
  },
  {
    id: 'motive',
    kicker: '4 · Цель этой ночью',
    title: 'Почему оригинал B-17 создавал непосредственный конфликт?',
    options: [
      { id: 'card', label: 'Публикация проверенного оригинала могла раскрыть доказанную роль Кирилла в опасном решении 2015 года' },
      { id: 'planned-murder', label: 'Оригинал доказывал заранее подготовленное убийство Антона' },
      { id: 'money', label: 'На карте находились данные о спрятанных деньгах' },
      { id: 'staging', label: 'B-17 был реквизитом для инсценировки Ильи' }
    ]
  },
  {
    id: 'past',
    kicker: '5 · Предел ответственности за 2015 год',
    title: 'Что именно допустимо утверждать после E011?',
    options: [
      { id: 'unsafe-route', label: 'Кирилл знал об опасном открытом участке и решил продолжить работу; архивная цепочка подтверждает последующую минимизацию нарушения, но не умысел на гибель Антона' },
      { id: 'anton-murder', label: 'Кирилл заранее спланировал гибель Антона Белова' },
      { id: 'stole-original', label: 'Кирилл лично украл B-17 из семейного архива после гибели Антона' },
      { id: 'no-link', label: 'Проверенный B-17 вообще не связывает Кирилла с опасным участком' }
    ]
  },
  {
    id: 'routeEvidence',
    kicker: '6 · Обоснование маршрута',
    title: 'Какая пара материалов доказывает существование и использование пути?',
    options: [
      { id: 'e006-e007', label: 'E006 старый план + E007 свежие физические признаки использования' },
      { id: 'e003-e004', label: 'E003 журнал замка + E004 коридорная камера' },
      { id: 'e001-e005', label: 'E001 окно/комната + E005 телефон у лифта' },
      { id: 'e008-e009', label: 'E008 архив B-17 + E009 документы Веры' }
    ]
  },
  {
    id: 'motiveEvidence',
    kicker: '7 · Обоснование мотива',
    title: 'Какая связка устанавливает происхождение оригинала и его проверенное содержание?',
    options: [
      { id: 'e008-e011', label: 'E008 цепочка происхождения B-17 + E011 аутентифицированный оригинал и ограниченный исторический вывод' },
      { id: 'e003-e004', label: 'E003 журнал замка + E004 камера' },
      { id: 'e006-e007', label: 'E006 план + E007 панель и следы' },
      { id: 'e009-e005', label: 'E009 личность Веры + E005 телефон у лифта' }
    ]
  }
];

function allChosen(selections: Selections): boolean {
  return GROUPS.every((group) => Boolean(selections[group.id]));
}

function firstProblem(selections: Selections): string | null {
  if (selections.actor !== CORRECT.actor) {
    return 'Выбранный исполнитель не выдерживает одновременную проверку окна возможности, маршрута, альтернативного доступа и индивидуального микроследа.';
  }
  if (selections.actorEvidence !== CORRECT.actorEvidence) {
    return 'Одной улики недостаточно для индивидуализации. План доказывает топологию, STR — присутствие, мотив — причину, но только независимая совокупность закрывает вопрос «почему именно Кирилл». ';
  }
  if (selections.route !== CORRECT.route) {
    return 'Выбранный способ не объясняет одновременно непрерывный журнал главной двери, закрытое окно и физическую связь 312 ↔ 314.';
  }
  if (selections.routeEvidence !== CORRECT.routeEvidence) {
    return 'Эта пара материалов исключает часть версий, но не доказывает сам путь. Нужны независимые источники о конструкции и её использовании этой ночью.';
  }
  if (selections.motive !== CORRECT.motive) {
    return 'Эта цель не согласуется с происхождением оригинала B-17, временем контрольной копии и тем, что проверенная запись действительно ставила под угрозу.';
  }
  if (selections.motiveEvidence !== CORRECT.motiveEvidence) {
    return 'Эта связка не устанавливает одновременно происхождение носителя и доказательную силу его содержания. Отделите маршрут от происхождения и аутентификации B-17.';
  }
  if (selections.past !== CORRECT.past) {
    return 'Вывод выходит за доказательный предел E011. B-17 фиксирует знание опасного состояния и решение продолжить работу, но не доказывает заранее подготовленное убийство Антона.';
  }
  return null;
}

function readAct4(): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem(ACT4_STORAGE_KEY) ?? '{}') as Record<string, unknown>;
  } catch {
    return {};
  }
}

function e011BoundaryReady(): boolean {
  const raw = readAct4();
  const card = Array.isArray(raw.card) ? raw.card.filter((item): item is string => typeof item === 'string') : [];
  return card.includes(E011_CONCLUSION);
}

function finishCase(snapshot: InvestigationSnapshot, wrongAttemptId: string | null): void {
  const raw = readAct4();
  const wrongAnswers = Array.isArray(raw.wrongAnswers)
    ? raw.wrongAnswers.filter((item): item is string => typeof item === 'string')
    : snapshot.act4.wrongAnswers;
  const nextWrong = wrongAttemptId && !wrongAnswers.includes(wrongAttemptId)
    ? [...wrongAnswers, wrongAttemptId]
    : wrongAnswers;

  localStorage.setItem(ACT4_STORAGE_KEY, JSON.stringify({
    ...raw,
    finalAnswer: 'kirill_responsibility',
    wrongAnswers: nextWrong,
    complete: true,
    completedAt: new Date().toISOString()
  }));
  window.dispatchEvent(new CustomEvent('dbr:act4-updated', { detail: { complete: true, source: 'final-synthesis-v2' } }));
}

function recordWrongAttempt(snapshot: InvestigationSnapshot, attemptId: string): void {
  const raw = readAct4();
  const wrongAnswers = Array.isArray(raw.wrongAnswers)
    ? raw.wrongAnswers.filter((item): item is string => typeof item === 'string')
    : snapshot.act4.wrongAnswers;
  if (wrongAnswers.includes(attemptId)) return;
  localStorage.setItem(ACT4_STORAGE_KEY, JSON.stringify({ ...raw, wrongAnswers: [...wrongAnswers, attemptId] }));
  window.dispatchEvent(new CustomEvent('dbr:act4-updated', { detail: { source: 'final-synthesis-v2-wrong' } }));
}

function openExistingReport(): void {
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    const button = document.querySelector<HTMLButtonElement>('.react-final-panel button');
    button?.click();
  }));
}

export function FinalSynthesis() {
  const [snapshot, setSnapshot] = useState(() => refreshInvestigationState('final-synthesis:init'));
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [selections, setSelections] = useState<Selections>(EMPTY);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const active = e011BoundaryReady() && !snapshot.act4.complete;

  useEffect(() => subscribeInvestigationState((state) => setSnapshot(state)), []);

  useEffect(() => {
    const refreshTarget = () => window.requestAnimationFrame(() => {
      setTarget(document.querySelector<HTMLElement>('.premium-dashboard'));
    });
    refreshTarget();
    document.addEventListener('click', refreshTarget, true);
    window.addEventListener('dbr:act4-updated', refreshTarget);
    window.addEventListener('pageshow', refreshTarget);
    return () => {
      document.removeEventListener('click', refreshTarget, true);
      window.removeEventListener('dbr:act4-updated', refreshTarget);
      window.removeEventListener('pageshow', refreshTarget);
    };
  }, []);

  useEffect(() => {
    if (active) document.documentElement.dataset.finalSynthesis = 'active';
    else delete document.documentElement.dataset.finalSynthesis;
    return () => { delete document.documentElement.dataset.finalSynthesis; };
  }, [active]);

  const chosenCount = useMemo(() => GROUPS.filter((group) => selections[group.id]).length, [selections]);

  if (!active || !target) return null;

  const select = (group: ChoiceGroup, id: string) => {
    setSelections((current) => ({ ...current, [group]: id }));
    setFeedback(null);
  };

  const submit = () => {
    if (!allChosen(selections)) {
      setFeedback('Соберите все семь частей версии. Пропущенный элемент нельзя заменить общей догадкой.');
      return;
    }

    const problem = firstProblem(selections);
    if (problem) {
      const nextAttempt = attempt + 1;
      setAttempt(nextAttempt);
      setFeedback(problem);
      recordWrongAttempt(snapshot, `synthesis-v2-${nextAttempt}`);
      return;
    }

    finishCase(snapshot, null);
    delete document.documentElement.dataset.finalSynthesis;
    openExistingReport();
  };

  return createPortal(
    <section className="final-synthesis" aria-label="Сборка окончательного обвинения">
      <header className="final-synthesis-header">
        <div>
          <p>Окончательный отчёт · самостоятельная реконструкция</p>
          <h2>Соберите обвинение из доказанных частей</h2>
          <span>Отдельно установите исполнителя, доказательства его индивидуализации, способ, цель, предел исторической ответственности и источники двух ключевых связок.</span>
        </div>
        <div className="final-synthesis-progress"><b>{chosenCount}/7</b><small>элементов версии</small></div>
      </header>

      <div className="final-synthesis-groups">
        {GROUPS.map((group) => (
          <article className="final-synthesis-group" key={group.id}>
            <p>{group.kicker}</p>
            <h3>{group.title}</h3>
            <div className="final-synthesis-options">
              {group.options.map((option) => {
                const chosen = selections[group.id] === option.id;
                return <button
                  type="button"
                  key={option.id}
                  className={chosen ? 'chosen' : ''}
                  aria-pressed={chosen}
                  onClick={() => select(group.id, option.id)}
                ><span>{chosen ? '●' : '○'}</span><strong>{option.label}</strong></button>;
              })}
            </div>
          </article>
        ))}
      </div>

      {feedback && <div className="final-synthesis-feedback" role="status"><strong>Версия не выдерживает проверку</strong><p>{feedback}</p></div>}

      <footer className="final-synthesis-footer">
        <div><small>Ошибочные версии учитываются только в итоговой оценке</small><span>Можно менять любую часть и проверять цепочку повторно.</span></div>
        <button type="button" disabled={!allChosen(selections)} onClick={submit}>Проверить доказательную цепочку →</button>
      </footer>
    </section>,
    target
  );
}
