import type { CVData } from '../../types/cv';
import { SKILL_SCHOOL_LABELS } from '../../types/cv';

interface Props {
  data: CVData;
  onExit: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Present';
  const [year, month] = dateStr.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });
}

export default function RecruiterModeView({ data, onExit }: Props) {
  const { contact, experience, skills, projects } = data;

  const skillsBySchool = (['arcane', 'transmutation', 'divination', 'enchantment'] as const).map(
    (school) => ({
      school,
      label: SKILL_SCHOOL_LABELS[school],
      items: skills.filter((s) => s.school === school),
    })
  );

  return (
    <div className="recruiter-view">
      <button className="recruiter-back-btn" onClick={onExit}>
        ← Return to Guild
      </button>

      <div className="recruiter-inner">
        {/* Header */}
        <header style={{ marginBottom: 8 }}>
          <h1 className="recruiter-name">{contact.name}</h1>
          <p className="recruiter-title-line">
            {contact.title} · {contact.email} · {contact.linkedIn.replace('https://', '')}
          </p>
          <p
            style={{
              fontStyle: 'italic',
              fontSize: '0.9rem',
              color: '#5a4a3a',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {contact.bio}
          </p>
        </header>

        {/* Experience */}
        <section>
          <h2 className="recruiter-section-title">Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: 20 }}>
              <div className="recruiter-exp-company">
                {exp.guildRankIcon} {exp.company}
              </div>
              <div className="recruiter-exp-role">{exp.role}</div>
              <div className="recruiter-exp-dates">
                {formatDate(exp.startDate)} — {formatDate(exp.endDate)} · {exp.location}
              </div>
              <ul className="recruiter-exp-bullets">
                {exp.description.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {exp.skills.map((s) => (
                  <span className="recruiter-skill-tag" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Skills */}
        <section>
          <h2 className="recruiter-section-title">Skills</h2>
          {skillsBySchool.map(({ school, label, items }) => (
            <div key={school} style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  marginBottom: 4,
                  color: '#3a2a1a',
                }}
              >
                {label.name}
                <span
                  style={{ fontWeight: 400, fontSize: '0.8rem', color: '#7a6a5a', marginLeft: 6 }}
                >
                  ({label.subtitle})
                </span>
              </div>
              <div className="recruiter-skills-grid">
                {items.map((s) => (
                  <span className="recruiter-skill-tag" key={s.id}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Projects */}
        <section>
          <h2 className="recruiter-section-title">Projects</h2>
          {projects.map((p) => (
            <div key={p.id} style={{ marginBottom: 16 }}>
              <div className="recruiter-project-name">
                {p.name}{' '}
                <span
                  style={{ fontWeight: 400, fontSize: '0.8rem', color: '#7a6a5a' }}
                >
                  ({p.rarity} · {p.status})
                </span>
              </div>
              <div className="recruiter-project-desc">{p.description}</div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 4,
                  marginBottom: 6,
                }}
              >
                {p.techStack.map((t) => (
                  <span className="recruiter-skill-tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="recruiter-links">
                {p.githubUrl && (
                  <a href={p.githubUrl} target="_blank" rel="noreferrer" className="recruiter-link">
                    GitHub ↗
                  </a>
                )}
                {p.liveUrl && (
                  <a href={p.liveUrl} target="_blank" rel="noreferrer" className="recruiter-link">
                    Live Demo ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Contact */}
        <section>
          <h2 className="recruiter-section-title">Contact</h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: '0.9rem',
            }}
          >
            <div>
              📧{' '}
              <a href={`mailto:${contact.email}`} className="recruiter-link">
                {contact.email}
              </a>
            </div>
            <div>
              🔗{' '}
              <a href={contact.linkedIn} target="_blank" rel="noreferrer" className="recruiter-link">
                {contact.linkedIn}
              </a>
            </div>
            <div>
              📦{' '}
              <a href={contact.github} target="_blank" rel="noreferrer" className="recruiter-link">
                {contact.github}
              </a>
            </div>
            <div>
              📄{' '}
              <a href={contact.cvPdfPath} download className="recruiter-link">
                Download CV (PDF)
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
