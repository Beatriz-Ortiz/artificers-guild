interface Props {
  name: string;
  title: string;
  onRecruiterMode: () => void;
}

export default function HubOverlay({ name, title, onRecruiterMode }: Props) {
  return (
    <>
      {/* Bottom status bar */}
      <div className="hub-bar">
        <span className="hub-bar-name">{name}</span>
        <span className="hub-bar-sep">·</span>
        <span className="hub-bar-title">{title}</span>
        <span className="hub-bar-sep">·</span>
        <span className="hub-bar-hint">Seek knowledge within these halls</span>
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
