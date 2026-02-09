# Charlie Conner - Portfolio

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev)

A portfolio site built with React, Tailwind CSS 4, and Vite. Features magnetic tilt cards, a built-in terminal, scroll-reveal animations, and an expandable card system with cross-fade transitions.

**Live site**: [charlieconner.com](https://charlieconner.com)

## Getting Started

```bash
git clone https://github.com/charliec2004/portfoilo-site.git
cd portfoilo-site
npm install
npm run dev
```

## Tech Stack

- **Framework**: React 19
- **Styling**: Tailwind CSS 4 (CSS-first `@theme` config)
- **Build**: Vite 7
- **Deployment**: GitHub Actions → GitHub Pages
- **Fonts**: Inter, Merriweather

## Project Structure

```text
src/
├── assets/              # Images, icons, skill SVGs
├── components/
│   ├── cards/           # AboutCard, ProfileCard, SkillsCard, etc.
│   ├── layout/          # MainGrid, LeftColumn, RightColumn
│   ├── Terminal.jsx     # Built-in terminal (press ` to open)
│   ├── Cursor.jsx       # Custom cursor
│   └── FilmGrain.jsx    # Film grain overlay
├── data/                # Projects, skills data
├── hooks/               # Tilt, animations, terminal, GitHub API
├── app.css              # Theme tokens, custom utilities
└── App.jsx              # Root layout
```

## Contact

- Email: [charlieconner04@gmail.com](mailto:charlieconner04@gmail.com)
- LinkedIn: [charles-conner04](https://linkedin.com/in/charles-conner04)
- GitHub: [charliec2004](https://github.com/charliec2004)
