import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
  maxHeight?: string;
}

export default function ParchmentPanel({
  title,
  subtitle,
  onClose,
  children,
  width = 'min(860px, 96vw)',
  maxHeight = 'min(88vh, 820px)',
}: Props) {
  return (
    <div
      className="panel-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="parchment"
        style={{
          width,
          maxHeight,
          display: 'flex',
          flexDirection: 'column',
          animation: 'panel-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="panel-header">
          <div>
            <h2 className="panel-title">{title}</h2>
            {subtitle && <span className="panel-subtitle">{subtitle}</span>}
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close panel">
            ✕
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px 24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
