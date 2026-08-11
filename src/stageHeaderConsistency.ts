import room314Source from './cases/room314.json';
import {
  refreshInvestigationState,
  subscribeInvestigationState,
  type InvestigationSnapshot,
  type RouteStage
} from './investigationState';

const STAGE_LABELS: Record<RouteStage, string> = {
  'act1-evidence': 'Акт I',
  'act1-report': 'Акт I',
  'act2-plan': 'Акт II',
  'act2-room': 'Акт II',
  'act3-archive': 'Акт III',
  'act3-identity': 'Акт III',
  'act3-interviews': 'Акт III',
  'act3-report': 'Акт III',
  'kirill-interrogation': 'Ключевой допрос',
  'act4-search': 'Акт IV',
  'act4-card': 'Акт IV',
  'act4-report': 'Акт IV',
  complete: 'Завершено'
};

const CURRENT_TASK: Record<RouteStage, { title: string; text: string }> = {
  'act1-evidence': {
    title: 'Как Илья исчез из запертого номера?',
    text: 'Исключите очевидные пути, проверьте цифровые следы и установите, мог ли кто-то попасть в номер незаметно.'
  },
  'act1-report': {
    title: 'Сформулируйте первый вывод',
    text: 'Первичные материалы собраны. Сопоставьте дверь, окно, камеру и телефон и сдайте промежуточный отчёт №1.'
  },
  'act2-plan': {
    title: 'Восстановите прежнюю планировку этажа',
    text: 'Архивный план должен показать, существовал ли другой путь между номерами 312 и 314.'
  },
  'act2-room': {
    title: 'Проверьте номер 312',
    text: 'Найдите физические подтверждения того, что скрытый маршрут использовали этой ночью.'
  },
  'act3-archive': {
    title: 'Восстановите историю карты 314-17',
    text: 'Сопоставьте архивные источники и выясните, какой оригинал скрывали и почему он важен для нападения.'
  },
  'act3-identity': {
    title: 'Установите настоящую личность Елены',
    text: 'Сопоставьте регистрационные сведения, архив 2015 года и переписку Ильи.'
  },
  'act3-interviews': {
    title: 'Вернитесь к Денису и Вере',
    text: 'Новые материалы открыли обязательные вопросы. Проверьте их прежние объяснения на новых фактах.'
  },
  'act3-report': {
    title: 'Сформулируйте второй вывод',
    text: 'Отделите ложь о прошлом от действий этой ночью и сдайте промежуточный отчёт №2.'
  },
  'kirill-interrogation': {
    title: 'Разрушьте алиби Кирилла',
    text: 'Зафиксируйте его версию и предъявляйте только найденные доказательства — они должны открыть тему прохода и старого конфликта.'
  },
  'act4-search': {
    title: 'Найдите Илью',
    text: 'Осмотрите служебную комнату, зафиксируйте состояние пострадавшего и восстановите действия нападавшего.'
  },
  'act4-card': {
    title: 'Проверьте карту 314-17',
    text: 'Подтвердите происхождение, целостность и содержание решающего носителя.'
  },
  'act4-report': {
    title: 'Сформулируйте окончательное обвинение',
    text: 'Свяжите мотив, скрытый маршрут, нападение и действия после него в одну доказательную цепочку.'
  },
  complete: {
    title: 'Дело раскрыто',
    text: 'Расследование завершено. Итоговый отчёт готов и остаётся доступен для повторного просмотра.'
  }
};

const checkpoint = room314Source.checkpoint;
let installed = false;
let latest: InvestigationSnapshot | null = null;

function setTone(element: HTMLElement, tone: 'secure' | 'live' | 'neutral'): void {
  element.classList.remove('secure', 'live', 'neutral', 'amber');
  element.classList.add(tone);
}

function applyDashboardState(state: InvestigationSnapshot): void {
  const dashboard = document.querySelector<HTMLElement>('.premium-dashboard');
  if (!dashboard) return;

  const task = CURRENT_TASK[state.derived.stage];
  const hero = dashboard.querySelector<HTMLElement>('.dashboard-hero');
  const title = hero?.querySelector<HTMLElement>('h1');
  const text = hero?.querySelector<HTMLElement>('p:not(.premium-kicker)');
  if (title) title.textContent = task.title;
  if (text) text.textContent = task.text;

  const actOne = state.derived.stage === 'act1-evidence' || state.derived.stage === 'act1-report';
  const meter = dashboard.querySelector<HTMLElement>('.dashboard-meter');
  if (meter) meter.hidden = !actOne;

  const objective = dashboard.querySelector<HTMLElement>('.objective-panel');
  const objectiveKicker = objective?.querySelector<HTMLElement>('.premium-kicker');
  const objectiveTitle = objective?.querySelector<HTMLElement>('h2');
  if (objectiveKicker) objectiveKicker.textContent = actOne ? 'Оперативная сводка' : 'Архив дела · Акт I';
  if (objectiveTitle) objectiveTitle.textContent = actOne ? 'Факты на данный момент' : 'Факты первого этапа';

  const report = dashboard.querySelector<HTMLElement>('.checkpoint-panel');
  const reportKicker = report?.querySelector<HTMLElement>('.premium-kicker');
  const reportPill = report?.querySelector<HTMLElement>('.premium-pill');
  if (reportKicker) reportKicker.textContent = actOne ? 'Логический узел' : 'Промежуточный отчёт №1';

  if (reportPill) {
    if (actOne) {
      const factCount = checkpoint.requiredFactIds.filter((id) => state.core.discoveredFactIds.includes(id)).length;
      reportPill.textContent = `${factCount}/${checkpoint.minimumFacts}`;
      setTone(reportPill, factCount >= checkpoint.minimumFacts ? 'secure' : 'neutral');
    } else {
      reportPill.textContent = 'Принят';
      setTone(reportPill, 'secure');
    }
  }

  dashboard.dataset.routeStage = state.derived.stage;
}

function applyStageHeader(state: InvestigationSnapshot): void {
  latest = state;

  const topbar = document.querySelector<HTMLElement>('.premium-topbar');
  if (topbar) {
    const stage = STAGE_LABELS[state.derived.stage];
    const caseMeta = topbar.querySelector<HTMLElement>('.topbar-case small');
    if (caseMeta) caseMeta.textContent = `Дело №001 · ${stage}`;

    const status = topbar.querySelector<HTMLElement>('.topbar-actions > .premium-pill');
    if (status) {
      const complete = state.derived.stage === 'complete';
      status.textContent = complete ? 'Расследование завершено' : 'Расследование идёт';
      setTone(status, complete ? 'secure' : 'live');
    }

    topbar.dataset.routeStage = state.derived.stage;
  }

  applyDashboardState(state);
}

function refreshAndApply(reason: string): void {
  applyStageHeader(refreshInvestigationState(reason));
}

export function installStageHeaderConsistency(): void {
  if (installed) return;
  installed = true;

  subscribeInvestigationState((state) => applyStageHeader(state));

  ['dbr:act2-updated', 'dbr:act3-updated', 'dbr:interrogation-updated', 'dbr:act4-updated', 'dbr:runtime-settled']
    .forEach((name) => window.addEventListener(name, () => refreshAndApply(`stage-header:${name}`)));

  window.addEventListener('pageshow', () => refreshAndApply('stage-header:pageshow'));

  if (latest) applyStageHeader(latest);
}
