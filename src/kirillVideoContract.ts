export type KirillReaction =
  | 'idle'
  | 'answer'
  | 'deflect'
  | 'skeptical'
  | 'look-away'
  | 'tense'
  | 'flinch'
  | 'confess';

export type KirillVideoScript = {
  id: string;
  filename: string;
  title: string;
  text: string;
  direction: string;
  reaction: KirillReaction;
  hasAudio: boolean;
  loop: boolean;
  recommendedSeconds: number;
};

export const KIRILL_VIDEO_SCRIPTS: KirillVideoScript[] = [
  {
    id: 'idle',
    filename: 'idle.webm',
    title: 'Ожидание вопроса',
    text: '',
    direction: 'Сидите спокойно, смотрите на следователя. Естественно моргните, один раз переведите взгляд, затем снова смотрите прямо. Не говорите.',
    reaction: 'idle',
    hasAudio: false,
    loop: true,
    recommendedSeconds: 10
  },
  {
    id: 'alibi-initial',
    filename: 'alibi-initial.webm',
    title: 'Алиби — первая версия',
    text: 'Нет. Я вошёл в 312-й и оставался там до утра. Камера это подтверждает.',
    direction: 'Отвечайте уверенно и без заметного напряжения. На слове «камера» коротко посмотрите прямо в объектив.',
    reaction: 'answer',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 9
  },
  {
    id: 'alibi-after-plan',
    filename: 'alibi-after-plan.webm',
    title: 'Алиби после предъявления плана',
    text: 'Через коридор — нет. Я уже сказал: камера не зафиксировала моего выхода.',
    direction: 'Сделайте короткую паузу после «через коридор». Подчеркните слово «коридор», но не показывайте испуга.',
    reaction: 'deflect',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 9
  },
  {
    id: 'passage-initial',
    filename: 'passage-initial.webm',
    title: 'Отрицание прохода',
    text: 'Никакого прохода нет. Современная планировка это подтверждает.',
    direction: 'Ответьте быстро, почти заранее подготовленной фразой. В конце слегка сожмите губы.',
    reaction: 'answer',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 8
  },
  {
    id: 'passage-after-plan',
    filename: 'passage-after-plan.webm',
    title: 'Проход после предъявления плана',
    text: 'Я видел старые схемы при реконструкции. Но проём должны были закрыть — пользоваться им было невозможно.',
    direction: 'Сначала признайте факт неохотно. Перед «но» опустите взгляд на секунду, затем снова соберитесь.',
    reaction: 'look-away',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 12
  },
  {
    id: 'anton-initial',
    filename: 'anton-initial.webm',
    title: 'Антон — отрицание связи',
    text: 'Мы почти не общались. Денис и Вера пытаются связать обычный несчастный случай с этой ночью.',
    direction: 'Говорите с холодным раздражением. Имена Дениса и Веры произнесите как попытку перевести внимание.',
    reaction: 'deflect',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 11
  },
  {
    id: 'anton-after-audio',
    filename: 'anton-after-audio.webm',
    title: 'Антон после записи',
    text: 'Он обвинял меня в нарушении регламента. Это был рабочий конфликт, а не причина его гибели.',
    direction: 'Сдерживайте раздражение. На последней фразе говорите медленнее и жёстче.',
    reaction: 'tense',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 11
  },
  {
    id: 'panel-before-plan',
    filename: 'panel-before-plan.webm',
    title: 'Панель предъявлена слишком рано',
    text: 'Старая панель могла быть плохо закреплена годами. Сначала докажите, что за ней вообще существовал проход.',
    direction: 'Перехватите инициативу. Во второй фразе спокойно бросьте вызов следователю.',
    reaction: 'skeptical',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 11
  },
  {
    id: 'trace-before-panel',
    filename: 'trace-before-panel.webm',
    title: 'След предъявлен без связки',
    text: 'Вы показываете отдельный след, но не связываете его с доступом из моего номера.',
    direction: 'Посмотрите на материал, затем на следователя. Говорите спокойно, будто нашли ошибку в обвинении.',
    reaction: 'skeptical',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 10
  },
  {
    id: 'audio-before-route',
    filename: 'audio-before-route.webm',
    title: 'Запись предъявлена без маршрута',
    text: 'Старая запись не доказывает, что я куда-либо ходил этой ночью.',
    direction: 'Коротко напрягитесь при виде записи, затем верните контроль и ответьте сухо.',
    reaction: 'flinch',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 8
  },
  {
    id: 'evidence-plan',
    filename: 'evidence-plan.webm',
    title: 'Признание знания плана',
    text: 'Да, видел схему во время реконструкции. Но по акту проём закрыли. Моё алиби от этого не меняется.',
    direction: 'Сделайте паузу перед первым «да». Затем говорите официально, будто цитируете документы.',
    reaction: 'tense',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 12
  },
  {
    id: 'evidence-panel',
    filename: 'evidence-panel.webm',
    title: 'Свежие винты',
    text: 'Я заметил, что она отходит, уже утром. Возможно, персонал проверял коммуникации.',
    direction: 'Не смотрите прямо первые две секунды. Версию про персонал придумайте будто на ходу.',
    reaction: 'look-away',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 10
  },
  {
    id: 'evidence-tracks',
    filename: 'evidence-tracks.webm',
    title: 'Совпадающие следы',
    text: 'Совпадающая ширина ещё не устанавливает время. Эти вещи могли передвигать раньше.',
    direction: 'Внимательно изучите улику. Ответьте после заметной паузы, уже менее уверенно.',
    reaction: 'look-away',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 10
  },
  {
    id: 'evidence-fibres',
    filename: 'evidence-fibres.webm',
    title: 'Волокна у проёма',
    text: 'В отеле десятки тёмных курток. Вы не доказали, что волокна принадлежат мне.',
    direction: 'На мгновение замрите. Первую фразу скажите быстрее обычного, вторую — уже собравшись.',
    reaction: 'flinch',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 10
  },
  {
    id: 'evidence-audio',
    filename: 'evidence-audio.webm',
    title: 'Запись разговора Антона',
    text: 'Хорошо. Я отвечал за площадку и знал об этом маршруте. Но это не означает, что я причастен к его гибели или исчезновению Ильи.',
    direction: 'После «хорошо» выдержите длинную паузу. Признание произнесите тихо, затем снова начните защищаться.',
    reaction: 'tense',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 15
  },
  {
    id: 'evidence-card',
    filename: 'evidence-card.webm',
    title: 'Карта 314-17',
    text: 'Именно за этим Илья всех собрал. Но карту искал не только я — Денис скрывал её существование, а Вера приехала под чужой фамилией.',
    direction: 'Начните с признания, затем попытайтесь распределить подозрение между другими участниками.',
    reaction: 'deflect',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 14
  },
  {
    id: 'wrong-conclusion',
    filename: 'wrong-conclusion.webm',
    title: 'Ошибочный вывод следователя',
    text: 'Это предположение. Ни один из предъявленных материалов не подтверждает такую связь.',
    direction: 'Почувствуйте облегчение: следователь ошибся. Ответьте спокойно и чуть увереннее, чем до этого.',
    reaction: 'skeptical',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 9
  },
  {
    id: 'confession',
    filename: 'confession.webm',
    title: 'Разрушение алиби',
    text: 'Я вошёл в 314-й после сообщения. Хотел забрать карту и заставить Илью отказаться от публикации. Он ударился во время борьбы. Я перенёс его через проход в старую служебную комнату. Он был жив.',
    direction: 'Сначала долго молчите. Говорите тихо, с паузами между фактами. Не играйте истерику: человек понимает, что версия окончательно разрушена.',
    reaction: 'confess',
    hasAudio: true,
    loop: false,
    recommendedSeconds: 24
  }
];

export const KIRILL_SCRIPT_BY_ID = new Map(
  KIRILL_VIDEO_SCRIPTS.map((script) => [script.id, script])
);

export function findKirillScriptByText(text: string): KirillVideoScript | undefined {
  const normalized = text.trim();
  return KIRILL_VIDEO_SCRIPTS.find((script) => script.text === normalized);
}
