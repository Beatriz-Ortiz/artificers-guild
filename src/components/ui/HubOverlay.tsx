interface Props {
  name:           string;
  title:          string;
  hp:             number;
  mp:             number;
  konamiActive:   boolean;
  onRecruiterMode: () => void;
}

function StatBar({
  label,
  value,
  type,
}: {
  label: string;
  value: number;
  type: 'hp' | 'mp';
}) {
  const isCritical = type === 'hp' && value < 25;
  return (
    <div className="stat-bar-group">
      <span
        className={
          `stat-bar-label` +
          (type === 'hp'
            ? isCritical ? ' stat-bar-label--hp-critical' : ' stat-bar-label--hp'
            : ' stat-bar-label--mp')
        }
      >
        {label}
      </span>
      <div className="stat-bar-track">
        <div
          className={
            `stat-bar-fill` +
            (type === 'hp'
              ? isCritical ? ' stat-bar-fill--hp-critical' : ' stat-bar-fill--hp'
              : ' stat-bar-fill--mp')
          }
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function HubOverlay({ name, title, hp, mp, konamiActive, onRecruiterMode }: Props) {
  return (
    <>
      {/* Bottom status bar */}
      <div className={`hub-bar${konamiActive ? ' hub-bar--konami' : ''}`}>
        <span className="hub-bar-name">{name}</span>
        <span className="hub-bar-sep">·</span>
        <span className="hub-bar-title">{title}</span>
        <span className="hub-bar-sep">·</span>
        <span className="hub-bar-hint">
          {konamiActive ? '✦ The old codes still work ✦' : 'Seek knowledge within these halls'}
        </span>
      </div>

      {/* HP / MP mini-bars */}
      <div className="hp-mp-bars">
        <StatBar label="HP" value={hp} type="hp" />
        <StatBar label="MP" value={mp} type="mp" />
      </div>

      {/* Recruiter mode toggle — bottom left */}
      <button className="recruiter-btn" onClick={onRecruiterMode}>
        Reveal
        <br />
        True Form
      </button>
    </>
  );
}
