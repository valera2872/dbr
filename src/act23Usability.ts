import { ACT2_STORAGE_KEY, ACT3_STORAGE_KEY } from './build';

type Act2State = { plan?: string[]; room?: string[] };
type Act3State = { archive?: string[]; identity?: string[]; questions?: string[]; checkpointAnswer?: string | null; complete?: boolean };

function read<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) || 'null') as T | null; }
  catch { return null; }
}

function visible<T extends HTMLElement>(selector: string): T | null {
  return Array.from(document.querySelectorAll<T>(selector)).find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }) || null;
}

function closeModal(): void {
  visible<HTMLButtonElement>('.react-case-modal .premium-icon-button.close')?.click();
}

function clickTab(label: string): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.premium-sidebar button, .premium-mobile-nav button'));
  const button = buttons.find((candidate) => candidate.offsetParent !== null && candidate.textContent?.includes(label));
  button?.click();
}

function addGuide(modal: HTMLElement, key: string, title: string, text: string, action?: { label: string; run: () => void }): void {
  const body = modal.querySelector<HTMLElement>('.react-case-modal-body');
  if (!body) return;
  let guide = body.querySelector<HTMLElement>('.act23-player-guide');
  if (!guide) {
    guide = document.createElement('section');
    guide.className = 'act23-player-guide';
    body.prepend(guide);
  }
  if (guide.dataset.state === key) return;
  guide.dataset.state = key;
  guide.replaceChildren();
  const copy = document.createElement('div');
  const kicker = document.createElement('small');
  kicker.textContent = 'ЧТО ДЕЛАТЬ СЕЙЧАС';
  const heading = document.createElement('strong');
  heading.textContent = title;
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  copy.append(kicker, heading, paragraph);
  guide.append(copy);
  if (action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = action.label;
    button.addEventListener('click', action.run, { once: true });
    guide.append(button);
  }
}

function enhance(): void {
  const modal = visible<HTMLElement>('.react-case-modal');
  if (!modal) return;

  if (modal.classList.contains('evidence-e006')) {
    const state = read<Act2State>(ACT2_STORAGE_KEY);
    const count = state?.plan?.length || 0;
    addGuide(modal, `e006-${count}`, count >= 3 ? 'План прочитан' : `Проверьте 3 отметки на плане · ${count}/3`, count >= 3
      ? 'Вы установили, что между 312 и 314 сохранился старый технический проём. Следующий шаг — осмотреть номер 312.'
      : 'Нажмите три пронумерованные точки на самом плане или соответствующие строки справа. После третьей проверки откроется E007.',
      count >= 3 ? { label: 'Перейти к осмотру номера 312 →', run: () => { closeModal(); requestAnimationFrame(() => visible<HTMLButtonElement>('[data-evidence-id="E007"]')?.click()); } } : undefined);
  }

  if (modal.classList.contains('evidence-e007')) {
    const state = read<Act2State>(ACT2_STORAGE_KEY);
    const count = state?.room?.length || 0;
    addGuide(modal, `e007-${count}`, count >= 4 ? 'Осмотр завершён' : `Осмотрите 4 зоны номера 312 · ${count}/4`, count >= 4
      ? 'Панель, следы на ковре и волокна подтверждают: скрытым проходом пользовались этой ночью.'
      : 'Маркеры теперь собраны в стабильной панели поверх нижней части сцены. Нажмите каждую зону — результат сразу появится справа.',
      count >= 4 ? { label: 'Перейти к архиву E008 →', run: () => { closeModal(); requestAnimationFrame(() => visible<HTMLButtonElement>('[data-evidence-id="E008"]')?.click()); } } : undefined);
  }

  if (modal.classList.contains('evidence-e008')) {
    const state = read<Act3State>(ACT3_STORAGE_KEY);
    const count = state?.archive?.length || 0;
    addGuide(modal, `e008-${count}`, count >= 4 ? 'Цепочка B-17 восстановлена' : `Сверьте 4 архивных источника · ${count}/4`, count >= 4
      ? 'Вы подтвердили существование оригинала B-17 и связь карты 314-17 с Ильёй. Теперь установите, кто скрывается под именем Елены Ветровой.'
      : 'Здесь не нужно искать скрытые точки на картинке. Справа последовательно откройте: каталог оцифровки → контактный лист B → расшифровку диктофона → журнал носителей.',
      count >= 4 ? { label: 'Перейти к проверке личности E009 →', run: () => { closeModal(); requestAnimationFrame(() => visible<HTMLButtonElement>('[data-evidence-id="E009"]')?.click()); } } : undefined);
  }

  if (modal.classList.contains('evidence-e009')) {
    const state = read<Act3State>(ACT3_STORAGE_KEY) || {};
    const identity = state.identity?.length || 0;
    const questions = state.questions || [];
    const questionsDone = questions.includes('d-original') && questions.includes('v-name');

    if (state.complete) {
      addGuide(modal, 'e009-complete', 'Акт III завершён', 'Промежуточный отчёт №2 принят. Теперь нужно вернуться к Кириллу и предъявить собранную доказательную цепочку.', {
        label: 'Закрыть E009 и перейти к Кириллу →',
        run: () => { closeModal(); requestAnimationFrame(() => clickTab('Люди')); }
      });
    } else if (identity < 3) {
      addGuide(modal, `e009-id-${identity}`, `Сопоставьте личность · ${identity}/3`, 'Нажмите три проверки в блоке сопоставления. Нужно доказать, что «Елена Ветрова» — это Вера Белова, сестра Антона.');
    } else if (!questionsDone) {
      const left = 2 - Number(questions.includes('d-original')) - Number(questions.includes('v-name'));
      addGuide(modal, `e009-q-${left}`, `Получите два объяснения · осталось ${left}`, 'Справа нажмите ответы Дениса и Веры. Только после обоих объяснений станет доступен промежуточный отчёт №2.');
    } else {
      addGuide(modal, `e009-report-${state.checkpointAnswer || 'none'}`, 'Сформулируйте вывод акта III', 'Ниже выберите версию для промежуточного отчёта №2. Ищите вывод, который разделяет причины лжи Дениса и Веры и не приписывает им нападение без доказательств.');
    }
  }
}

let scheduled = false;
function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    enhance();
  });
}

['dbr:runtime-settled', 'dbr:act2-updated', 'dbr:act3-updated', 'pageshow'].forEach((name) => window.addEventListener(name, schedule));
document.addEventListener('click', schedule, true);
schedule();
