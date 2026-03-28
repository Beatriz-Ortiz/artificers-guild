import { useRef, useState } from 'react';
import ParchmentPanel from '../shared/ParchmentPanel';
import type { ContactInfo } from '../../types/cv';

interface Props {
  contact: ContactInfo;
  onClose: () => void;
}

function ContactLink({
  href,
  label,
  sublabel,
  icon,
  download,
}: {
  href:      string;
  label:     string;
  sublabel:  string;
  icon:      string;
  download?: boolean;
}) {
  return (
    <a
      href={href}
      target={download ? '_self' : '_blank'}
      rel="noreferrer"
      download={download}
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            14,
        padding:        '12px 16px',
        border:         '1px solid rgba(201, 168, 76, 0.4)',
        borderRadius:   6,
        background:     'rgba(201, 168, 76, 0.06)',
        textDecoration: 'none',
        color:          'var(--color-text)',
        transition:     'background 0.15s, border-color 0.15s',
        fontFamily:     'var(--font-body)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background    = 'rgba(201, 168, 76, 0.14)';
        (e.currentTarget as HTMLAnchorElement).style.borderColor   = 'var(--color-gold)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background    = 'rgba(201, 168, 76, 0.06)';
        (e.currentTarget as HTMLAnchorElement).style.borderColor   = 'rgba(201, 168, 76, 0.4)';
      }}
    >
      <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{label}</div>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize:   '0.32rem',
            color:      'var(--color-text-muted)',
            marginTop:  3,
          }}
        >
          {sublabel}
        </div>
      </div>
    </a>
  );
}

function getRollMessage(roll: number): string {
  if (roll === 1)  return "A fumble. Your message has been sent to an alternate dimension.";
  if (roll <= 5)   return "The ravens are sluggish. Your missive travels by mundane post.";
  if (roll <= 11)  return "A decent sending. The artificer should receive word within a moon's turn.";
  if (roll <= 17)  return "A strong connection! Your presence is felt from afar.";
  if (roll <= 19)  return "Critical! The Weave carries your words with urgency.";
  return "Natural 20! An immediate response is foretold. The artificer is already typing.";
}

function getRollColor(roll: number): string {
  if (roll === 1)  return '#8b0000';
  if (roll <= 5)   return '#7a6a5a';
  if (roll <= 11)  return 'var(--color-text-muted)';
  if (roll <= 17)  return 'var(--color-gold)';
  if (roll <= 19)  return '#2da091';
  return '#ff8000';
}

function CharismaRoll() {
  const [displayVal, setDisplayVal] = useState<number | null>(null);
  const [finalRoll,  setFinalRoll]  = useState<number | null>(null);
  const [rolling,    setRolling]    = useState(false);
  const frameRef = useRef(0);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setFinalRoll(null);
    frameRef.current = 0;
    const total  = 22; // animation frames
    const result = Math.floor(Math.random() * 20) + 1;

    const tick = setInterval(() => {
      frameRef.current++;
      // Slow down near the end
      setDisplayVal(Math.floor(Math.random() * 20) + 1);
      if (frameRef.current >= total) {
        clearInterval(tick);
        setDisplayVal(result);
        setFinalRoll(result);
        setRolling(false);
      }
    }, 65);
  };

  const isNat20 = finalRoll === 20;

  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            10,
        padding:        '14px 16px',
        border:         `1px solid rgba(201, 168, 76, ${finalRoll ? 0.5 : 0.25})`,
        borderRadius:   8,
        background:     finalRoll ? 'rgba(201, 168, 76, 0.06)' : 'rgba(0,0,0,0.04)',
        marginBottom:   4,
        transition:     'border-color 0.2s',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontFamily:    'var(--font-pixel)',
          fontSize:      '0.34rem',
          color:         'var(--color-text-muted)',
          letterSpacing: '0.1em',
        }}
      >
        CAST SENDING
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* d20 face */}
        <div
          style={{
            width:        52,
            height:       52,
            border:       `2px solid ${isNat20 ? '#ff8000' : 'var(--color-gold)'}`,
            borderRadius: 8,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            fontFamily:   'var(--font-display)',
            fontWeight:   700,
            fontSize:     displayVal !== null ? '1.5rem' : '1.2rem',
            color:        isNat20 ? '#ff8000' : 'var(--color-gold)',
            background:   isNat20 ? 'rgba(255,128,0,0.12)' : 'rgba(201,168,76,0.1)',
            boxShadow:    isNat20 ? '0 0 12px rgba(255,128,0,0.45)' : 'none',
            transition:   'all 0.2s',
            flexShrink:   0,
          }}
        >
          {displayVal ?? '?'}
        </div>

        {/* Result message or roll button */}
        {finalRoll !== null ? (
          <div>
            <div
              style={{
                fontFamily:  'var(--font-body)',
                fontStyle:   'italic',
                fontSize:    '0.88rem',
                lineHeight:  1.5,
                color:       getRollColor(finalRoll),
                maxWidth:    240,
              }}
            >
              {getRollMessage(finalRoll)}
            </div>
            <button
              onClick={roll}
              style={{
                marginTop:   8,
                background:  'none',
                border:      'none',
                cursor:      'pointer',
                fontFamily:  'var(--font-pixel)',
                fontSize:    '0.28rem',
                color:       'var(--color-text-muted)',
                padding:     0,
                textDecoration: 'underline',
              }}
            >
              🎲 reroll
            </button>
          </div>
        ) : (
          <button
            onClick={roll}
            disabled={rolling}
            style={{
              background:   'none',
              border:       '1px solid rgba(201,168,76,0.5)',
              borderRadius: 5,
              cursor:       rolling ? 'default' : 'pointer',
              fontFamily:   'var(--font-display)',
              fontSize:     '0.85rem',
              fontWeight:   600,
              color:        rolling ? 'var(--color-text-muted)' : 'var(--color-text)',
              padding:      '8px 18px',
              transition:   'all 0.15s',
            }}
          >
            {rolling ? 'Rolling…' : '🎲 Roll for Charisma'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PortalPanel({ contact, onClose }: Props) {
  return (
    <ParchmentPanel
      title="The Portal"
      subtitle="ESTABLISH CONTACT"
      onClose={onClose}
      width="min(520px, 96vw)"
    >
      <div
        style={{
          position:       'relative',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          gap:            16,
          paddingTop:     8,
        }}
      >
        {/* Decorative rotating ring */}
        <div
          style={{
            position:     'absolute',
            top:          -20,
            left:         '50%',
            transform:    'translateX(-50%)',
            width:        220,
            height:       220,
            borderRadius: '50%',
            border:       '1px solid rgba(201, 168, 76, 0.15)',
            boxShadow:    '0 0 30px rgba(65, 105, 225, 0.08)',
            pointerEvents: 'none',
            animation:    'portal-spin 20s linear infinite',
          }}
        />

        {/* Bio block */}
        <blockquote
          style={{
            margin:       0,
            padding:      '14px 18px',
            border:       'none',
            borderLeft:   '3px solid var(--color-gold)',
            fontFamily:   'var(--font-body)',
            fontStyle:    'italic',
            fontSize:     '0.9rem',
            lineHeight:   1.65,
            color:        'var(--color-text)',
            background:   'rgba(201, 168, 76, 0.06)',
            borderRadius: '0 6px 6px 0',
            width:        '100%',
            boxSizing:    'border-box',
          }}
        >
          {contact.bio}
        </blockquote>

        {/* Roll for Charisma */}
        <div style={{ width: '100%' }}>
          <CharismaRoll />
        </div>

        {/* Contact links */}
        <div
          style={{
            display:       'flex',
            flexDirection: 'column',
            gap:           8,
            width:         '100%',
          }}
        >
          <ContactLink
            href={`mailto:${contact.email}`}
            label="Send a Raven"
            sublabel={contact.email.toUpperCase()}
            icon="🪶"
          />
          <ContactLink
            href={contact.linkedIn}
            label="Guild Network"
            sublabel="LINKEDIN"
            icon="⚜️"
          />
          <ContactLink
            href={contact.github}
            label="Arcane Repository"
            sublabel="GITHUB"
            icon="📜"
          />
          <ContactLink
            href={contact.cvPdfPath}
            label="Request Credentials Scroll"
            sublabel="DOWNLOAD PDF"
            icon="🗒️"
            download
          />
        </div>
      </div>

      {/* Inline keyframe for portal ring spin */}
      <style>{`
        @keyframes portal-spin {
          from { transform: translateX(-50%) rotate(0deg); }
          to   { transform: translateX(-50%) rotate(360deg); }
        }
      `}</style>
    </ParchmentPanel>
  );
}
