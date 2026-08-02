import { useEffect, useMemo, useRef, useState } from 'react';
import room314Source from './cases/room314.json';

type TabId = 'case' | 'evidence' | 'people' | 'versions' | 'timeline';
type Phase = 'home' | 'prologue' | 'hq';
type EvidenceMode = 'standard' | 'scene' | 'camera';
type SfxKind = 'open' | 'fact' | 'success' | 'tap';

interface Hotspot {
  id: string;
  label: string;
  title: string;
  description: string;
  createsFactIds: string[];
}

interface CameraOption {
  id: string;
  label: string;
  correct?: boolean;
}

interface CameraQuestion {
  prompt: string;
  options: CameraOption[];
  successFactIds: string[];
  successText: string;
  failureText: string;
}

interface Evidence {
  id: string;
  title: string;
  category: string;
  summary: string;
  details: string[];
  quote?: string;
  requiresSeen?: string[];
  createsFactIds: string[];
  mode?: EvidenceMode;
  hotspots?: Hotspot[];
  cameraEvents?: Array<{ time: string; text: string }>;
  cameraQuestion?: CameraQuestion;
}

interface DialogueTopic {
  id: string;
  question: string;
  answer: string;
  requiresSeen?: string[];
  createsFactIds?: string[];
}

interface Character {
  id: string;
  name: string;
  room: string;
  role: string;
  statement: string;
  topics: DialogueTopic[];
}

interface CheckpointOption {
  id: string;
  text: string;
  correct?: boolean;
  feedback: string;
}

interface CaseData {
  manifest: {
    caseId: string;
    version: string;
    series: string;
    caseNumber: number;
    title: string;
    subtitle: string;
    ageRating: string;
    estimatedMinutes: number;
    players: string;
  };
  prologue: Array<{
    eyebrow: string;
    title: string;
    body: string;
    quote?: string;
  }>;
  evidence: Evidence[];
  facts: Record<string, string>;
  characters: Character[];
  hypotheses: string[];
  timeline: Array<{ time: string; text: string; requiresSeen?: string[] }>;
  checkpoint: {
    title: string;
    prompt: string;
    requiredFactIds: string[];
    minimumFacts: number;
    successFactIds: string[];
    successText: string;
    options: CheckpointOption[];
  };
}

interface Progress {
  phase: Phase;
  prologueIndex: number;
  activeTab: TabId;
  seenEvidenceIds: string[];
  flaggedEvidenceIds: string[];
  inspectedHotspotIds: string[];
  seenDialogueTopicIds: string[];
  discoveredFactIds: string[];
  selectedHypotheses: string[];
  puzzleAnswers: Record<string, string>;
  checkpointAnswerId: string | null;
  act1Complete: boolean;
  startedAt: string | null;
}

const caseData = room314Source as CaseData;
const STORAGE_KEY = `dbr:${caseData.manifest.caseId}:${caseData.manifest.version}`;
const MUTE_KEY = 'dbr:muted';

const ROOM_IMAGE = 'https://images.unsplash.com/photo-1702675301342-cac2dc3ef15a?auto=format&fit=crop&w=1800&q=86';
const HERO_IMAGE = 'https://images.unsplash.com/photo-1702675301342-cac2dc3ef15a?auto=format&fit=crop&w=2200&q=86';
const CAMERA_IMAGE = 'https://images.unsplash.com/photo-1706801582308-d4eda88de11f?auto=format&fit=crop&w=1600&q=82';

const PORTRAITS: Record<string, string> = {
  kirill: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=84',
  marina: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=84',
  denis: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=84',
  vera: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=84',
  ilya: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=84'
};

const CHARACTER_META: Record<string, { mood: string; signal: string; note: string }> = {
  kirill: { mood: 'Спокоен', signal: 'Версия выстроена заранее', note: 'Отвечает коротко и уверенно. Избегает деталей о номере 314.' },
  marina: { mood: 'Сдержанна', signal: 'Защищает отель', note: 'Опирается на регламенты и системные журналы.' },
  denis: { mood: 'Нервничает', signal: 'Уходит в технические детали', note: 'Многословен, но уклоняется от вопроса об оригинальном архиве.' },
  vera: { mood: 'Закрыта', signal: 'Скрывает цель приезда', note: 'Наблюдает за остальными и не доверяет расследованию.' }
};

const EVIDENCE_ART: Record<string, { image?: string; icon: string; tone: string }> = {
  E001: { image: ROOM_IMAGE, icon: '⌖', tone: 'cyan' },
  E002: { icon: '◌', tone: 'violet' },
  E003: { icon: '▦', tone: 'amber' },
  E004: { image: CAMERA_IMAGE, icon: '◉', tone: 'red' },
  E005: { icon: '▯', tone: 'cyan' }
};

const ROOM_SPOTS: Record<string, { x: string; y: string; index: string }> = {
  window: { x: '54%', y: '41%', index: '01' },
  desk: { x: '76%', y: '61%', index: '02' },
  bag: { x: '67%', y: '73%', index: '03' },
  carpet: { x: '48%', y: '81%', index: '04' }
};

const initialProgress: Progress = {
  phase: 'home',
  prologueIndex: 0,
  activeTab: 'case',
  seenEvidenceIds: [],
  flaggedEvidenceIds: [],
  inspectedHotspotIds: [],
  seenDialogueTopicIds: [],
  discoveredFactIds: [],
  selectedHypotheses: [],
  puzzleAnswers: {},
  checkpointAnswerId: null,
  act1Complete: false,
  startedAt: null
};

function addUnique(current: string[], additions: string[]) {
  return Array.from(new Set([...current, ...additions]));
}

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProgress;
    const saved = JSON.parse(raw) as Partial<Progress>;
    return {
      ...initialProgress,
      ...saved,
      puzzleAnswers: saved.puzzleAnswers ?? {},
      inspectedHotspotIds: saved.inspectedHotspotIds ?? [],
      seenDialogueTopicIds: saved.seenDialogueTopicIds ?? []
    };
  } catch {
    return initialProgress;
  }
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, JSX.Element> = {
    case: <><path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
    evidence: <><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4M9 11h4M11 9v4"/></>,
    people: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3.5 20c.5-4 2.5-6 5.5-6s5 2 5.5 6M14 15c3 0 5 1.7 5.5 5"/></>,
    versions: <><circle cx="7" cy="7" r="2"/><circle cx="17" cy="7" r="2"/><circle cx="12" cy="17" r="2"/><path d="m8.7 8.2 2.2 6.6M15.3 8.2l-2.2 6.6M9 7h6"/></>,
    timeline: <><path d="M5 4v16M5 7h6M5 12h10M5 17h7"/><circle cx="5" cy="7" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="5" cy="17" r="1.5"/></>,
    sound: <><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16 9c1.4 1.4 1.4 4.6 0 6M19 6c3 3 3 9 0 12"/></>,
    mute: <><path d="M4 10v4h4l5 4V6L8 10z"/><path d="m17 10 5 5m0-5-5 5"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    star: <><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/></>
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function StatusPill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: string }) {
  return <span className={`premium-pill ${tone}`}>{children}</span>;
}

export default function PremiumApp() {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [muted, setMuted] = useState(() => localStorage.getItem(MUTE_KEY) === '1');
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  }, [muted]);

  const selectedEvidence = useMemo(
    () => caseData.evidence.find((item) => item.id === selectedEvidenceId) ?? null,
    [selectedEvidenceId]
  );
  const selectedCharacter = useMemo(
    () => caseData.characters.find((item) => item.id === selectedCharacterId) ?? null,
    [selectedCharacterId]
  );
  const unlockedEvidenceIds = useMemo(
    () => caseData.evidence.filter((item) => (item.requiresSeen ?? []).every((id) => progress.seenEvidenceIds.includes(id))).map((item) => item.id),
    [progress.seenEvidenceIds]
  );
  const visibleTimeline = useMemo(
    () => caseData.timeline.filter((item) => (item.requiresSeen ?? []).every((id) => progress.seenEvidenceIds.includes(id))),
    [progress.seenEvidenceIds]
  );
  const checkpointFactCount = caseData.checkpoint.requiredFactIds.filter((id) => progress.discoveredFactIds.includes(id)).length;
  const checkpointReady = checkpointFactCount >= caseData.checkpoint.minimumFacts;
  const checkpointAnswer = caseData.checkpoint.options.find((option) => option.id === progress.checkpointAnswerId);

  function playSfx(kind: SfxKind) {
    if (muted) return;
    try {
      const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return;
      const context = audioContextRef.current ?? new AudioCtor();
      audioContextRef.current = context;
      const osc = context.createOscillator();
      const gain = context.createGain();
      const config: Record<SfxKind, { start: number; end: number; duration: number; volume: number }> = {
        tap: { start: 340, end: 300, duration: .08, volume: .025 },
        open: { start: 220, end: 420, duration: .18, volume: .035 },
        fact: { start: 420, end: 660, duration: .22, volume: .04 },
        success: { start: 480, end: 880, duration: .34, volume: .045 }
      };
      const item = config[kind];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(item.start, context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(item.end, context.currentTime + item.duration);
      gain.gain.setValueAtTime(item.volume, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + item.duration);
      osc.connect(gain).connect(context.destination);
      osc.start();
      osc.stop(context.currentTime + item.duration);
    } catch {
      // Sound is optional. The investigation remains fully usable without it.
    }
  }

  function startCase() {
    playSfx('open');
    setProgress({ ...initialProgress, phase: 'prologue', startedAt: new Date().toISOString() });
  }

  function nextPrologue() {
    playSfx('tap');
    if (progress.prologueIndex >= caseData.prologue.length - 1) {
      setProgress((current) => ({ ...current, phase: 'hq', activeTab: 'case' }));
      return;
    }
    setProgress((current) => ({ ...current, prologueIndex: current.prologueIndex + 1 }));
  }

  function openEvidence(evidence: Evidence) {
    if (!unlockedEvidenceIds.includes(evidence.id)) return;
    playSfx('open');
    setProgress((current) => ({
      ...current,
      seenEvidenceIds: addUnique(current.seenEvidenceIds, [evidence.id]),
      discoveredFactIds: addUnique(current.discoveredFactIds, evidence.createsFactIds)
    }));
    setSelectedEvidenceId(evidence.id);
  }

  function inspectHotspot(evidenceId: string, hotspot: Hotspot) {
    const key = `${evidenceId}:${hotspot.id}`;
    const isNew = !progress.inspectedHotspotIds.includes(key);
    if (isNew) playSfx('fact');
    setProgress((current) => ({
      ...current,
      inspectedHotspotIds: addUnique(current.inspectedHotspotIds, [key]),
      discoveredFactIds: addUnique(current.discoveredFactIds, hotspot.createsFactIds)
    }));
  }

  function answerCameraQuestion(evidence: Evidence, option: CameraOption) {
    if (!evidence.cameraQuestion) return;
    playSfx(option.correct ? 'success' : 'tap');
    setProgress((current) => ({
      ...current,
      puzzleAnswers: { ...current.puzzleAnswers, [evidence.id]: option.id },
      discoveredFactIds: option.correct
        ? addUnique(current.discoveredFactIds, evidence.cameraQuestion?.successFactIds ?? [])
        : current.discoveredFactIds
    }));
  }

  function askDialogueTopic(topic: DialogueTopic) {
    if (!(topic.requiresSeen ?? []).every((id) => progress.seenEvidenceIds.includes(id))) return;
    playSfx('tap');
    setProgress((current) => ({
      ...current,
      seenDialogueTopicIds: addUnique(current.seenDialogueTopicIds, [topic.id]),
      discoveredFactIds: addUnique(current.discoveredFactIds, topic.createsFactIds ?? [])
    }));
  }

  function submitCheckpoint(option: CheckpointOption) {
    playSfx(option.correct ? 'success' : 'tap');
    setProgress((current) => ({
      ...current,
      checkpointAnswerId: option.id,
      act1Complete: option.correct ? true : current.act1Complete,
      discoveredFactIds: option.correct
        ? addUnique(current.discoveredFactIds, caseData.checkpoint.successFactIds)
        : current.discoveredFactIds
    }));
  }

  function toggleFlag(evidenceId: string) {
    playSfx('tap');
    setProgress((current) => ({
      ...current,
      flaggedEvidenceIds: current.flaggedEvidenceIds.includes(evidenceId)
        ? current.flaggedEvidenceIds.filter((id) => id !== evidenceId)
        : [...current.flaggedEvidenceIds, evidenceId]
    }));
  }

  function toggleHypothesis(hypothesis: string) {
    playSfx('tap');
    setProgress((current) => ({
      ...current,
      selectedHypotheses: current.selectedHypotheses.includes(hypothesis)
        ? current.selectedHypotheses.filter((item) => item !== hypothesis)
        : [...current.selectedHypotheses, hypothesis]
    }));
  }

  function resetCase() {
    if (!window.confirm('Сбросить расследование и удалить сохранённый прогресс?')) return;
    localStorage.removeItem(STORAGE_KEY);
    setSelectedEvidenceId(null);
    setSelectedCharacterId(null);
    setProgress(initialProgress);
  }

  function setTab(tab: TabId) {
    playSfx('tap');
    setProgress((current) => ({ ...current, activeTab: tab }));
  }

  const nextAction = !progress.seenEvidenceIds.includes('E001')
    ? { title: 'Осмотреть номер 314', text: 'Начните с места исчезновения и проверьте четыре ключевые зоны.', tab: 'evidence' as TabId }
    : !progress.seenEvidenceIds.includes('E003')
      ? { title: 'Проверить журнал замка', text: 'Установите, открывалась ли главная дверь после возвращения Ильи.', tab: 'evidence' as TabId }
      : !progress.puzzleAnswers.E004
        ? { title: 'Изучить коридорную камеру', text: 'Найдите последнее подтверждённое появление Ильи.', tab: 'evidence' as TabId }
        : progress.seenDialogueTopicIds.length < 4
          ? { title: 'Сверить показания', text: 'У каждого участника есть собственная версия ночных событий.', tab: 'people' as TabId }
          : { title: 'Сформулировать промежуточный вывод', text: 'Сопоставьте дверь, окно, следы конфликта и телефон.', tab: 'case' as TabId };

  if (progress.phase === 'home') {
    return (
      <main className="premium-home" style={{ '--hero-image': `url(${HERO_IMAGE})` } as React.CSSProperties}>
        <div className="premium-home-shade" />
        <header className="premium-brandbar">
          <div className="premium-logo"><span>Д</span><span>Б</span><span>Р</span></div>
          <div><strong>Детективное бюро расследований</strong><small>Интерактивные дела</small></div>
          <StatusPill tone="live"><span className="live-dot"/> Дело открыто</StatusPill>
        </header>

        <section className="premium-hero-copy">
          <p className="premium-kicker">Дело №001 · закрытая локация</p>
          <h1>Номер <em>314</em></h1>
          <p className="premium-lead">Журналист исчез из запертого гостиничного номера. Его телефон найден у служебного лифта. Все участники встречи лгут.</p>
          <div className="premium-meta-row">
            <StatusPill>{caseData.manifest.ageRating}</StatusPill>
            <StatusPill>{caseData.manifest.players}</StatusPill>
            <StatusPill>≈ {caseData.manifest.estimatedMinutes} минут</StatusPill>
            <StatusPill tone="secure">Локальное сохранение</StatusPill>
          </div>
          <button className="premium-cta" onClick={startCase}>Принять дело <Icon name="arrow" /></button>
        </section>

        <aside className="premium-brief-card">
          <div className="brief-code">DBR / 001 / 314</div>
          <div className="brief-image"><img src={ROOM_IMAGE} alt="Номер 314" /></div>
          <div className="brief-grid">
            <div><small>Последний контакт</small><strong>00:17</strong></div>
            <div><small>Обнаружено</small><strong>07:14</strong></div>
            <div><small>Локация</small><strong>Северный склон</strong></div>
            <div><small>Статус</small><strong>Пропавший жив?</strong></div>
          </div>
        </aside>

        <footer className="premium-home-footer"><span>Прогресс сохраняется автоматически</span><span>Web / PWA prototype</span></footer>
      </main>
    );
  }

  if (progress.phase === 'prologue') {
    const slide = caseData.prologue[progress.prologueIndex];
    const index = progress.prologueIndex;
    return (
      <main className={`premium-prologue prologue-${index}`} style={{ '--hero-image': `url(${HERO_IMAGE})` } as React.CSSProperties}>
        <div className="premium-prologue-overlay" />
        <header className="prologue-header">
          <button className="premium-icon-button" onClick={() => setMuted((value) => !value)} aria-label="Звук"><Icon name={muted ? 'mute' : 'sound'} /></button>
          <div className="prologue-progress-premium">{caseData.prologue.map((_, itemIndex) => <span key={itemIndex} className={itemIndex <= index ? 'active' : ''} />)}</div>
          <span className="prologue-count">0{index + 1} / 04</span>
        </header>

        <section className="premium-prologue-card">
          <div className="prologue-visual">
            {index === 0 && <div className="incident-stamp"><span>07:14</span><strong>ПРОПАЖА</strong><small>Отель «Северный склон»</small></div>}
            {index === 1 && <div className="profile-poster"><img src={PORTRAITS.ilya} alt="Илья Соколов"/><div><small>Пропавший</small><strong>Илья Соколов</strong><span>Журналист · 29 лет</span></div></div>}
            {index === 2 && <div className="suspect-strip">{caseData.characters.map((character) => <div key={character.id}><img src={PORTRAITS[character.id]} alt=""/><span>{character.name.split(' ')[0]}</span></div>)}</div>}
            {index === 3 && <div className="message-device"><div className="message-top"><span>00:17</span><i>Илья Соколов</i></div><div className="message-bubble">{slide.quote}</div><small>Доставлено четырём участникам встречи</small></div>}
          </div>
          <div className="prologue-copy">
            <p className="premium-kicker">{slide.eyebrow}</p>
            <h1>{slide.title}</h1>
            <p>{slide.body}</p>
            <button className="premium-cta" onClick={nextPrologue}>{index === 3 ? 'Открыть штаб' : 'Продолжить'} <Icon name="arrow"/></button>
          </div>
        </section>
      </main>
    );
  }

  const tabs: Array<{ id: TabId; label: string; icon: string }> = [
    { id: 'case', label: 'Дело', icon: 'case' },
    { id: 'evidence', label: 'Материалы', icon: 'evidence' },
    { id: 'people', label: 'Люди', icon: 'people' },
    { id: 'versions', label: 'Версии', icon: 'versions' },
    { id: 'timeline', label: 'Хронология', icon: 'timeline' }
  ];

  return (
    <div className="premium-app">
      <header className="premium-topbar">
        <div className="topbar-case">
          <div className="premium-logo small"><span>Д</span><span>Б</span><span>Р</span></div>
          <div><small>Дело №001 · акт I</small><strong>Номер 314</strong></div>
        </div>
        <div className="topbar-actions">
          <StatusPill tone={progress.act1Complete ? 'secure' : 'live'}>{progress.act1Complete ? 'Акт завершён' : 'Расследование идёт'}</StatusPill>
          <button className="premium-icon-button" onClick={() => setMuted((value) => !value)} aria-label="Звук"><Icon name={muted ? 'mute' : 'sound'} /></button>
          <button className="premium-text-button" onClick={resetCase}>Сбросить</button>
        </div>
      </header>

      <div className="premium-workspace">
        <nav className="premium-sidebar">
          {tabs.map((tab) => <button key={tab.id} className={progress.activeTab === tab.id ? 'active' : ''} onClick={() => setTab(tab.id)}><Icon name={tab.icon}/><span>{tab.label}</span>{tab.id === 'evidence' && <b>{progress.seenEvidenceIds.length}</b>}</button>)}
        </nav>

        <main className="premium-content">
          {progress.activeTab === 'case' && (
            <section className="premium-dashboard">
              <div className="dashboard-hero">
                <div><p className="premium-kicker">Текущая задача</p><h1>{progress.act1Complete ? 'Другой путь найден' : 'Как Илья исчез из запертого номера?'}</h1><p>{progress.act1Complete ? 'Вы доказали, что обычные пути выхода не объясняют исчезновение. Следующий шаг — восстановить прежнюю планировку этажа.' : 'Исключите очевидные пути, проверьте цифровые следы и установите, мог ли кто-то попасть в номер незаметно.'}</p></div>
                <div className="dashboard-meter"><span>{checkpointFactCount}</span><small>из {caseData.checkpoint.minimumFacts}<br/>ключевых фактов</small></div>
              </div>

              {!progress.act1Complete && <button className="next-action-card" onClick={() => setTab(nextAction.tab)}><div className="action-index">Следующий шаг</div><div><strong>{nextAction.title}</strong><span>{nextAction.text}</span></div><Icon name="arrow"/></button>}

              <div className="dashboard-grid">
                <article className="premium-panel objective-panel">
                  <div className="panel-title"><div><p className="premium-kicker">Оперативная сводка</p><h2>Факты на данный момент</h2></div><StatusPill>{progress.discoveredFactIds.length} установлено</StatusPill></div>
                  {progress.discoveredFactIds.length ? <ul className="premium-fact-list">{progress.discoveredFactIds.map((id, index) => <li key={id}><span>{String(index + 1).padStart(2, '0')}</span><p>{caseData.facts[id]}</p></li>)}</ul> : <div className="premium-empty"><span>⌖</span><strong>Фактов пока нет</strong><p>Начните с осмотра номера 314.</p></div>}
                </article>

                <article className="premium-panel checkpoint-panel">
                  <div className="panel-title"><div><p className="premium-kicker">Логический узел</p><h2>{caseData.checkpoint.title}</h2></div><StatusPill tone={checkpointReady ? 'secure' : 'neutral'}>{checkpointFactCount}/{caseData.checkpoint.minimumFacts}</StatusPill></div>
                  {!checkpointReady && !progress.act1Complete ? <div className="checkpoint-locked"><div className="scan-line"/><strong>Недостаточно данных</strong><p>Подтвердите минимум три обстоятельства: дверь, окно, конфликт и телефон.</p></div> : <div className="premium-checkpoint"><p>{caseData.checkpoint.prompt}</p>{caseData.checkpoint.options.map((option) => { const chosen = progress.checkpointAnswerId === option.id; return <button key={option.id} className={`${chosen ? 'chosen' : ''} ${chosen && option.correct ? 'correct' : ''}`} onClick={() => submitCheckpoint(option)} disabled={progress.act1Complete && !chosen}><span>{chosen ? (option.correct ? '✓' : '×') : '○'}</span>{option.text}</button>; })}{checkpointAnswer && <div className={`premium-feedback ${checkpointAnswer.correct ? 'success' : 'warning'}`}><strong>{checkpointAnswer.correct ? 'Вывод подтверждён' : 'Версия не объясняет все факты'}</strong><p>{checkpointAnswer.feedback}</p></div>}</div>}
                </article>
              </div>
            </section>
          )}

          {progress.activeTab === 'evidence' && (
            <section className="premium-section">
              <div className="premium-section-header"><div><p className="premium-kicker">Материалы дела</p><h1>Исследуйте улики</h1><p>Каждый материал может открыть новый факт, вопрос или направление проверки.</p></div><div className="section-stat"><strong>{progress.seenEvidenceIds.length}</strong><span>из {caseData.evidence.length}<br/>изучено</span></div></div>
              <div className="premium-evidence-grid">
                {caseData.evidence.map((evidence, index) => {
                  const unlocked = unlockedEvidenceIds.includes(evidence.id);
                  const seen = progress.seenEvidenceIds.includes(evidence.id);
                  const flagged = progress.flaggedEvidenceIds.includes(evidence.id);
                  const art = EVIDENCE_ART[evidence.id] ?? { icon: '◌', tone: 'neutral' };
                  return <button key={evidence.id} className={`premium-evidence-card ${art.tone} ${seen ? 'seen' : ''} ${!unlocked ? 'locked' : ''}`} onClick={() => openEvidence(evidence)} disabled={!unlocked}>
                    {art.image && <img src={art.image} alt=""/>}<div className="evidence-card-shade"/><div className="evidence-card-top"><span>{evidence.id}</span><StatusPill tone={flagged ? 'amber' : seen ? 'secure' : unlocked ? 'live' : 'neutral'}>{flagged ? '★ Важное' : seen ? 'Изучено' : unlocked ? 'Новое' : 'Закрыто'}</StatusPill></div><div className="evidence-card-icon">{art.icon}</div><div className="evidence-card-copy"><small>{evidence.category}</small><h2>{evidence.title}</h2><p>{unlocked ? evidence.summary : 'Доступ откроется после изучения связанных материалов.'}</p></div><span className="evidence-number">0{index + 1}</span>
                  </button>;
                })}
              </div>
            </section>
          )}

          {progress.activeTab === 'people' && (
            <section className="premium-section">
              <div className="premium-section-header"><div><p className="premium-kicker">Круг лиц</p><h1>Все что-то скрывают</h1><p>Сопоставляйте ответы с найденными материалами. Новые вопросы открываются по мере расследования.</p></div><div className="section-stat"><strong>{progress.seenDialogueTopicIds.length}</strong><span>вопросов<br/>задано</span></div></div>
              <div className="premium-people-grid">
                {caseData.characters.map((character) => {
                  const asked = character.topics.filter((topic) => progress.seenDialogueTopicIds.includes(topic.id)).length;
                  const meta = CHARACTER_META[character.id];
                  return <button className="premium-person-card" key={character.id} onClick={() => { playSfx('open'); setSelectedCharacterId(character.id); }}><img src={PORTRAITS[character.id]} alt={character.name}/><div className="person-vignette"/><div className="person-top"><StatusPill tone={asked ? 'secure' : 'live'}>{asked ? `${asked} ответов` : 'Не допрошен'}</StatusPill><span>{character.room}</span></div><div className="person-copy"><small>{meta?.mood}</small><h2>{character.name}</h2><p>{character.role}</p><div className="person-signal"><span>Сигнал</span>{meta?.signal}</div></div></button>;
                })}
              </div>
            </section>
          )}

          {progress.activeTab === 'versions' && (
            <section className="premium-section">
              <div className="premium-section-header"><div><p className="premium-kicker">Рабочая доска</p><h1>Версии расследования</h1><p>Фиксируйте гипотезы. Игра не объявляет их правильными сразу — проверяйте каждую фактами.</p></div><div className="section-stat"><strong>{progress.selectedHypotheses.length}</strong><span>активных<br/>версий</span></div></div>
              <div className="premium-version-board">{caseData.hypotheses.map((hypothesis, index) => { const selected = progress.selectedHypotheses.includes(hypothesis); return <button key={hypothesis} className={selected ? 'selected' : ''} onClick={() => toggleHypothesis(hypothesis)}><span className="version-code">V-{String(index + 1).padStart(2, '0')}</span><i>{selected ? 'Зафиксирована' : 'Рабочая гипотеза'}</i><strong>{hypothesis}</strong><div className="version-toggle">{selected ? '✓' : '+'}</div></button>; })}</div>
            </section>
          )}

          {progress.activeTab === 'timeline' && (
            <section className="premium-section">
              <div className="premium-section-header"><div><p className="premium-kicker">Ночь исчезновения</p><h1>Хронология</h1><p>События появляются только после подтверждения соответствующими материалами.</p></div><div className="section-stat"><strong>{visibleTimeline.length}</strong><span>событий<br/>подтверждено</span></div></div>
              <div className="premium-timeline"><div className="timeline-axis"/>{visibleTimeline.map((entry, index) => <article key={`${entry.time}-${entry.text}`}><time>{entry.time}</time><span className="timeline-node">{String(index + 1).padStart(2, '0')}</span><div><small>Подтверждённое событие</small><p>{entry.text}</p></div></article>)}</div>
            </section>
          )}
        </main>
      </div>

      <nav className="premium-mobile-nav">{tabs.map((tab) => <button key={tab.id} className={progress.activeTab === tab.id ? 'active' : ''} onClick={() => setTab(tab.id)}><Icon name={tab.icon}/><span>{tab.label}</span></button>)}</nav>

      {selectedEvidence && <EvidenceModal evidence={selectedEvidence} progress={progress} onClose={() => setSelectedEvidenceId(null)} onHotspot={inspectHotspot} onCamera={answerCameraQuestion} onFlag={toggleFlag} />}
      {selectedCharacter && <CharacterModal character={selectedCharacter} progress={progress} onClose={() => setSelectedCharacterId(null)} onAsk={askDialogueTopic} />}
    </div>
  );
}

function EvidenceModal({ evidence, progress, onClose, onHotspot, onCamera, onFlag }: {
  evidence: Evidence;
  progress: Progress;
  onClose: () => void;
  onHotspot: (evidenceId: string, hotspot: Hotspot) => void;
  onCamera: (evidence: Evidence, option: CameraOption) => void;
  onFlag: (evidenceId: string) => void;
}) {
  const inspected = evidence.hotspots?.filter((spot) => progress.inspectedHotspotIds.includes(`${evidence.id}:${spot.id}`)) ?? [];
  const selectedSpot = inspected.at(-1);
  return <div className="premium-modal-backdrop" onMouseDown={onClose}>
    <section className={`premium-modal evidence-modal-premium evidence-${evidence.id.toLowerCase()}`} onMouseDown={(event) => event.stopPropagation()}>
      <header className="premium-modal-header"><div><p className="premium-kicker">{evidence.category} · {evidence.id}</p><h1>{evidence.title}</h1><p>{evidence.summary}</p></div><button className="premium-icon-button close" onClick={onClose}><Icon name="close"/></button></header>

      <div className="premium-modal-body">
        {evidence.mode === 'scene' && evidence.hotspots && <div className="premium-room-layout">
          <div className="premium-room-image"><img src={ROOM_IMAGE} alt="Номер 314"/><div className="room-image-grade"/><div className="room-camera-label"><span>SCENE 314</span><small>07:19 · первичный осмотр</small></div>{evidence.hotspots.map((spot) => { const position = ROOM_SPOTS[spot.id]; const isInspected = progress.inspectedHotspotIds.includes(`${evidence.id}:${spot.id}`); return <button key={spot.id} className={`room-marker ${isInspected ? 'inspected' : ''}`} style={{ left: position?.x, top: position?.y }} onClick={() => onHotspot(evidence.id, spot)} aria-label={`Осмотреть ${spot.label}`}><span>{isInspected ? '✓' : position?.index}</span><i>{spot.label}</i></button>; })}</div>
          <aside className="room-inspection-panel"><div className="inspection-progress"><span>{inspected.length}/4</span><div><strong>Зоны осмотра</strong><small>{inspected.length === 4 ? 'Осмотр завершён' : 'Найдите все значимые детали'}</small></div></div><div className="inspection-list">{evidence.hotspots.map((spot) => { const done = progress.inspectedHotspotIds.includes(`${evidence.id}:${spot.id}`); return <button key={spot.id} className={done ? 'done' : ''} onClick={() => onHotspot(evidence.id, spot)}><span>{done ? '✓' : ROOM_SPOTS[spot.id]?.index}</span><div><strong>{spot.label}</strong><small>{done ? spot.title : 'Осмотреть зону'}</small></div></button>; })}</div>{selectedSpot ? <div className="inspection-result"><p className="premium-kicker">Обнаружено</p><h3>{selectedSpot.title}</h3><p>{selectedSpot.description}</p></div> : <div className="inspection-placeholder"><span>⌖</span><strong>Выберите точку на фотографии</strong><p>Новые факты фиксируются в оперативной сводке автоматически.</p></div>}</aside>
        </div>}

        {evidence.id === 'E002' && <div className="message-evidence"><div className="message-phone"><div className="phone-status"><span>00:17</span><span>5G · 82%</span></div><div className="chat-contact"><img src={PORTRAITS.ilya} alt=""/><div><strong>Илья Соколов</strong><small>был в сети в 00:17</small></div></div><div className="chat-date">Сегодня, 00:17</div><div className="evidence-message-bubble">{evidence.quote}</div><div className="message-delivery">Доставлено · 4 получателя</div></div><aside className="forensic-note"><p className="premium-kicker">Значение для дела</p><h2>Возможный мотив</h2><p>Илья собирался раскрыть чью-то ложь утром. Сообщение прочитали все участники встречи.</p><div className="read-receipts">{evidence.details.map((detail) => <span key={detail}>{detail}</span>)}</div></aside></div>}

        {evidence.id === 'E003' && <div className="lock-evidence"><div className="system-document"><div className="document-head"><div><small>NORDLOCK / ACCESS CONTROL</small><strong>ROOM 314</strong></div><span>18 OCT 2026</span></div><div className="document-meta"><span>Контроллер: 3F-14</span><span>Статус: журнал цел</span><span>Экспорт: 07:21</span></div><table><thead><tr><th>Время</th><th>Событие</th><th>Идентификатор</th></tr></thead><tbody><tr><td>23:47</td><td>Открытие изнутри</td><td>MECH-IN</td></tr><tr className="critical"><td>23:50</td><td>Вход по карте</td><td>ILYA-314</td></tr><tr><td>23:50</td><td>Дверь закрыта</td><td>AUTO-LOCK</td></tr><tr><td>07:12</td><td>Аварийное открытие</td><td>MASTER-M01</td></tr></tbody></table><div className="document-seal">NO EVENTS 23:50—07:12</div></div><aside className="forensic-note"><p className="premium-kicker">Ключевой вывод</p><h2>Главная дверь не использовалась</h2><p>После возвращения Ильи в 23:50 замок не фиксирует ни выхода, ни нового входа вплоть до утра.</p></aside></div>}

        {evidence.mode === 'camera' && evidence.cameraEvents && evidence.cameraQuestion && <div className="camera-evidence"><div className="cctv-frame"><img src={CAMERA_IMAGE} alt="Коридорная камера"/><div className="cctv-noise"/><div className="cctv-overlay"><span>CAM 3F / REC</span><time>18-10-2026</time></div><div className="cctv-focus">Двери 312–314 вне полного обзора</div></div><div className="camera-console"><div className="camera-events">{evidence.cameraEvents.map((event) => <button key={`${event.time}-${event.text}`}><time>{event.time}</time><span>{event.text}</span></button>)}</div><div className="camera-question"><p className="premium-kicker">Проверка наблюдательности</p><h2>{evidence.cameraQuestion.prompt}</h2><div>{evidence.cameraQuestion.options.map((option) => { const selected = progress.puzzleAnswers[evidence.id] === option.id; return <button key={option.id} className={`${selected ? 'selected' : ''} ${selected && option.correct ? 'correct' : ''}`} onClick={() => onCamera(evidence, option)}>{option.label}</button>; })}</div>{progress.puzzleAnswers[evidence.id] && (() => { const chosen = evidence.cameraQuestion?.options.find((option) => option.id === progress.puzzleAnswers[evidence.id]); return <p className={`camera-feedback ${chosen?.correct ? 'success' : 'warning'}`}>{chosen?.correct ? evidence.cameraQuestion?.successText : evidence.cameraQuestion?.failureText}</p>; })()}</div></div></div>}

        {evidence.id === 'E005' && <div className="phone-evidence"><div className="forensic-phone"><div className="phone-notch"/><div className="phone-lock"><span>00:48</span><small>Авиарежим</small></div><div className="phone-map"><span className="map-ring one"/><span className="map-ring two"/><b>Служебный лифт</b><small>найден в 06:45</small></div></div><div className="forensic-timeline"><p className="premium-kicker">Цифровая экспертиза</p><h2>Последние действия устройства</h2><div><span><time>00:28</time><p>Прекращается обычная ходьба владельца</p></span><span><time>00:43</time><p>Звук отключён вручную</p></span><span className="critical"><time>00:48</time><p>Включён авиарежим</p></span><span><time>06:45</time><p>Телефон найден у служебного лифта</p></span></div><div className="forensic-conclusion"><strong>Вероятный вывод</strong><p>Телефон не выпал случайно. Его перенесли, отключили и оставили как ложный след.</p></div></div></div>}

        {evidence.mode !== 'scene' && evidence.mode !== 'camera' && !['E002','E003','E005'].includes(evidence.id) && <ul className="premium-detail-list">{evidence.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>}
      </div>

      <footer className="premium-modal-footer"><button className={`flag-button ${progress.flaggedEvidenceIds.includes(evidence.id) ? 'selected' : ''}`} onClick={() => onFlag(evidence.id)}><Icon name="star"/>{progress.flaggedEvidenceIds.includes(evidence.id) ? 'Отмечено как ключевое' : 'Отметить как ключевое'}</button><button className="premium-cta compact" onClick={onClose}>Вернуться в штаб <Icon name="arrow"/></button></footer>
    </section>
  </div>;
}

function CharacterModal({ character, progress, onClose, onAsk }: { character: Character; progress: Progress; onClose: () => void; onAsk: (topic: DialogueTopic) => void }) {
  const meta = CHARACTER_META[character.id];
  return <div className="premium-modal-backdrop" onMouseDown={onClose}>
    <section className="premium-modal character-modal-premium" onMouseDown={(event) => event.stopPropagation()}>
      <button className="premium-icon-button close floating" onClick={onClose}><Icon name="close"/></button>
      <div className="interview-portrait"><img src={PORTRAITS[character.id]} alt={character.name}/><div className="interview-grade"/><div className="interview-id"><span>INTERVIEW / {character.id.toUpperCase()}</span><small>{character.room}</small></div><div className="interview-name"><p>{meta?.mood}</p><h1>{character.name}</h1><span>{character.role}</span></div></div>
      <div className="interview-content"><div className="interview-profile"><p className="premium-kicker">Наблюдение</p><p>{meta?.note}</p><div className="signal-box"><small>Поведенческий сигнал</small><strong>{meta?.signal}</strong></div><blockquote>«{character.statement}»</blockquote></div><div className="interview-questions"><div className="panel-title"><div><p className="premium-kicker">Темы разговора</p><h2>Допрос</h2></div><StatusPill>{character.topics.filter((topic) => progress.seenDialogueTopicIds.includes(topic.id)).length}/{character.topics.length}</StatusPill></div>{character.topics.map((topic) => { const unlocked = (topic.requiresSeen ?? []).every((id) => progress.seenEvidenceIds.includes(id)); const asked = progress.seenDialogueTopicIds.includes(topic.id); return <article key={topic.id} className={`${!unlocked ? 'locked' : ''} ${asked ? 'asked' : ''}`}><button disabled={!unlocked} onClick={() => onAsk(topic)}><span>{asked ? '↻' : unlocked ? '→' : '⌁'}</span><div><small>{asked ? 'Повторить вопрос' : unlocked ? 'Задать вопрос' : 'Нужны дополнительные материалы'}</small><strong>{topic.question}</strong></div></button>{asked && <div className="interview-answer"><span>{character.name.split(' ')[0]}</span><p>{topic.answer}</p></div>}</article>; })}</div></div>
    </section>
  </div>;
}
