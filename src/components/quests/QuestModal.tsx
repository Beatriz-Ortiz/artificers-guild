import { useState } from 'react';
import type { PanelId } from '../../types/cv';
import type {
  Quest,
  CombatQuest,
  TriviaQuest,
  PortalQuest,
  TriviaOption,
} from '../../data/quests';

// ── Props ────────────────────────────────────────────────────────

interface QuestModalProps {
  quest:      Quest;
  onComplete: (id: PanelId, greeting?: string) => void;
  onSkip:     (id: PanelId) => void;
}

// ── Shared sub-components ────────────────────────────────────────

function EnemyHeader({
  icon,
  name,
  hp,
  maxHp,
}: {
  icon:  string;
  name:  string;
  hp:    number;
  maxHp: number;
}) {
  const pct = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  return (
    <div
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           14,
        padding:       '14px 20px',
        borderBottom:  '1px solid rgba(201,168,76,0.2)',
        background:    'rgba(200,0,0,0.06)',
        flexShrink:    0,
      }}
    >
      <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="quest-enemy-name">{name}</div>
        {maxHp > 0 && (
          <div style={{ marginTop: 6 }}>
            <div
              style={{
                display:        'flex',
                justifyContent: 'space-between',
                fontFamily:     'var(--font-pixel)',
                fontSize:       '0.28rem',
                color:          'rgba(204,34,34,0.7)',
                marginBottom:   4,
              }}
            >
              <span>HP</span>
              <span>{hp} / {maxHp}</span>
            </div>
            <div className="quest-hp-track">
              <div
                className="quest-hp-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VictoryScreen({
  title,
  body,
  onClaim,
}: {
  title:   string;
  body:    string;
  onClaim: () => void;
}) {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            16,
        padding:        '32px 24px',
        textAlign:      'center',
        animation:      'fade-in 0.3s ease',
      }}
    >
      <div className="quest-victory-title">✦ VICTORY ✦</div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize:   '1.1rem',
          fontWeight: 700,
          color:      'var(--color-gold)',
        }}
      >
        {title}
      </div>
      <p
        style={{
          fontFamily:  'var(--font-body)',
          fontStyle:   'italic',
          fontSize:    '0.95rem',
          lineHeight:  1.65,
          color:       'rgba(244,228,188,0.85)',
          margin:      0,
          maxWidth:    380,
        }}
      >
        {body}
      </p>
      <button className="quest-claim-btn" onClick={onClaim}>
        ⚔ Claim Reward
      </button>
    </div>
  );
}

// ── Combat Quest ─────────────────────────────────────────────────

function CombatQuestView({
  quest,
  onVictory,
}: {
  quest:     CombatQuest;
  onVictory: () => void;
}) {
  const [round,     setRound]     = useState(0);
  const [enemyHp,   setEnemyHp]   = useState(quest.enemyMaxHp);
  const [flavor,    setFlavor]    = useState<string | null>(null);
  const [attacking, setAttacking] = useState(false);
  const [phase,     setPhase]     = useState<'fight' | 'victory'>('fight');

  const currentRound = quest.rounds[round];

  const attack = (flavorText: string) => {
    if (attacking) return;
    setAttacking(true);
    setFlavor(flavorText);

    setTimeout(() => {
      const newHp = enemyHp - 1;
      setEnemyHp(newHp);

      if (newHp <= 0) {
        setTimeout(() => setPhase('victory'), 400);
      } else {
        setTimeout(() => {
          setRound((r) => r + 1);
          setFlavor(null);
          setAttacking(false);
        }, 1200);
      }
    }, 600);
  };

  if (phase === 'victory') {
    return (
      <VictoryScreen
        title="Quest Complete"
        body={quest.victoryText}
        onClaim={onVictory}
      />
    );
  }

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Round prompt */}
      <div
        style={{
          fontFamily:  'var(--font-body)',
          fontStyle:   'italic',
          fontSize:    '1.05rem',
          color:       'rgba(244,228,188,0.9)',
          lineHeight:  1.6,
          minHeight:   52,
          padding:     '12px 16px',
          border:      '1px solid rgba(201,168,76,0.2)',
          borderRadius: 6,
          background:  'rgba(255,255,255,0.03)',
        }}
      >
        {currentRound.prompt}
      </div>

      {/* Flavor text after selecting */}
      {flavor && (
        <div
          style={{
            fontFamily:  'var(--font-pixel)',
            fontSize:    '0.32rem',
            color:       '#cc8822',
            letterSpacing: '0.06em',
            lineHeight:  1.8,
            padding:     '8px 12px',
            borderLeft:  '2px solid #cc4422',
            animation:   'fade-in 0.2s ease',
          }}
        >
          {flavor}
        </div>
      )}

      {/* Choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {currentRound.choices.map((choice, i) => (
          <button
            key={i}
            className="quest-choice-btn"
            disabled={attacking}
            onClick={() => attack(choice.flavorText)}
          >
            {String.fromCharCode(65 + i)}) {choice.label}
          </button>
        ))}
      </div>

      {/* Round counter */}
      <div
        style={{
          fontFamily:    'var(--font-pixel)',
          fontSize:      '0.28rem',
          color:         'rgba(244,228,188,0.3)',
          textAlign:     'right',
          letterSpacing: '0.06em',
        }}
      >
        ROUND {round + 1} / {quest.rounds.length}
      </div>
    </div>
  );
}

// ── Trivia Quest ─────────────────────────────────────────────────

function TriviaQuestView({
  quest,
  onVictory,
}: {
  quest:     TriviaQuest;
  onVictory: () => void;
}) {
  const [questionIdx,  setQuestionIdx]  = useState(0);
  const [score,        setScore]        = useState(0);
  const [selected,     setSelected]     = useState<TriviaOption | null>(null);
  const [phase,        setPhase]        = useState<'question' | 'feedback' | 'results'>('question');

  const currentQ = quest.questions[questionIdx];

  const choose = (opt: TriviaOption) => {
    if (phase !== 'question') return;
    setSelected(opt);
    if (opt.isCorrect) setScore((s) => s + 1);
    setPhase('feedback');
  };

  const next = () => {
    const nextIdx = questionIdx + 1;
    if (nextIdx >= quest.questions.length) {
      setPhase('results');
    } else {
      setQuestionIdx(nextIdx);
      setSelected(null);
      setPhase('question');
    }
  };

  if (phase === 'results') {
    const tier = quest.scoreTiers.find((t) => score >= t.minScore)!;
    return (
      <VictoryScreen
        title={tier.title}
        body={tier.body}
        onClaim={onVictory}
      />
    );
  }

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Progress */}
      <div
        style={{
          display:       'flex',
          justifyContent: 'space-between',
          fontFamily:    'var(--font-pixel)',
          fontSize:      '0.28rem',
          color:         'rgba(244,228,188,0.4)',
          letterSpacing: '0.06em',
        }}
      >
        <span>QUESTION {questionIdx + 1} / {quest.questions.length}</span>
        <span>SCORE: {score}</span>
      </div>

      {/* Question */}
      <div
        style={{
          fontFamily:   'var(--font-body)',
          fontStyle:    'italic',
          fontSize:     '1.05rem',
          color:        'rgba(244,228,188,0.9)',
          lineHeight:   1.6,
          padding:      '12px 16px',
          border:       '1px solid rgba(201,168,76,0.2)',
          borderRadius: 6,
          background:   'rgba(255,255,255,0.03)',
        }}
      >
        {currentQ.question}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {currentQ.options.map((opt, i) => {
          let borderColor = 'rgba(201,168,76,0.35)';
          let background  = 'rgba(201,168,76,0.05)';
          if (phase === 'feedback' && selected) {
            if (opt === selected) {
              borderColor = opt.isCorrect ? '#2da091' : '#cc2222';
              background  = opt.isCorrect ? 'rgba(45,160,145,0.15)' : 'rgba(204,34,34,0.15)';
            } else if (opt.isCorrect) {
              borderColor = '#2da091';
              background  = 'rgba(45,160,145,0.08)';
            }
          }
          return (
            <button
              key={i}
              className="quest-choice-btn"
              disabled={phase === 'feedback'}
              onClick={() => choose(opt)}
              style={{ borderColor, background }}
            >
              {String.fromCharCode(65 + i)}) {opt.label}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {phase === 'feedback' && selected && (
        <div
          style={{
            display:       'flex',
            flexDirection: 'column',
            gap:           10,
            animation:     'fade-in 0.2s ease',
          }}
        >
          <div
            style={{
              fontFamily:   'var(--font-pixel)',
              fontSize:     '0.3rem',
              color:        selected.isCorrect ? '#2da091' : '#cc8822',
              letterSpacing: '0.06em',
              lineHeight:   1.8,
              padding:      '8px 12px',
              borderLeft:   `2px solid ${selected.isCorrect ? '#2da091' : '#cc4422'}`,
            }}
          >
            {selected.responseText}
          </div>
          <button
            className="quest-choice-btn"
            onClick={next}
            style={{
              borderColor: 'rgba(201,168,76,0.6)',
              color:       'var(--color-gold)',
              textAlign:   'center',
            }}
          >
            {questionIdx + 1 < quest.questions.length ? 'Next →' : 'See Results →'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Portal Quest ─────────────────────────────────────────────────

function PortalQuestView({
  quest,
  onVictory,
}: {
  quest:     PortalQuest;
  onVictory: (greeting: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  if (selected) {
    return (
      <VictoryScreen
        title="Identity Verified"
        body={selected}
        onClaim={() => onVictory(selected)}
      />
    );
  }

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          fontFamily:    'var(--font-pixel)',
          fontSize:      '0.4rem',
          color:         'var(--color-gold)',
          letterSpacing: '0.1em',
          textAlign:     'center',
          padding:       '14px 0',
        }}
      >
        {quest.prompt}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {quest.options.map((opt, i) => (
          <button
            key={i}
            className="quest-choice-btn"
            onClick={() => setSelected(opt.greeting)}
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main QuestModal ───────────────────────────────────────────────

export default function QuestModal({ quest, onComplete, onSkip }: QuestModalProps) {
  const enemyIcon = quest.type === 'portal'
    ? quest.sentinelIcon
    : quest.enemyIcon;
  const enemyName = quest.type === 'portal'
    ? quest.sentinelName
    : quest.enemyName;
  const maxHp = quest.type === 'combat' ? quest.enemyMaxHp : 0;

  return (
    <div
      className="quest-backdrop"
      // Clicking the backdrop does NOT close — player must choose yield
    >
      <div className="quest-modal">
        {/* Enemy header */}
        <EnemyHeader icon={enemyIcon} name={enemyName} hp={maxHp} maxHp={maxHp} />

        {/* Quest meta */}
        <div
          style={{
            padding:      '14px 20px 0',
            flexShrink:   0,
          }}
        >
          <div
            style={{
              fontFamily:    'var(--font-display)',
              fontWeight:    700,
              fontSize:      '1.2rem',
              color:         'var(--color-gold)',
              marginBottom:  6,
            }}
          >
            {quest.questTitle}
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontStyle:  'italic',
              fontSize:   '0.88rem',
              lineHeight: 1.6,
              color:      'rgba(244,228,188,0.7)',
              margin:     0,
            }}
          >
            {quest.preamble}
          </p>
        </div>

        {/* Separator */}
        <div
          style={{
            height:     1,
            margin:     '12px 20px 0',
            background: 'rgba(201,168,76,0.2)',
            flexShrink: 0,
          }}
        />

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {quest.type === 'combat' && (
            <CombatQuestView
              quest={quest}
              onVictory={() => onComplete(quest.id)}
            />
          )}
          {quest.type === 'trivia' && (
            <TriviaQuestView
              quest={quest}
              onVictory={() => onComplete(quest.id)}
            />
          )}
          {quest.type === 'portal' && (
            <PortalQuestView
              quest={quest}
              onVictory={(greeting) => onComplete(quest.id, greeting)}
            />
          )}
        </div>

        {/* Yield footer */}
        <div
          style={{
            padding:       '10px 20px 14px',
            borderTop:     '1px solid rgba(201,168,76,0.12)',
            display:       'flex',
            justifyContent: 'center',
            flexShrink:    0,
          }}
        >
          <button
            className="quest-yield-btn"
            onClick={() => onSkip(quest.id)}
          >
            🏳 Yield — open records without glory
          </button>
        </div>
      </div>
    </div>
  );
}
