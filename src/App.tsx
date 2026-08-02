import { useEffect, useMemo, useState } from 'react';
import room314Source from './cases/room314.json';

type TabId = 'case' | 'evidence' | 'people' | 'versions' | 'timeline';
type Phase = 'home' | 'prologue' | 'hq';
type EvidenceMode = 'standard' | 'scene' | 'camera';

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

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProgress;
    const saved = JSON.parse(raw) as Partial<Progress>;
    return {
      ...initialProgress,
      ...saved,
      puzzleAnswers: saved.puzzleAnswers ?? {}
    };
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

function addUnique(current: string[], additions: string[]): string[] {
  return Array.from(new Set([...current, ...additions]));
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const selectedEvidence = useMemo(
    () => caseData.evidence.find((item) => item.id === selectedEvidenceId) ?? null,
    [selectedEvidenceId]
  );

  const selectedCharacter = useMemo(
    () => caseData.characters.find((item) => item.id === selectedCharacterId) ?? null,
    [selectedCharacterId]
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

  const visibleTimeline = useMemo(
    () => caseData.timeline.filter((entry) =>
      (entry.requiresSeen ?? []).every((id) => progress.seenEvidenceIds.includes(id))
    ),
    [progress.seenEvidenceIds]
  );

  const checkpointFactCount = caseData.checkpoint.requiredFactIds.filter((factId) =>
    progress.discoveredFactIds.includes(factId)
  ).length;
  const checkpointReady = checkpointFactCount >= caseData.checkpoint.minimumFacts;
  const checkpointAnswer = caseData.checkpoint.options.find(
    (option) => option.id === progress.checkpointAnswerId
  );

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
      seenEvidenceIds: addUnique(current.seenEvidenceIds, [evidence.id]),
      discoveredFactIds: addUnique(current.discoveredFactIds, evidence.createsFactIds)
    }));
    setSelectedEvidenceId(evidence.id);
  }

  function inspectHotspot(evidenceId: string, hotspot: Hotspot) {
    const hotspotKey = `${evidenceId}:${hotspot.id}`;
    setProgress((current) => ({
      ...current,
      inspectedHotspotIds: addUnique(current.inspectedHotspotIds, [hotspotKey]),
      discoveredFactIds: addUnique(current.discoveredFactIds, hotspot.createsFactIds)
    }));
  }

  function answerCameraQuestion(evidence: Evidence, option: CameraOption) {
    const question = evidence.cameraQuestion;
    if (!question) return;

    setProgress((current) => ({
      ...current,
      puzzleAnswers: { ...current.puzzleAnswers, [evidence.id]: option.id },
      discoveredFactIds: option.correct
        ? addUnique(current.discoveredFactIds, question.successFactIds)
        : current.discoveredFactIds
    }));
  }

  function askDialogueTopic(topic: DialogueTopic) {
    const unlocked = (topic.requiresSeen ?? []).every((id) =>
      progress.seenEvidenceIds.includes(id)
    );
    if (!unlocked) return;

    setProgress((current) => ({
      ...current,
      seenDialogueTopicIds: addUnique(current.seenDialogueTopicIds, [topic.id]),
      discoveredFactIds: addUnique(current.discoveredFactIds, topic.createsFactIds ?? [])
    }));
  }

  function submitCheckpoint(option: CheckpointOption) {
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
    setSelectedCharacterId(null);
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
          <p className="eyebrow">ДБР · Дело №001 · v{caseData.manifest.version}</p>
          <h1>{caseData.manifest.title}</h1>
        </div>
        <button className="text-button" onClick={resetCase}>Сбросить</button>
      </header>

      <main className="hq-content">
        {progress.activeTab === 'case' && (
          <section className="stack">
            <article className={`status-card ${progress.act1Complete ? 'complete' : ''}`}>
              <p className="eyebrow">{progress.act1Complete ? 'Контрольная точка пройдена' : 'Текущая стадия'}</p>
              <h2>{progress.act1Complete ? 'Акт I. Запертый номер — завершён' : 'Осмотр места'}</h2>
              <p>
                {progress.act1Complete
                  ? 'Вы установили, что Илья не мог уйти обычным путём. Следующий этап расследования — прежняя планировка отеля и номер 312.'
                  : 'Установите, мог ли Илья самостоятельно покинуть номер 314 после 23:50.'}
              </p>
              <div className="stat-row">
                <span>Изучено: {progress.seenEvidenceIds.length}/{caseData.evidence.length}</span>
                <span>Фактов: {progress.discoveredFactIds.length}</span>
                <span>Допросов: {progress.seenDialogueTopicIds.length}</span>
              </div>
              {!progress.act1Complete && (
                <button
                  className="primary-button compact"
                  onClick={() => setProgress((current) => ({ ...current, activeTab: 'evidence' }))}
                >
                  Перейти к материалам
                </button>
              )}
            </article>

            <article className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Логический узел</p>
                  <h2>{caseData.checkpoint.title}</h2>
                </div>
                <span className={`readiness ${checkpointReady ? 'ready' : ''}`}>
                  {checkpointFactCount}/{caseData.checkpoint.minimumFacts} ключевых факта
                </span>
              </div>

              {!checkpointReady && !progress.act1Complete && (
                <p className="muted">
                  Сначала подтвердите минимум три обстоятельства: путь через дверь, окно, признаки конфликта и состояние телефона.
                </p>
              )}

              {(checkpointReady || progress.act1Complete) && (
                <div className="checkpoint-box">
                  <p className="checkpoint-prompt">{caseData.checkpoint.prompt}</p>
                  <div className="checkpoint-options">
                    {caseData.checkpoint.options.map((option) => {
                      const chosen = progress.checkpointAnswerId === option.id;
                      return (
                        <button
                          key={option.id}
                          className={`checkpoint-option ${chosen ? 'chosen' : ''} ${chosen && option.correct ? 'correct' : ''}`}
                          onClick={() => submitCheckpoint(option)}
                          disabled={progress.act1Complete && !chosen}
                        >
                          {option.text}
                        </button>
                      );
                    })}
                  </div>
                  {checkpointAnswer && (
                    <div className={`feedback ${checkpointAnswer.correct ? 'success' : 'warning'}`}>
                      <strong>{checkpointAnswer.correct ? 'Вывод подтверждён.' : 'Версия пока не сходится.'}</strong>
                      <p>{checkpointAnswer.feedback}</p>
                    </div>
                  )}
                  {progress.act1Complete && (
                    <div className="act-complete-note">{caseData.checkpoint.successText}</div>
                  )}
                </div>
              )}
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
              <h2>Состояние прототипа</h2>
              <p>Пакет: <strong>{caseData.manifest.caseId}</strong></p>
              <p>Контент: {caseData.manifest.version}</p>
              <p>Сохранение: localStorage</p>
              <p>Доступно: интерактивный осмотр, камера, первичные допросы, промежуточный отчёт.</p>
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
              <span>{progress.seenDialogueTopicIds.length} вопросов задано</span>
            </div>
            <div className="card-grid people-grid">
              {caseData.characters.map((character) => {
                const askedCount = character.topics.filter((topic) =>
                  progress.seenDialogueTopicIds.includes(topic.id)
                ).length;
                return (
                  <article className="person-card" key={character.id}>
                    <div className="avatar-placeholder" aria-hidden="true">
                      {character.name.charAt(0)}
                    </div>
                    <p className="eyebrow">{character.room}</p>
                    <h3>{character.name}</h3>
                    <p className="muted">{character.role}</p>
                    <blockquote>{character.statement}</blockquote>
                    <button
                      className="secondary-button"
                      onClick={() => setSelectedCharacterId(character.id)}
                    >
                      Допросить · {askedCount}/{character.topics.length}
                    </button>
                  </article>
                );
              })}
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
              Версия не помечается как правильная сразу. Проверяйте, объясняет ли она все найденные следы.
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
              <span>{visibleTimeline.length} событий</span>
            </div>
            <div className="timeline">
              {visibleTimeline.map((entry) => (
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

            {selectedEvidence.mode === 'scene' && selectedEvidence.hotspots && (
              <div className="room-scene" aria-label="Зоны осмотра номера">
                {selectedEvidence.hotspots.map((hotspot) => {
                  const key = `${selectedEvidence.id}:${hotspot.id}`;
                  const inspected = progress.inspectedHotspotIds.includes(key);
                  return (
                    <button
                      key={hotspot.id}
                      className={`hotspot-card ${inspected ? 'inspected' : ''}`}
                      onClick={() => inspectHotspot(selectedEvidence.id, hotspot)}
                    >
                      <span>{inspected ? '✓ Изучено' : 'Осмотреть'}</span>
                      <strong>{hotspot.label}</strong>
                      {inspected && (
                        <div className="hotspot-result">
                          <b>{hotspot.title}</b>
                          <p>{hotspot.description}</p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedEvidence.mode === 'camera' && selectedEvidence.cameraEvents && selectedEvidence.cameraQuestion && (
              <div className="camera-puzzle">
                <div className="camera-feed">
                  <div className="camera-label">CAM 3F · запись восстановлена</div>
                  {selectedEvidence.cameraEvents.map((event) => (
                    <div className="camera-event" key={`${event.time}-${event.text}`}>
                      <time>{event.time}</time>
                      <span>{event.text}</span>
                    </div>
                  ))}
                </div>
                <h3>{selectedEvidence.cameraQuestion.prompt}</h3>
                <div className="answer-grid">
                  {selectedEvidence.cameraQuestion.options.map((option) => {
                    const selected = progress.puzzleAnswers[selectedEvidence.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        className={`answer-button ${selected ? 'selected' : ''} ${selected && option.correct ? 'correct' : ''}`}
                        onClick={() => answerCameraQuestion(selectedEvidence, option)}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {progress.puzzleAnswers[selectedEvidence.id] && (() => {
                  const chosen = selectedEvidence.cameraQuestion?.options.find(
                    (option) => option.id === progress.puzzleAnswers[selectedEvidence.id]
                  );
                  return (
                    <div className={`feedback ${chosen?.correct ? 'success' : 'warning'}`}>
                      {chosen?.correct
                        ? selectedEvidence.cameraQuestion?.successText
                        : selectedEvidence.cameraQuestion?.failureText}
                    </div>
                  );
                })()}
              </div>
            )}

            {selectedEvidence.mode !== 'scene' && selectedEvidence.mode !== 'camera' && (
              <ul className="detail-list">
                {selectedEvidence.details.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>
            )}

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

      {selectedCharacter && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedCharacterId(null)}>
          <article className="evidence-modal dialogue-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedCharacterId(null)} aria-label="Закрыть">×</button>
            <p className="eyebrow">Допрос · {selectedCharacter.room}</p>
            <h2>{selectedCharacter.name}</h2>
            <p className="muted">{selectedCharacter.role}</p>
            <blockquote>{selectedCharacter.statement}</blockquote>

            <div className="dialogue-list">
              {selectedCharacter.topics.map((topic) => {
                const unlocked = (topic.requiresSeen ?? []).every((id) =>
                  progress.seenEvidenceIds.includes(id)
                );
                const asked = progress.seenDialogueTopicIds.includes(topic.id);
                return (
                  <div className={`dialogue-topic ${!unlocked ? 'locked' : ''}`} key={topic.id}>
                    <button disabled={!unlocked} onClick={() => askDialogueTopic(topic)}>
                      <span>{asked ? 'Повторить вопрос' : unlocked ? 'Задать вопрос' : 'Вопрос пока недоступен'}</span>
                      <strong>{topic.question}</strong>
                    </button>
                    {asked && <div className="dialogue-answer">{topic.answer}</div>}
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
