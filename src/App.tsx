import { useEffect, useMemo, useState } from 'react';
import room314Source from './cases/room314.json';

type TabId = 'case' | 'evidence' | 'people' | 'versions' | 'timeline';
type Phase = 'home' | 'prologue' | 'hq';

interface Evidence {
  id: string;
  title: string;
  category: string;
  summary: string;
  details: string[];
  quote?: string;
  requiresSeen?: string[];
  createsFactIds: string[];
}

interface Character {
  id: string;
  name: string;
  room: string;
  role: string;
  statement: string;
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
  timeline: Array<{ time: string; text: string }>;
}

interface Progress {
  phase: Phase;
  prologueIndex: number;
  activeTab: TabId;
  seenEvidenceIds: string[];
  flaggedEvidenceIds: string[];
  discoveredFactIds: string[];
  selectedHypotheses: string[];
  startedAt: string | null;
}

const caseData = room314Source as CaseData;
const STORAGE_KEY = `dbr:${caseData.manifest.caseId}:${caseData.manifest.version}`;

const initialProgress: Progress = {
  phase: 'home',
  prologueIndex: 0,
  activeTab: 'case',
  seenEvidenceIds: [],
  flaggedEvidenceIds: [],
  discoveredFactIds: [],
  selectedHypotheses: [],
  startedAt: null
};

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProgress;
    return { ...initialProgress, ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    return initialProgress;
  }
}

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'case', label: 'Дело' },
  { id: 'evidence', label: 'Материалы' },
  { id: 'people', label: 'Люди' },
  { id: 'versions', label: 'Версии' },
  { id: 'timeline', label: 'Хронология' }
];

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const selectedEvidence = useMemo(
    () => caseData.evidence.find((item) => item.id === selectedEvidenceId) ?? null,
    [selectedEvidenceId]
  );

  const unlockedEvidenceIds = useMemo(() => {
    return caseData.evidence
      .filter((item) =>
        (item.requiresSeen ?? []).every((requiredId) =>
          progress.seenEvidenceIds.includes(requiredId)
        )
      )
      .map((item) => item.id);
  }, [progress.seenEvidenceIds]);

  function startCase() {
    setProgress({
      ...initialProgress,
      phase: 'prologue',
      startedAt: new Date().toISOString()
    });
  }

  function nextPrologue() {
    const isLast = progress.prologueIndex >= caseData.prologue.length - 1;
    if (isLast) {
      setProgress((current) => ({ ...current, phase: 'hq', activeTab: 'case' }));
      return;
    }
    setProgress((current) => ({
      ...current,
      prologueIndex: current.prologueIndex + 1
    }));
  }

  function openEvidence(evidence: Evidence) {
    if (!unlockedEvidenceIds.includes(evidence.id)) return;

    setProgress((current) => ({
      ...current,
      seenEvidenceIds: current.seenEvidenceIds.includes(evidence.id)
        ? current.seenEvidenceIds
        : [...current.seenEvidenceIds, evidence.id],
      discoveredFactIds: Array.from(
        new Set([...current.discoveredFactIds, ...evidence.createsFactIds])
      )
    }));
    setSelectedEvidenceId(evidence.id);
  }

  function toggleFlag(evidenceId: string) {
    setProgress((current) => ({
      ...current,
      flaggedEvidenceIds: current.flaggedEvidenceIds.includes(evidenceId)
        ? current.flaggedEvidenceIds.filter((id) => id !== evidenceId)
        : [...current.flaggedEvidenceIds, evidenceId]
    }));
  }

  function toggleHypothesis(hypothesis: string) {
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
    setProgress(initialProgress);
  }

  if (progress.phase === 'home') {
    return (
      <main className="landing shell">
        <div className="brand-mark">ДБР</div>
        <p className="brand-caption">Детективное бюро расследований</p>

        <section className="hero-card">
          <p className="eyebrow">Дело №{caseData.manifest.caseNumber}</p>
          <h1>{caseData.manifest.title}</h1>
          <p className="hero-copy">{caseData.manifest.subtitle}</p>

          <div className="case-meta" aria-label="Параметры дела">
            <span>{caseData.manifest.ageRating}</span>
            <span>{caseData.manifest.players}</span>
            <span>≈ {caseData.manifest.estimatedMinutes} минут</span>
          </div>

          <button className="primary-button" onClick={startCase}>
            Начать расследование
          </button>
          <p className="save-note">Прогресс сохраняется автоматически на этом устройстве.</p>
        </section>
      </main>
    );
  }

  if (progress.phase === 'prologue') {
    const slide = caseData.prologue[progress.prologueIndex];
    return (
      <main className="prologue shell">
        <div className="prologue-progress" aria-label="Прогресс вступления">
          {caseData.prologue.map((_, index) => (
            <span key={index} className={index <= progress.prologueIndex ? 'active' : ''} />
          ))}
        </div>

        <section className="prologue-card">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h1>{slide.title}</h1>
          {slide.quote && <blockquote>{slide.quote}</blockquote>}
          <p>{slide.body}</p>
        </section>

        <button className="primary-button" onClick={nextPrologue}>
          {progress.prologueIndex === caseData.prologue.length - 1
            ? 'Открыть штаб'
            : 'Далее'}
        </button>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">ДБР · Дело №001</p>
          <h1>{caseData.manifest.title}</h1>
        </div>
        <button className="text-button" onClick={resetCase}>Сбросить</button>
      </header>

      <main className="hq-content">
        {progress.activeTab === 'case' && (
          <section className="stack">
            <article className="status-card">
              <p className="eyebrow">Текущая стадия</p>
              <h2>Осмотр места</h2>
              <p>Установите, мог ли Илья самостоятельно покинуть номер 314 после 23:50.</p>
              <div className="stat-row">
                <span>Изучено: {progress.seenEvidenceIds.length}/{caseData.evidence.length}</span>
                <span>Фактов: {progress.discoveredFactIds.length}</span>
                <span>Отмечено: {progress.flaggedEvidenceIds.length}</span>
              </div>
              <button
                className="primary-button compact"
                onClick={() => setProgress((current) => ({ ...current, activeTab: 'evidence' }))}
              >
                Перейти к материалам
              </button>
            </article>

            <article className="panel">
              <h2>Установленные факты</h2>
              {progress.discoveredFactIds.length === 0 ? (
                <p className="muted">Факты появятся после изучения материалов.</p>
              ) : (
                <ul className="fact-list">
                  {progress.discoveredFactIds.map((factId) => (
                    <li key={factId}>{caseData.facts[factId]}</li>
                  ))}
                </ul>
              )}
            </article>

            <article className="panel technical-panel">
              <h2>Проверка сценарного пакета</h2>
              <p>Пакет загружен: <strong>{caseData.manifest.caseId}</strong></p>
              <p>Версия контента: {caseData.manifest.version}</p>
              <p>Сохранение: localStorage</p>
            </article>
          </section>
        )}

        {progress.activeTab === 'evidence' && (
          <section>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Материалы дела</p>
                <h2>Первичный осмотр</h2>
              </div>
              <span>{progress.seenEvidenceIds.length} изучено</span>
            </div>

            <div className="card-grid">
              {caseData.evidence.map((evidence) => {
                const unlocked = unlockedEvidenceIds.includes(evidence.id);
                const seen = progress.seenEvidenceIds.includes(evidence.id);
                const flagged = progress.flaggedEvidenceIds.includes(evidence.id);
                return (
                  <button
                    key={evidence.id}
                    className={`evidence-card ${seen ? 'seen' : ''} ${!unlocked ? 'locked' : ''}`}
                    onClick={() => openEvidence(evidence)}
                    disabled={!unlocked}
                  >
                    <span className="evidence-id">{evidence.id}</span>
                    <span className="evidence-category">{evidence.category}</span>
                    <strong>{evidence.title}</strong>
                    <span>{unlocked ? evidence.summary : 'Недостаточно данных для доступа.'}</span>
                    <span className="card-status">
                      {!unlocked ? 'Закрыто' : flagged ? '★ Важное' : seen ? 'Изучено' : 'Новое'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {progress.activeTab === 'people' && (
          <section>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Первые показания</p>
                <h2>Участники встречи</h2>
              </div>
            </div>
            <div className="card-grid people-grid">
              {caseData.characters.map((character) => (
                <article className="person-card" key={character.id}>
                  <div className="avatar-placeholder" aria-hidden="true">
                    {character.name.charAt(0)}
                  </div>
                  <p className="eyebrow">{character.room}</p>
                  <h3>{character.name}</h3>
                  <p className="muted">{character.role}</p>
                  <blockquote>{character.statement}</blockquote>
                  <button className="secondary-button" disabled>
                    Расширенный допрос — в v0.2
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {progress.activeTab === 'versions' && (
          <section>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Рабочая доска</p>
                <h2>Версии расследования</h2>
              </div>
              <span>{progress.selectedHypotheses.length} выбрано</span>
            </div>
            <div className="version-list">
              {caseData.hypotheses.map((hypothesis) => {
                const selected = progress.selectedHypotheses.includes(hypothesis);
                return (
                  <button
                    key={hypothesis}
                    className={`version-row ${selected ? 'selected' : ''}`}
                    onClick={() => toggleHypothesis(hypothesis)}
                  >
                    <span className="checkmark">{selected ? '✓' : ''}</span>
                    <span>{hypothesis}</span>
                  </button>
                );
              })}
            </div>
            <p className="muted helper-copy">
              Версия не помечается как правильная или ошибочная сразу. Новые факты будут усиливать или ослаблять её.
            </p>
          </section>
        )}

        {progress.activeTab === 'timeline' && (
          <section>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Ночь исчезновения</p>
                <h2>Хронология</h2>
              </div>
            </div>
            <div className="timeline">
              {caseData.timeline.map((entry) => (
                <article key={`${entry.time}-${entry.text}`} className="timeline-entry">
                  <time>{entry.time}</time>
                  <div>
                    <span className="timeline-dot" />
                    <p>{entry.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Разделы штаба">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={progress.activeTab === tab.id ? 'active' : ''}
            onClick={() => setProgress((current) => ({ ...current, activeTab: tab.id }))}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {selectedEvidence && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedEvidenceId(null)}>
          <article className="evidence-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedEvidenceId(null)} aria-label="Закрыть">×</button>
            <p className="eyebrow">{selectedEvidence.category} · {selectedEvidence.id}</p>
            <h2>{selectedEvidence.title}</h2>
            {selectedEvidence.quote && <blockquote>{selectedEvidence.quote}</blockquote>}
            <p>{selectedEvidence.summary}</p>
            <ul className="detail-list">
              {selectedEvidence.details.map((detail) => <li key={detail}>{detail}</li>)}
            </ul>
            <button
              className={progress.flaggedEvidenceIds.includes(selectedEvidence.id) ? 'secondary-button selected' : 'secondary-button'}
              onClick={() => toggleFlag(selectedEvidence.id)}
            >
              {progress.flaggedEvidenceIds.includes(selectedEvidence.id)
                ? '★ Отмечено как важное'
                : '☆ Отметить как важное'}
            </button>
          </article>
        </div>
      )}
    </div>
  );
}
