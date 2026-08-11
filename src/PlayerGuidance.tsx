import { useEffect, useMemo, useState } from 'react';
import {
  getInvestigationState,
  scheduleInvestigationRefresh,
  subscribeInvestigationState,
  type InvestigationSnapshot
} from './investigationState';

const ONBOARDING_KEY = 'dbr:player-guidance:onboarding:v1';

type GuideTab = 'Дело' | 'Материалы' | 'Люди';
type GuideTarget = {
  tab: GuideTab;
  selector?: string;
  text?: string;
  open?: boolean;
};

type GuideStep = {
  phase: string;
  objective: string;
  instruction: string;
  progress: string;
  why: string;
  action: string;
  target: GuideTarget;
};

const E001_HOTSPOTS = ['window', 'desk', 'bag', 'carpet'];

function countHotspots(state: InvestigationSnapshot, evidenceId: string, ids: string[]): number {
  return ids.filter((id) => state.core.inspectedHotspotIds.includes(`${evidenceId}:${id}`)).length;
}

function actOneStep(state: InvestigationSnapshot): GuideStep {
  const seen = state.core.seenEvidenceIds;
  const roomCount = countHotspots(state, 'E001', E001_HOTSPOTS);

  if (!seen.includes('E001') || roomCount < 4) {
    return {
      phase: 'Первый осмотр',
      objective: 'Понять, что произошло в запертом номере',
      instruction: 'Осмотрите четыре отмеченные зоны номера 314. Нажимайте на точки на фотографии или на названия зон справа. После каждой проверки счётчик изменится автоматически.',
      progress: `Осмотрено зон: ${roomCount}/4`,
      why: 'Сначала нужно отделить реальные физические следы от того, как исчезновение выглядит на первый взгляд.',
      action: roomCount ? 'Продолжить осмотр номера' : 'Начать с осмотра номера 314',
      target: { tab: 'Материалы', text: 'Осмотр номера 314', open: true }
    };
  }

  if (!seen.includes('E002')) {
    return {
      phase: 'Первичные материалы',
      objective: 'Восстановить последние известные действия Ильи',
      instruction: 'Прочитайте последнее сообщение Ильи и обратите внимание, кто и когда его получил. После изучения материала игра сама предложит следующий шаг.',
      progress: 'Номер осмотрен · следующий материал',
      why: 'Сообщение связывает исчезновение с участниками встречи и объясняет, почему ночь могла закончиться конфликтом.',
      action: 'Открыть последнее сообщение',
      target: { tab: 'Материалы', text: 'Последнее сообщение Ильи', open: true }
    };
  }

  if (!seen.includes('E003')) {
    return {
      phase: 'Проверка выхода',
      objective: 'Проверить, использовалась ли главная дверь',
      instruction: 'Изучите журнал электронного замка номера 314. Вам не нужно запоминать весь интерфейс: после завершения текущего действия нижняя панель обновится.',
      progress: 'Сообщение изучено · проверяем дверь',
      why: 'Прежде чем строить версии, нужно понять, мог ли Илья или другой человек пройти обычным путём.',
      action: 'Открыть журнал замка',
      target: { tab: 'Материалы', text: 'Журнал замка номера 314', open: true }
    };
  }

  if (state.core.puzzleAnswers.E004 !== '23:50') {
    return {
      phase: 'Проверка камеры',
      objective: 'Установить последнее подтверждённое появление Ильи',
      instruction: 'Просмотрите события коридорной камеры и выберите правильную временную отметку.',
      progress: state.core.puzzleAnswers.E004 ? 'Ответ пока неверен · попробуйте ещё раз' : 'Журнал проверен · нужна камера',
      why: 'Камера помогает отделить подтверждённые перемещения от слов участников.',
      action: 'Открыть коридорную камеру',
      target: { tab: 'Материалы', text: 'Коридорная камера', open: true }
    };
  }

  if (!seen.includes('E005')) {
    return {
      phase: 'Последний первичный след',
      objective: 'Понять, почему телефон оказался у служебного лифта',
      instruction: 'Изучите состояние телефона и последовательность последних действий устройства.',
      progress: 'Камера проверена · остался один первичный материал',
      why: 'Телефон может показать, был ли его путь случайным или кто-то пытался создать ложный след.',
      action: 'Открыть найденный телефон',
      target: { tab: 'Материалы', text: 'Телефон у служебного лифта', open: true }
    };
  }

  return {
    phase: 'Первый вывод',
    objective: 'Сопоставить найденные факты',
    instruction: 'Перейдите в раздел «Дело» и сформулируйте промежуточный вывод №1. Это не финальное обвинение.',
    progress: 'Первичные материалы собраны',
    why: 'Промежуточный отчёт проверяет, правильно ли вы поняли ограничения двери, окна и камеры, прежде чем откроется следующий слой дела.',
    action: 'Перейти к отчёту №1',
    target: { tab: 'Дело', selector: '.checkpoint-panel' }
  };
}

function deriveGuideStep(state: InvestigationSnapshot): GuideStep {
  if (!state.derived.act1Complete) return actOneStep(state);

  switch (state.derived.stage) {
    case 'act2-plan':
      return {
        phase: 'Скрытый маршрут',
        objective: 'Проверить, существовал ли другой путь между номерами 312 и 314',
        instruction: 'Изучите архивный план этажа и проверьте три отмеченных несоответствия.',
        progress: `Проверено отметок на плане: ${state.derived.planCount}/3`,
        why: 'Современная планировка может не совпадать с устройством здания до реконструкции.',
        action: 'Открыть архивный план',
        target: { tab: 'Материалы', selector: '[data-evidence-id="E006"]', text: 'Архивный план', open: true }
      };
    case 'act2-room':
      return {
        phase: 'Осмотр соседнего номера',
        objective: 'Подтвердить скрытый маршрут физическими следами',
        instruction: 'Осмотрите четыре контрольные зоны номера 312.',
        progress: `Проверено зон: ${state.derived.roomCount}/4`,
        why: 'Сам по себе старый план ещё не доказывает, что проход использовали этой ночью.',
        action: 'Продолжить осмотр номера 312',
        target: { tab: 'Материалы', selector: '[data-evidence-id="E007"]', text: 'Осмотр номера 312', open: true }
      };
    case 'act3-archive':
      return {
        phase: 'Архив',
        objective: 'Восстановить происхождение доказательства',
        instruction: 'Откройте четыре архивных источника справа. На изображении скрытых точек искать не нужно.',
        progress: `Сопоставлено источников: ${state.derived.archiveCount}/4`,
        why: 'Нужно понять, что именно сохранилось с событий одиннадцатилетней давности и кто имел к этому доступ.',
        action: 'Открыть архивные материалы',
        target: { tab: 'Материалы', selector: '[data-evidence-id="E008"]', text: 'Архив', open: true }
      };
    case 'act3-identity':
      return {
        phase: 'Проверка личности',
        objective: 'Установить, кем на самом деле является Елена',
        instruction: 'Сопоставьте три независимых признака личности.',
        progress: `Подтверждено совпадений: ${state.derived.identityCount}/3`,
        why: 'Ложь о личности важна для дела, но её ещё нужно отделить от непосредственного участия в исчезновении.',
        action: 'Продолжить проверку личности',
        target: { tab: 'Материалы', selector: '[data-evidence-id="E009"]', text: 'Проверка личности', open: true }
      };
    case 'act3-interviews':
      return {
        phase: 'Повторные показания',
        objective: 'Проверить объяснения Дениса и Веры после новых находок',
        instruction: 'Откройте раздел «Люди» и задайте открывшиеся обязательные вопросы Денису и Вере.',
        progress: `Получено новых объяснений: ${state.derived.act3QuestionCount}/2`,
        why: 'Новые материалы меняют смысл их прежних ответов. Сейчас важно уточнить именно открывшиеся противоречия.',
        action: 'Перейти к людям',
        target: { tab: 'Люди', selector: '.premium-people-grid' }
      };
    case 'act3-report':
      return {
        phase: 'Второй вывод',
        objective: 'Отделить ложь о прошлом от действий этой ночью',
        instruction: 'Сдайте промежуточный отчёт №2 в разделе «Дело».',
        progress: 'Архив и обязательные показания собраны',
        why: 'Не каждый человек, который лгал следствию, обязательно участвовал в нападении.',
        action: 'Перейти к отчёту №2',
        target: { tab: 'Дело', selector: '.act3-checkpoint-panel' }
      };
    case 'kirill-interrogation':
      return {
        phase: 'Ключевой допрос',
        objective: 'Проверить коридорное алиби Кирилла',
        instruction: 'Вернитесь к Кириллу. Сначала зафиксируйте его заявленное алиби. Затем не придумывайте новые вопросы: предъявляйте найденные материалы — именно они должны открыть тему прохода и старого конфликта.',
        progress: `Алиби: ${state.interrogation.asked.includes('alibi') ? 'зафиксировано' : 'не зафиксировано'} · предъявлено доказательств: ${state.interrogation.presented.length}`,
        why: 'Следователь не должен знать о скрытом проходе заранее. Эта гипотеза появляется только после архивного плана и подтверждается физическими следами.',
        action: 'Открыть допрос Кирилла',
        target: { tab: 'Люди', text: 'Кирилл Бессонов', open: true }
      };
    case 'act4-search':
      return {
        phase: 'Спасательная операция',
        objective: 'Найти Илью и зафиксировать состояние служебной комнаты',
        instruction: 'Осмотрите четыре зоны служебной комнаты.',
        progress: `Проверено зон: ${state.derived.searchCount}/4`,
        why: 'После разрушения алиби появляется основание проверить скрытую служебную зону.',
        action: 'Открыть служебную комнату',
        target: { tab: 'Материалы', selector: '[data-evidence-id="E010"]', text: 'Служебная комната', open: true }
      };
    case 'act4-card':
      return {
        phase: 'Решающее доказательство',
        objective: 'Проверить найденную карту 314-17',
        instruction: 'Выполните четыре проверки носителя и восстановленного материала.',
        progress: `Завершено проверок: ${state.derived.cardCount}/4`,
        why: 'Финальный вывод должен опираться не только на признание и маршрут, но и на проверяемое содержание носителя.',
        action: 'Открыть экспертизу карты',
        target: { tab: 'Материалы', selector: '[data-evidence-id="E011"]', text: 'Карта 314-17', open: true }
      };
    case 'act4-report':
      return {
        phase: 'Финальный вывод',
        objective: 'Сформулировать, что именно произошло этой ночью',
        instruction: 'Перейдите в «Дело» и выберите итоговую версию, которая объясняет нападение, сокрытие Ильи и мотив.',
        progress: 'Все обязательные материалы изучены',
        why: 'Финальный отчёт должен объяснять всю цепочку событий, а не только назвать виновного.',
        action: 'Открыть финальный отчёт',
        target: { tab: 'Дело', selector: '.act4-final-panel' }
      };
    case 'complete':
      return {
        phase: 'Дело закрыто',
        objective: 'Посмотреть итог расследования',
        instruction: 'Расследование завершено. Итоговый отчёт можно открыть повторно в разделе «Дело».',
        progress: '100% обязательного маршрута завершено',
        why: 'В итоговом отчёте собрана доказательная цепочка и разделена ответственность участников.',
        action: 'Открыть итог дела',
        target: { tab: 'Дело', selector: '.react-final-panel' }
      };
    default:
      return actOneStep(state);
  }
}

function isVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
}

function closeCurrentOverlay(): void {
  const candidates = Array.from(document.querySelectorAll<HTMLButtonElement>(
    '.premium-modal-footer .premium-cta, .premium-modal .premium-icon-button.close, .react-case-modal button, .interrogation-modal button'
  ));
  const close = candidates.find((button) => {
    if (!isVisible(button)) return false;
    const text = button.textContent ?? '';
    const label = button.getAttribute('aria-label') ?? '';
    return button.classList.contains('close') || text.includes('Вернуться в штаб') || label.includes('Закрыть');
  });
  close?.click();
}

function clickTab(label: GuideTab): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(
    '.premium-sidebar button, .premium-mobile-nav button'
  )).filter(isVisible);
  buttons.find((button) => button.textContent?.includes(label))?.click();
}

function findTarget(target: GuideTarget): HTMLElement | null {
  if (target.selector) {
    const bySelector = document.querySelector<HTMLElement>(target.selector);
    if (bySelector) return bySelector;
  }

  if (!target.text) return null;
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(
    '.premium-evidence-card, .react-evidence-card, .premium-person-card, .react-case-dashboard button, .premium-people-grid button'
  ));
  return candidates.find((element) => element.textContent?.includes(target.text ?? '')) ?? null;
}

function goToTarget(target: GuideTarget): void {
  closeCurrentOverlay();
  window.setTimeout(() => {
    clickTab(target.tab);
    window.setTimeout(() => {
      const element = findTarget(target);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element?.focus?.({ preventScroll: true });
      if (target.open && element instanceof HTMLButtonElement && !element.disabled) {
        element.click();
      }
    }, 220);
  }, 90);
}

function useInvestigationState(): InvestigationSnapshot {
  const [snapshot, setSnapshot] = useState(getInvestigationState());

  useEffect(() => subscribeInvestigationState((next) => setSnapshot(next)), []);
  useEffect(() => {
    const refresh = () => window.setTimeout(() => scheduleInvestigationRefresh('player-guidance-interaction'), 0);
    document.addEventListener('click', refresh, true);
    return () => document.removeEventListener('click', refresh, true);
  }, []);

  return snapshot;
}

export function PlayerGuidance() {
  const snapshot = useInvestigationState();
  const step = useMemo(() => deriveGuideStep(snapshot), [snapshot]);
  const [helpOpen, setHelpOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    if (snapshot.core.phase !== 'hq') {
      setOnboardingOpen(false);
      return;
    }
    const firstRun = snapshot.derived.coreEvidenceCount === 0
      && snapshot.core.inspectedHotspotIds.length === 0
      && localStorage.getItem(ONBOARDING_KEY) !== '1';
    if (firstRun) setOnboardingOpen(true);
  }, [snapshot.core.phase, snapshot.derived.coreEvidenceCount, snapshot.core.inspectedHotspotIds.length]);

  if (snapshot.core.phase !== 'hq') return null;

  const beginFirstAction = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setOnboardingOpen(false);
    goToTarget({ tab: 'Материалы', text: 'Осмотр номера 314', open: true });
  };

  const dismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setOnboardingOpen(false);
  };

  return <>
    <aside className="player-guide-floating" aria-label="Текущий шаг расследования">
      <div className="player-guide-floating-copy">
        <small>{step.phase}</small>
        <strong>{step.objective}</strong>
        <p>{step.instruction}</p>
        <span>{step.progress}</span>
      </div>
      <div className="player-guide-floating-actions">
        <button type="button" className="player-guide-next" onClick={() => goToTarget(step.target)} aria-label={`Следующий шаг: ${step.action}`}>
          <small>Следующий шаг</small><strong>{step.action}</strong><b aria-hidden="true">→</b>
        </button>
        <button type="button" className="player-guide-explain" onClick={() => setHelpOpen(true)}>Объяснить</button>
      </div>
    </aside>

    {helpOpen && <div className="player-guide-backdrop" onMouseDown={() => setHelpOpen(false)}>
      <section className="player-guide-panel" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Навигационная помощь">
        <header>
          <div><small>Навигационная помощь</small><h2>Что делать дальше</h2></div>
          <button type="button" className="player-guide-close" aria-label="Закрыть помощь" onClick={() => setHelpOpen(false)}>×</button>
        </header>
        <div className="player-guide-purpose">
          <span>Текущая цель</span>
          <strong>{step.objective}</strong>
          <p>{step.instruction}</p>
        </div>
        <div className="player-guide-progress"><span>Прогресс</span><strong>{step.progress}</strong><i><b style={{ width: `${snapshot.derived.percent}%` }}/></i></div>
        <div className="player-guide-why"><span>Зачем это сейчас</span><p>{step.why}</p></div>
        <button type="button" className="player-guide-primary" onClick={() => { setHelpOpen(false); goToTarget(step.target); }}>
          {step.action}<b aria-hidden="true">→</b>
        </button>
        <p className="player-guide-safe-note">Эта помощь объясняет только управление и следующий шаг. Она не раскрывает правильную детективную версию.</p>
      </section>
    </div>}

    {onboardingOpen && <div className="player-onboarding-backdrop">
      <section className="player-onboarding" role="dialog" aria-modal="true" aria-label="Как играть в ДБР">
        <p className="player-onboarding-kicker">Перед первым расследованием · около минуты</p>
        <h1>Вы — следователь. Интерфейс не должен быть загадкой.</h1>
        <p className="player-onboarding-lead">Илья исчез после ночной встречи в номере 314. Ваша задача — не угадывать виновного с первого экрана, а последовательно собирать факты, сверять показания и только затем делать выводы.</p>
        <div className="player-onboarding-rule">
          <strong>Главное правило игры</strong>
          <p>В каждый момент у вас есть одна текущая задача. Выполните её — и нижняя панель сама покажет следующее действие. Ничего искать по меню наугад не нужно.</p>
        </div>
        <div className="player-onboarding-grid">
          <article><span>01</span><div><strong>Материалы</strong><p>Осматривайте сцены, документы и цифровые следы. На интерактивных сценах нажимайте отмеченные зоны или их названия. Всё найденное сохраняется автоматически.</p></div></article>
          <article><span>02</span><div><strong>Люди</strong><p>Сверяйте показания с уже найденными фактами. Новые вопросы появляются только тогда, когда расследование дало для них основание.</p></div></article>
          <article><span>03</span><div><strong>Дело</strong><p>В ключевых точках формулируйте промежуточные выводы. Это не финальное обвинение, а проверка понимания фактов и переход к следующему этапу.</p></div></article>
        </div>
        <div className="player-onboarding-note"><strong>Не знаете, куда идти?</strong><span>Смотрите на блок «Следующий шаг» внизу экрана. Кнопка «Объяснить» расскажет, зачем это действие нужно, но не выдаст разгадку.</span></div>
        <div className="player-onboarding-actions">
          <button type="button" className="player-guide-primary" onClick={beginFirstAction}>Начать расследование: осмотреть номер 314 <b aria-hidden="true">→</b></button>
          <button type="button" className="player-guide-secondary" onClick={dismissOnboarding}>Я разберусь сам</button>
        </div>
      </section>
    </div>}
  </>;
}
