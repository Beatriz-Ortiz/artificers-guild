import type { CVData } from '../types/cv';

// ─────────────────────────────────────────────────────────────
//  Replace the placeholder values below with your real CV data
// ─────────────────────────────────────────────────────────────
const cv: CVData = {
  contact: {
    name: 'Beatriz Ortiz',
    title: 'Frontend Engineer',
    email: 'hello@beatrizortiz.dev',
    linkedIn: 'https://linkedin.com/in/beatriz-ortiz',
    github: 'https://github.com/beatriz-ortiz',
    cvPdfPath: '/cv.pdf',
    bio: 'A seasoned artificer of the digital realm, specialising in the transmutation of complex problems into elegant, accessible interfaces. Known throughout the guild for crafting experiences that users both trust and enjoy — and for leaving every codebase cleaner than she found it.',
  },

  experience: [
    {
      id: 'exp-1',
      company: 'Arcane Systems',
      role: 'Senior Frontend Engineer',
      startDate: '2022-03',
      endDate: null,
      location: 'Remote',
      description: [
        'Architected a React component design system adopted by 5 product teams.',
        'Led a migration from a legacy jQuery codebase to React, reducing bundle size by 40%.',
        'Established a frontend testing culture, raising coverage from 12% to 78%.',
        'Mentored 3 junior engineers through structured code reviews and pair programming.',
        'Drove accessibility improvements to WCAG AA compliance across all core flows.',
      ],
      skills: ['React', 'TypeScript', 'Design Systems', 'Testing', 'Accessibility'],
      guildRankIcon: '⚔️',
    },
    {
      id: 'exp-2',
      company: 'Guild of Makers',
      role: 'Frontend Engineer',
      startDate: '2020-01',
      endDate: '2022-02',
      location: 'Madrid, Spain',
      description: [
        'Built real-time collaboration features using WebSockets and React.',
        'Improved Core Web Vitals across the platform — LCP reduced by 2.1 s.',
        'Integrated third-party services including Stripe payments and Segment analytics.',
        'Delivered a responsive, internationalised marketing site from design to production.',
      ],
      skills: ['React', 'Node.js', 'WebSockets', 'Web Performance'],
      guildRankIcon: '🛡️',
    },
    {
      id: 'exp-3',
      company: 'Apprentice Workshop',
      role: 'Junior Developer',
      startDate: '2018-09',
      endDate: '2019-12',
      location: 'Barcelona, Spain',
      description: [
        'Developed and maintained marketing websites for 10+ clients.',
        'Built internal content-management tooling with Vue.js.',
      ],
      skills: ['Vue.js', 'JavaScript', 'CSS', 'WordPress'],
      guildRankIcon: '📜',
    },
  ],

  skills: [
    // Arcane Arts — Programming Languages
    { id: 'ts',   name: 'TypeScript',  level: 5, school: 'arcane' },
    { id: 'js',   name: 'JavaScript',  level: 5, school: 'arcane' },
    { id: 'css',  name: 'CSS / Sass',  level: 4, school: 'arcane' },
    { id: 'html', name: 'HTML',        level: 5, school: 'arcane' },
    { id: 'py',   name: 'Python',      level: 3, school: 'arcane' },

    // Transmutation — Frameworks & Libraries
    { id: 'react',  name: 'React',       level: 5, school: 'transmutation' },
    { id: 'nextjs', name: 'Next.js',     level: 4, school: 'transmutation' },
    { id: 'phaser', name: 'Phaser 3',    level: 3, school: 'transmutation' },
    { id: 'node',   name: 'Node.js',     level: 3, school: 'transmutation' },
    { id: 'vite',   name: 'Vite',        level: 4, school: 'transmutation' },

    // Divination — Tools & Platforms
    { id: 'git',    name: 'Git',             level: 5, school: 'divination' },
    { id: 'figma',  name: 'Figma',           level: 4, school: 'divination' },
    { id: 'docker', name: 'Docker',          level: 3, school: 'divination' },
    { id: 'gha',    name: 'GitHub Actions',  level: 3, school: 'divination' },

    // Enchantment — Methodologies
    { id: 'agile', name: 'Agile / Scrum',      level: 4, school: 'enchantment' },
    { id: 'tdd',   name: 'TDD',                level: 4, school: 'enchantment' },
    { id: 'a11y',  name: 'Accessibility',      level: 4, school: 'enchantment' },
    { id: 'perf',  name: 'Web Performance',    level: 4, school: 'enchantment' },
  ],

  projects: [
    {
      id: 'proj-1',
      name: "Artificer's Guild",
      tagline: 'An interactive D&D CV built with React + Phaser.',
      description:
        'A pixel-art RPG world that serves as a living portfolio. Users explore an interactive hub to discover professional experience, skills, and projects — all data-driven and responsive.',
      techStack: ['React', 'Phaser 3', 'TypeScript', 'Vite'],
      rarity: 'legendary',
      status: 'in-progress',
      githubUrl: 'https://github.com/beatriz-ortiz/artificers-guild',
    },
    {
      id: 'proj-2',
      name: 'Crystal Design System',
      tagline: 'A typed React component library powering 5 products.',
      description:
        'A fully typed component library with Storybook documentation, automated visual-regression testing via Chromatic, and a CSS-variable theming system. Maintained by 15+ engineers across 5 teams.',
      techStack: ['React', 'TypeScript', 'Storybook', 'Chromatic'],
      rarity: 'epic',
      status: 'completed',
      githubUrl: 'https://github.com/beatriz-ortiz/crystal-ds',
      liveUrl: 'https://crystal-ds.example.com',
    },
    {
      id: 'proj-3',
      name: 'Realtime Codex',
      tagline: 'A collaborative markdown editor with live cursors.',
      description:
        'End-to-end collaborative editing built on WebSockets and CRDTs (Yjs). Supports live-cursor presence, offline editing with sync on reconnect, and one-click export to PDF.',
      techStack: ['React', 'Node.js', 'WebSockets', 'Yjs'],
      rarity: 'rare',
      status: 'completed',
      githubUrl: 'https://github.com/beatriz-ortiz/realtime-codex',
    },
    {
      id: 'proj-4',
      name: 'Portal Analytics',
      tagline: 'Lightweight, privacy-first web analytics.',
      description:
        'A self-hosted analytics tool with no cookies and no fingerprinting. Displays page views, sessions, and conversion funnels. Built to be deployable on a $5 VPS.',
      techStack: ['Next.js', 'SQLite', 'Tailwind'],
      rarity: 'uncommon',
      status: 'archived',
      githubUrl: 'https://github.com/beatriz-ortiz/portal-analytics',
    },
  ],
};

export default cv;
