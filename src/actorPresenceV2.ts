import { ACT3_STORAGE_KEY } from './build';
import { refreshInvestigationState } from './investigationState';

export {};

type Act3State = {
  archive?: string[];
  identity?: string[];
  questions?: string[];
  checkpointAnswer?: string | null;
  complete?: boolean;
};

const DESK_SAMPLED = 'v2:desk-sampled';
const INJURY_OBSERVED = 'actor:k:injury-observed';
const COMPARISON_REQUESTED = 'actor:k:comparison-requested';
const PRESENCE_PROVEN = 'actor:k:presence-proven';

let installed = false;
let scheduled = false;
let localFeedback = '';

function readState(): Act3State {
  try {
    return JSON.parse(localStorage.getItem(ACT3_STORAGE_KEY) ?? '{}') as Act3State;
  } catch {
    return {};
  }
}

function questions(): string[] {
  const value = readState().questions;
  return Array.isArray(value) ? Array.from(new Set(value.filter((item): item is string => typeof item === 'string'))) : [];
}

function has(marker: string): boolean {
  return questions().includes(marker);
}

function writeMarker(marker: string): void {
  const current = readState();
  const nextQuestions = has(marker) ? questions() : [...questions(), marker];
  localStorage.setItem(ACT3_STORAGE_KEY, JSON.stringify({ ...current, questions: nextQuestions }));
  window.dispatchEvent(new CustomEvent('dbr:act3-updated', { detail: { source: 'actor-presence-v2', marker } }));
  refreshInvestigationState(`actor-presence-v2:${marker}`);
  localFeedback = '';
  schedule();
}

function kirillCard(): HTMLElement | undefined {
  return Array.from(document.querySelectorAll<HTMLElement>('.premium-person-card'))
    .find((card) => card.textContent?.includes('Кирилл Бессонов'));
}

function decorateCard(): void {
  const card = kirillCard();
  if (!card) return;

  let clue = card.querySelector<HTMLElement>('.actor-presence-card-clue');
  if (!clue) {
    clue = document.createElement('span');
    clue.className = 'actor-presence-card-clue';
    card.append(clue);
  }

  clue.classList.toggle('proven', has(PRESENCE_PROVEN));
  clue.innerHTML = has(PRESENCE_PROVEN)
    ? '<b>✓</b><span>Присутствие в 314 доказано</span>'
    : '<b>+</b><span>На правой ладони свежая повязка</span>';
}

function observationMarkup(): string {
  const observed = has(INJURY_OBSERVED);
  const sampled = has(DESK_SAMPLED);
  const requested = has(COMPARISON_REQUESTED);
  const proven = has(PRESENCE_PROVEN);

  if (proven) {
    return `
      <section class="actor-presence-v2 proven" data-actor-presence-v2="proven">
        <div class="actor-presence-head">
          <div class="actor-presence-hand" aria-hidden="true"><i></i><i></i><i></i></div>
          <div><small>K-02 · индивидуализация</small><strong>Кирилл физически был в 314</strong><p>Сравнительный STR-профиль связывает его с биологическим микроследом со стола. Это доказывает присутствие, но само по себе ещё не доказывает нападение или путь входа.</p></div>
        </div>
        <div class="actor-presence-proof"><span>16/16 STR</span><b>совпадение профиля</b><em>отдельный факт, не вывод о виновности</em></div>
      </section>`;
  }

  return `
    <section class="actor-presence-v2" data-actor-presence-v2="working">
      <div class="actor-presence-head">
        <div class="actor-presence-hand" aria-hidden="true"><i></i><i></i><i></i></div>
        <div>
          <small>Наблюдение · Кирилл</small>
          <strong>Свежая повязка на правой ладони</strong>
          <p>${observed
            ? 'После фиксации повреждения Кирилл говорит: «Порезался о край стакана у себя в номере. В 314-й я не заходил». Повреждение создаёт основание для проверки, но ничего не доказывает само.'
            : 'Повязка заметна при разговоре. Игра не связывает её с уликами автоматически.'}</p>
        </div>
      </div>

      ${!observed ? '<button type="button" class="actor-presence-primary" data-actor-presence-action="observe">Зафиксировать повреждение</button>' : ''}

      ${observed && !requested ? `
        <div class="actor-presence-question">
          <small>Как проверить значение наблюдения?</small>
          <button type="button" data-actor-presence-action="camera">Сверить повязку с коридорной камерой</button>
          <button type="button" data-actor-presence-action="pharmacy">Проверить, где Кирилл взял бинт</button>
          <button type="button" class="candidate" data-actor-presence-action="compare" ${sampled ? '' : 'disabled'}>Сравнить с биологическим микроследом из 314</button>
          ${!sampled ? '<p class="actor-presence-missing">Сравнение невозможно: целевой микрослед из затёртой зоны стола ещё не сохранён.</p>' : ''}
        </div>` : ''}

      ${requested ? `
        <div class="actor-presence-lab">
          <header><span>LAB / TRACE 314-D</span><b>Сравнительное заключение</b></header>
          <dl>
            <div><dt>Материал со стола</dt><dd>человеческий биологический микрослед</dd></div>
            <div><dt>Контрольный образец</dt><dd>Кирилл Бессонов · процессуальный сравнительный образец</dd></div>
            <div><dt>STR-профиль</dt><dd>16 из 16 исследованных локусов совпадают</dd></div>
            <div><dt>Смесь</dt><dd>признаков смешанного профиля нет</dd></div>
          </dl>
          <p>Экспертиза отвечает только на вопрос об источнике микроследа. Она не устанавливает механизм нападения и не выбирает маршрут за игрока.</p>
        </div>
        <div class="actor-presence-conclusion">
          <small>Какой вывод допустим?</small>
          <button type="button" data-actor-presence-action="overclaim-attack">Кирилл напал на Илью</button>
          <button type="button" data-actor-presence-action="overclaim-route">Кирилл точно использовал V314</button>
          <button type="button" class="candidate" data-actor-presence-action="presence">Кирилл физически контактировал со столом в 314</button>
        </div>` : ''}

      ${localFeedback ? `<div class="actor-presence-feedback">${localFeedback}</div>` : ''}
    </section>`;
}

function decorateInterrogation(): void {
  const shell = document.querySelector<HTMLElement>('.interrogation-shell');
  const control = shell?.querySelector<HTMLElement>('.interrogation-control');
  if (!shell || !control) return;

  shell.querySelector('.actor-presence-v2')?.remove();
  const wrapper = document.createElement('div');
  wrapper.innerHTML = observationMarkup();
  const panel = wrapper.firstElementChild as HTMLElement | null;
  if (!panel) return;

  control.insertAdjacentElement('afterbegin', panel);
}

function decorateFactList(): void {
  if (!has(PRESENCE_PROVEN)) return;
  const list = document.querySelector<HTMLElement>('.premium-fact-list');
  if (!list || list.querySelector('.actor-presence-fact')) return;

  const item = document.createElement('li');
  item.className = 'actor-presence-fact';
  item.innerHTML = '<span>K-02</span><p>Сравнительный профиль связывает Кирилла с биологическим микроследом со стола номера 314. Его физическое присутствие в комнате доказано независимо от маршрута.</p>';
  list.append(item);
}

function apply(): void {
  scheduled = false;
  decorateCard();
  decorateInterrogation();
  decorateFactList();
}

function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => window.requestAnimationFrame(apply));
}

function handleAction(action: string): void {
  if (action === 'observe') {
    writeMarker(INJURY_OBSERVED);
    return;
  }

  if (action === 'camera') {
    localFeedback = 'Камера не показывает ладонь и не видит двери 312–314 полностью. Такая проверка не связывает повреждение с номером 314.';
    schedule();
    return;
  }

  if (action === 'pharmacy') {
    localFeedback = 'Источник бинта может объяснить повязку, но не отвечает, оставлял ли Кирилл след в 314.';
    schedule();
    return;
  }

  if (action === 'compare') {
    if (!has(DESK_SAMPLED)) {
      localFeedback = 'Для сравнения сначала нужен сохранённый материал с места события.';
      schedule();
      return;
    }
    writeMarker(COMPARISON_REQUESTED);
    return;
  }

  if (action === 'overclaim-attack') {
    localFeedback = 'Слишком сильный вывод: совпадение биологического профиля доказывает присутствие, но не действие против Ильи.';
    schedule();
    return;
  }

  if (action === 'overclaim-route') {
    localFeedback = 'Слишком сильный вывод: микрослед не показывает, каким путём человек попал в комнату.';
    schedule();
    return;
  }

  if (action === 'presence') {
    writeMarker(PRESENCE_PROVEN);
  }
}

function onWindowClick(event: Event): void {
  const target = event.target instanceof Element ? event.target : null;
  const action = target?.closest<HTMLElement>('[data-actor-presence-action]')?.dataset.actorPresenceAction;
  if (action) {
    event.preventDefault();
    event.stopPropagation();
    handleAction(action);
    return;
  }

  if (target?.closest('.premium-person-card, .interrogation-shell, .premium-sidebar, .premium-mobile-nav')) schedule();
}

export function installActorPresenceV2(): void {
  if (installed) return;
  installed = true;
  window.addEventListener('click', onWindowClick, true);
  window.addEventListener('dbr:act3-updated', schedule);
  window.addEventListener('dbr:interrogation-updated', schedule);
  window.addEventListener('dbr:runtime-settled', schedule);
  window.addEventListener('pageshow', schedule);
  schedule();
}
