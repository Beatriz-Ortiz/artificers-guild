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
  href: string;
  label: string;
  sublabel: string;
  icon: string;
  download?: boolean;
}) {
  return (
    <a
      href={href}
      target={download ? '_self' : '_blank'}
      rel="noreferrer"
      download={download}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 16px',
        border: '1px solid rgba(201, 168, 76, 0.4)',
        borderRadius: 6,
        background: 'rgba(201, 168, 76, 0.06)',
        textDecoration: 'none',
        color: 'var(--color-text)',
        transition: 'background 0.15s, border-color 0.15s',
        fontFamily: 'var(--font-body)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(201, 168, 76, 0.14)';
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-gold)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(201, 168, 76, 0.06)';
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(201, 168, 76, 0.4)';
      }}
    >
      <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{label}</div>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.32rem',
            color: 'var(--color-text-muted)',
            marginTop: 3,
          }}
        >
          {sublabel}
        </div>
      </div>
    </a>
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
      {/* Animated magic circle backdrop */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          paddingTop: 8,
        }}
      >
        {/* Decorative rotating ring */}
        <div
          style={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 220,
            height: 220,
            borderRadius: '50%',
            border: '1px solid rgba(201, 168, 76, 0.15)',
            boxShadow: '0 0 30px rgba(65, 105, 225, 0.08)',
            pointerEvents: 'none',
            animation: 'portal-spin 20s linear infinite',
          }}
        />

        {/* Bio block */}
        <blockquote
          style={{
            margin: 0,
            padding: '14px 18px',
            border: 'none',
            borderLeft: '3px solid var(--color-gold)',
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontSize: '0.9rem',
            lineHeight: 1.65,
            color: 'var(--color-text)',
            background: 'rgba(201, 168, 76, 0.06)',
            borderRadius: '0 6px 6px 0',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {contact.bio}
        </blockquote>

        {/* Contact links */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            width: '100%',
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
