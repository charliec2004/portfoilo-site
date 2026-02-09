export const SKILLS = [
  // Languages
  { file: 'html.svg', name: 'HTML', tooltip: 'Semantic markup, accessibility', category: 'Languages' },
  { file: 'css.svg', name: 'CSS', tooltip: 'Responsive design, animations', category: 'Languages' },
  { file: 'javascript.svg', name: 'JavaScript', tooltip: 'Vanilla JS, DOM, ES modules', category: 'Languages' },
  { file: 'typescript.svg', name: 'TypeScript', tooltip: 'Type-safe JavaScript development', category: 'Languages' },
  { file: 'python.svg', name: 'Python', tooltip: 'ML projects, data analysis', category: 'Languages' },
  { file: 'java.svg', name: 'Java', tooltip: 'OOP, data structures', category: 'Languages' },
  { file: 'cpp.svg', name: 'C++', tooltip: 'Systems programming, algorithms', category: 'Languages' },

  // Frameworks
  { file: 'react.svg', name: 'React', tooltip: 'Component-driven UI development', category: 'Frameworks' },
  { file: 'tailwind.svg', name: 'Tailwind', tooltip: 'Utility-first CSS framework', category: 'Frameworks' },
  { file: 'nodejs.svg', name: 'Node.js', tooltip: 'Server-side JavaScript runtime', category: 'Frameworks' },
  { file: 'vite.svg', name: 'Vite', tooltip: 'Fast frontend build tooling', category: 'Frameworks' },

  // Tools
  { file: 'git.svg', name: 'Git', tooltip: 'Version control, branching', category: 'Tools' },
  { file: 'npm.svg', name: 'npm', tooltip: 'Package management, scripts', category: 'Tools' },
  { file: 'figma.svg', name: 'Figma', tooltip: 'UI design, prototyping', category: 'Tools' },
];

export const SKILL_CATEGORIES = ['Languages', 'Frameworks', 'Tools'];

// Organic blob shapes for skill badge backgrounds
// Each entry: border-radius CSS value + rotation in degrees
export const BADGE_SHAPES = [
  { borderRadius: '50% 40% 55% 45% / 45% 55% 40% 50%', rotate: -3 },
  { borderRadius: '45% 55% 40% 50% / 50% 40% 55% 45%', rotate: 2 },
  { borderRadius: '55% 45% 50% 40% / 40% 50% 45% 55%', rotate: -1 },
  { borderRadius: '40% 50% 45% 55% / 55% 45% 50% 40%', rotate: 4 },
  { borderRadius: '48% 52% 43% 57% / 53% 47% 52% 48%', rotate: -4 },
  { borderRadius: '52% 48% 57% 43% / 47% 53% 48% 52%', rotate: 1 },
  { borderRadius: '44% 56% 51% 49% / 49% 51% 56% 44%', rotate: -2 },
  { borderRadius: '56% 44% 49% 51% / 51% 49% 44% 56%', rotate: 3 },
  { borderRadius: '50% 45% 52% 48% / 48% 52% 45% 50%', rotate: -5 },
  { borderRadius: '46% 54% 48% 52% / 54% 46% 52% 48%', rotate: 5 },
  { borderRadius: '53% 47% 44% 56% / 46% 54% 47% 53%', rotate: 0 },
  { borderRadius: '47% 53% 56% 44% / 52% 48% 53% 47%', rotate: -3 },
  { borderRadius: '51% 49% 46% 54% / 50% 50% 49% 51%', rotate: 2 },
  { borderRadius: '49% 51% 54% 46% / 44% 56% 51% 49%', rotate: -1 },
];
