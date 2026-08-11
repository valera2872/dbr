import { subscribeInvestigationState, type InvestigationSnapshot } from './investigationState';

let installed = false;
let latestState: InvestigationSnapshot | null = null;

function replaceButtonCopy(button: HTMLButtonElement, text: string): void {
  const visual = button.querySelector('b, svg');
  button.replaceChildren(document.createTextNode(`${text} `));
  if (visual) button.append(visual);
}

function applyFocusedOnboarding(): void {
  const onboarding = document.querySelector<HTMLElement>('.player-onboarding');
  if (!onboarding) return;

  onboarding.classList.add('focused-first-action');
  onboarding.setAttribute('aria-label', 'Ваше первое действие');

  const kicker = onboarding.querySelector<HTMLElement>('.player-onboarding-kicker');
  const title = onboarding.querySelector<HTMLElement>('h1');
  const lead = onboarding.querySelector<HTMLElement>('.player-onboarding-lead');
  const ruleTitle = onboarding.querySelector<HTMLElement>('.player-onboarding-rule strong');
  const ruleText = onboarding.querySelector<HTMLElement>('.player-onboarding-rule p');
  const noteTitle = onboarding.querySelector<HTMLElement>('.player-onboarding-note strong');
  const noteText = onboarding.querySelector<HTMLElement>('.player-onboarding-note span');
  const primary = onboarding.querySelector<HTMLButtonElement>('.player-onboarding-actions .player-guide-primary');
  const secondary = onboarding.querySelector<HTMLButtonElement>('.player-onboarding-actions .player-guide-secondary');

  if (kicker) kicker.textContent = 'Ваше первое действие';
  if (title) title.textContent = 'Осмотрите номер 314';
  if (lead) lead.textContent = 'Илья исчез из запертого гостиничного номера. Пока не нужно разбираться во всём штабе — начните только с места исчезновения.';
  if (ruleTitle) ruleTitle.textContent = 'Что делать на сцене';
  if (ruleText) ruleText.textContent = 'На фотографии будут отмечены четыре зоны. Нажимайте на них по очереди. Найденные наблюдения сохраняются автоматически — записывать ничего не нужно.';
  if (noteTitle) noteTitle.textContent = 'Что будет потом';
  if (noteText) noteText.textContent = 'Когда осмотр закончится, игра сама покажет следующее действие. Новые разделы можно осваивать по мере расследования, а не заранее.';
  if (primary) replaceButtonCopy(primary, 'Осмотреть номер 314');
  if (secondary) secondary.textContent = 'Открыть весь штаб без обучения';
}

function applyFinalPrologueCopy(): void {
  if (latestState?.core.phase !== 'prologue') return;

  const button = document.querySelector<HTMLButtonElement>('.premium-prologue-card .premium-cta');
  if (!button || !button.textContent?.includes('Открыть штаб')) return;

  const icon = button.querySelector('svg');
  button.replaceChildren(document.createTextNode('Перейти к первому действию '));
  if (icon) button.append(icon);
}

function apply(): void {
  applyFinalPrologueCopy();
  applyFocusedOnboarding();
}

function scheduleApply(): void {
  window.requestAnimationFrame(() => {
    apply();
    window.requestAnimationFrame(apply);
  });
}

export function installFocusedFirstAction(): void {
  if (installed) return;
  installed = true;

  subscribeInvestigationState((state) => {
    latestState = state;
    scheduleApply();
  });

  document.addEventListener('click', scheduleApply, true);
  window.addEventListener('pageshow', scheduleApply);
  scheduleApply();
}
