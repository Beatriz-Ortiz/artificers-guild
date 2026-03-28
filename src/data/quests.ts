import type { PanelId } from '../types/cv';

export type QuestType = 'combat' | 'trivia' | 'portal';

// ── Combat ──────────────────────────────────────────────────────

export interface CombatChoice {
  label:      string;
  flavorText: string; // shown after picking — reaction from the enemy
}

export interface CombatRound {
  prompt:  string;        // HR question text
  choices: CombatChoice[];
}

export interface CombatQuest {
  id:          PanelId;
  type:        'combat';
  questTitle:  string;
  preamble:    string;
  enemyName:   string;
  enemyIcon:   string;
  enemyMaxHp:  number;
  rounds:      CombatRound[]; // length must equal enemyMaxHp
  victoryText: string;
}

// ── Trivia ──────────────────────────────────────────────────────

export interface TriviaOption {
  label:        string;
  isCorrect:    boolean;
  responseText: string; // immediate feedback line
}

export interface TriviaQuestion {
  question: string;
  options:  TriviaOption[];
}

export interface ScoreTier {
  minScore: number;
  title:    string;
  body:     string;
}

export interface TriviaQuest {
  id:          PanelId;
  type:        'trivia';
  questTitle:  string;
  preamble:    string;
  enemyName:   string;
  enemyIcon:   string;
  questions:   TriviaQuestion[];
  scoreTiers:  ScoreTier[]; // sorted descending; first match wins
}

// ── Portal identity check ───────────────────────────────────────

export interface PortalOption {
  label:    string;
  icon:     string;
  greeting: string; // personalised result text
}

export interface PortalQuest {
  id:           PanelId;
  type:         'portal';
  questTitle:   string;
  preamble:     string;
  sentinelName: string;
  sentinelIcon: string;
  prompt:       string;
  options:      PortalOption[];
}

// ── Union ───────────────────────────────────────────────────────

export type Quest = CombatQuest | TriviaQuest | PortalQuest;

// ── Quest content ───────────────────────────────────────────────

const guildHallQuest: CombatQuest = {
  id:         'quests',
  type:       'combat',
  questTitle: 'Face the Interview Panel',
  preamble:   "To access the Guild's Quest Records you must first defeat the HR Golem — an ancient automaton powered by boilerplate questions and the souls of rejected candidates.",
  enemyName:  'HR Golem',
  enemyIcon:  '🤖',
  enemyMaxHp: 3,
  victoryText: 'The HR Golem crumbles into a pile of outdated job descriptions. The Guild Hall is yours.',
  rounds: [
    {
      prompt: '"Tell me about yourself."',
      choices: [
        {
          label:      'I\'m a passionate team player who gives 110%.',
          flavorText: 'The Golem nods, already half-asleep. Familiar damage.',
        },
        {
          label:      'My GitHub history speaks louder than words.',
          flavorText: 'The Golem frantically opens a browser tab. Unexpected hit.',
        },
        {
          label:      'I built a CV as a video game. You\'re currently inside it.',
          flavorText: 'The Golem experiences a recursive existential crisis. Critical hit.',
        },
      ],
    },
    {
      prompt: '"What is your greatest weakness?"',
      choices: [
        {
          label:      'Perfectionism, if I\'m being honest.',
          flavorText: 'The Golem has heard this 47,000 times. Weary damage.',
        },
        {
          label:      'CSS specificity and timeline estimation.',
          flavorText: 'A rare honest answer. The Golem staggers.',
        },
        {
          label:      'Underestimating how long things take.',
          flavorText: 'Self-awareness detected. The Golem cannot compute.',
        },
      ],
    },
    {
      prompt: '"Where do you see yourself in five years?"',
      choices: [
        {
          label:      'In a senior role, mentoring others.',
          flavorText: 'Textbook answer. The Golem crumbles from sheer boredom.',
        },
        {
          label:      'Maintaining code I wrote today, probably.',
          flavorText: 'Too real. The Golem cannot recover from this truth.',
        },
        {
          label:      'Still debugging this animation, honestly.',
          flavorText: 'The Golem respects the honesty. Final blow lands.',
        },
      ],
    },
  ],
};

const spellbookQuest: TriviaQuest = {
  id:        'skills',
  type:      'trivia',
  questTitle: 'The Sphinx of Syntax',
  preamble:  'The Sphinx guards the Spellbook with three questions. Answer with wisdom. Or just guess — she has seen it all.',
  enemyName: 'Sphinx of Syntax',
  enemyIcon: '🦁',
  questions: [
    {
      question: 'In CSS, what does the "C" stand for?',
      options: [
        { label: 'Cascading',   isCorrect: true,  responseText: 'Correct. The Sphinx blinks — few remember the origin.' },
        { label: 'Colorful',    isCorrect: false, responseText: 'Bold. At least CSS can be colorful. The Sphinx sighs.' },
        { label: 'Complicated', isCorrect: false, responseText: 'Technically not wrong. The Sphinx is amused.' },
      ],
    },
    {
      question: "What does `console.log('1' + 1)` output in JavaScript?",
      options: [
        { label: '2',                                    isCorrect: false, responseText: 'Ah, you assumed reason. Welcome to JavaScript.' },
        { label: '"11"',                                 isCorrect: true,  responseText: 'Correct. Type coercion strikes again. The Sphinx winces.' },
        { label: 'TypeError: cannot add string + number', isCorrect: false, responseText: 'Reasonable for a sane language. This is JS.' },
      ],
    },
    {
      question: 'You should use `git commit --amend` when:',
      options: [
        { label: 'Fixing a typo in the last commit before pushing', isCorrect: true,  responseText: 'Precisely. The Sphinx yields with a bow.' },
        { label: 'You pushed wrong code to main',                   isCorrect: false, responseText: 'NEVER amend published history. The Sphinx clutches its chest.' },
        { label: 'Starting fresh on a project',                     isCorrect: false, responseText: 'That is not what amend does. The Sphinx takes a deep breath.' },
      ],
    },
  ],
  scoreTiers: [
    { minScore: 3, title: 'Grand Archmage',  body: 'The Sphinx bows deeply. These halls were made for you.' },
    { minScore: 2, title: 'Adept',           body: 'The Sphinx is impressed. Only one stumble.' },
    { minScore: 1, title: 'Apprentice',      body: 'The Sphinx yields, but raises an eyebrow. Keep studying.' },
    { minScore: 0, title: 'Chaotic Neutral', body: 'The Sphinx admires your confidence. The Spellbook opens for your energy alone.' },
  ],
};

const forgeQuest: TriviaQuest = {
  id:        'projects',
  type:      'trivia',
  questTitle: 'The Scope Creep Demon',
  preamble:  'The Scope Creep Demon lurks at the Forge, whispering "just one more feature" into the ears of engineers since time immemorial.',
  enemyName: 'Scope Creep Demon',
  enemyIcon: '👿',
  questions: [
    {
      question: 'The client says "it\'s just a small change" — 1 day before launch. You:',
      options: [
        { label: 'Add it. The client is always right.',
          isCorrect: false,
          responseText: 'Three hours later it\'s a complete redesign. We\'ve all been there.' },
        { label: 'Estimate the impact, negotiate scope, and document the decision.',
          isCorrect: true,
          responseText: 'A senior move. The Demon recoils from your project management wisdom.' },
        { label: 'Accidentally close the Slack tab and repeat until launch.',
          isCorrect: false,
          responseText: 'This works more often than it should. The Demon takes damage from laughter.' },
      ],
    },
    {
      question: 'The designer delivers mockups at 5pm on Friday. Sprint ends Monday. You:',
      options: [
        { label: 'Stay until it\'s done. We ship on Monday.',
          isCorrect: false,
          responseText: 'Your dedication is admirable. Your burnout is inevitable.' },
        { label: 'Scope it for next sprint, inform stakeholders, and rest.',
          isCorrect: true,
          responseText: 'Sustainable engineering. The Demon screams and retreats.' },
        { label: 'Update your LinkedIn. Just in case.',
          isCorrect: false,
          responseText: 'Preparation is wisdom. The Demon pauses, unsure how to respond.' },
      ],
    },
    {
      question: 'The codebase has zero tests and you need to refactor. You:',
      options: [
        { label: 'Refactor boldly. Tests are for the weak.',
          isCorrect: false,
          responseText: 'Weeks later, production is different. Not better. Different.' },
        { label: 'Write characterisation tests first, then refactor safely.',
          isCorrect: true,
          responseText: 'This is the way. The Demon dissolves, hissing.' },
        { label: 'Write the tests afterward — same thing.',
          isCorrect: false,
          responseText: 'The Demon laughs, then cries, then laughs again.' },
      ],
    },
  ],
  scoreTiers: [
    { minScore: 3, title: 'Master Craftsperson', body: 'The Demon flees before your process excellence. The Forge is yours.' },
    { minScore: 2, title: 'Experienced',         body: 'The Demon respects you enough to leave. Access granted.' },
    { minScore: 1, title: 'Still Learning',      body: 'The Demon retreats, but takes notes for next time. Forge open.' },
    { minScore: 0, title: 'Chaotic Solidarity',  body: 'The Demon is strangely comforted. "We are the same," it whispers, then vanishes.' },
  ],
};

const portalQuest: PortalQuest = {
  id:           'contact',
  type:         'portal',
  questTitle:   'The Spam Filter Sentinel',
  preamble:     'Before the portal may open, one question must be answered. The Sentinel has seen too many automated crawlers to take chances.',
  sentinelName: 'Spam Filter Sentinel',
  sentinelIcon: '🔐',
  prompt:       'AUTHENTICATE YOUR INTENT, TRAVELLER.',
  options: [
    {
      label:    'I am a recruiter, seeking skilled artificers.',
      icon:     '💼',
      greeting: 'A patron! The Sentinel steps aside at once. The artificer has been expecting you.',
    },
    {
      label:    'I am a developer, here for the Phaser source code.',
      icon:     '🧑‍💻',
      greeting: 'A kindred spirit! The repository lives on GitHub. You are most welcome here.',
    },
    {
      label:    'I am lost, and this is the most interesting thing I have found.',
      icon:     '🗺️',
      greeting: 'The Sentinel respects the honesty. All wanderers are welcome in these halls.',
    },
  ],
};

export const QUESTS: Record<PanelId, Quest> = {
  quests:   guildHallQuest,
  skills:   spellbookQuest,
  projects: forgeQuest,
  contact:  portalQuest,
};
