export type SkillLevel = 1 | 2 | 3 | 4 | 5;
export type SkillSchool = 'arcane' | 'transmutation' | 'divination' | 'enchantment';
export type ProjectRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ProjectStatus = 'completed' | 'in-progress' | 'archived';
export type PanelId = 'quests' | 'skills' | 'projects' | 'contact';

export const SKILL_LEVEL_NAMES: Record<SkillLevel, string> = {
  1: 'Apprentice',
  2: 'Journeyman',
  3: 'Adept',
  4: 'Expert',
  5: 'Archmage',
};

export const SKILL_SCHOOL_LABELS: Record<SkillSchool, { name: string; subtitle: string; icon: string }> = {
  arcane:        { name: 'Arcane Arts',   subtitle: 'Programming Languages',   icon: '✦' },
  transmutation: { name: 'Transmutation', subtitle: 'Frameworks & Libraries',  icon: '⚗' },
  divination:    { name: 'Divination',    subtitle: 'Tools & Platforms',        icon: '🔮' },
  enchantment:   { name: 'Enchantment',   subtitle: 'Methodologies',            icon: '✨' },
};

export const RARITY_COLORS: Record<ProjectRarity, string> = {
  common:    '#9d9d9d',
  uncommon:  '#1eff00',
  rare:      '#0070dd',
  epic:      '#a335ee',
  legendary: '#ff8000',
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  'completed':   'Masterwork',
  'in-progress': 'In Forging',
  'archived':    'Relic',
};

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;       // "2021-06"
  endDate: string | null;  // null = present
  location: string;
  description: string[];   // max 5 bullet points
  skills: string[];
  guildRankIcon: string;   // emoji
}

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  school: SkillSchool;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;         // shown on card front
  description: string;     // shown on card back
  techStack: string[];
  rarity: ProjectRarity;
  status: ProjectStatus;
  githubUrl?: string;
  liveUrl?: string;
}

export interface ContactInfo {
  name: string;
  title: string;
  email: string;
  linkedIn: string;
  github: string;
  cvPdfPath: string;
  bio: string;             // monster-manual style paragraph
}

export interface CVData {
  contact: ContactInfo;
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
}
