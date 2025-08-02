# Charlie Conner - Portfolio Website

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A modern, interactive portfolio website showcasing my skills, projects, and experience as a Computer Science student. Built with vanilla HTML, CSS, and JavaScript using BEM methodology for clean, maintainable styling.

## ✨ Features

- **Interactive Card System**: Expandable cards with smooth animations for detailed content viewing
- **Responsive Design**: Optimized for all screen sizes and devices  
- **Modern UI/UX**: Clean, professional design with intuitive navigation
- **BEM CSS Architecture**: Organized, maintainable CSS following Block Element Modifier methodology
- **Smooth Animations**: CSS transitions and JavaScript-powered interactions
- **Accessibility**: Semantic HTML and keyboard navigation support
- **Performance Optimized**: Lightweight vanilla JavaScript with no external dependencies

## 🚀 How to View the Site

### Local Development
1. **Clone the repository**
   ```bash
   git clone https://github.com/charliec2004/portfolio-site.git
   cd portfolio-site
   ```

2. **Open directly in browser**
   ```bash
   # Simply open the index.html file
   open index.html
   ```

3. **Or use a local server (recommended)**
   ```bash
   # Using Python (if installed)
   python -m http.server 8000
   
   # Using Node.js (if installed)
   npx serve .
   
   # Then visit http://localhost:8000
   ```

### Live Site
Visit: [charlieconner.com](https://charlieconner.com)

## 🎯 CSS Architecture

This project uses **BEM (Block Element Modifier)** methodology for CSS organization:

- **Blocks**: Independent, reusable components (e.g., `card`, `header`, `layout`)
- **Elements**: Parts of blocks that have no standalone meaning (e.g., `card__title`, `header__name`)  
- **Modifiers**: Variants of blocks or elements (e.g., `card--about`, `card--skills`)

## 🏗️ Project Structure

```
portfolio-site/
├── index.html                 # Main HTML file
├── styles/
│   ├── main.css              # Main stylesheet with imports
│   ├── base/                 # Base styles
│   │   ├── variables.css     # CSS custom properties
│   │   ├── reset.css         # CSS reset
│   │   └── typography.css    # Typography styles
│   ├── layout/               # Layout components
│   │   ├── page.css          # Page-level layout
│   │   └── grid.css          # Grid system
│   ├── components/           # UI components (BEM blocks)
│   │   ├── header.css        # Header block styles
│   │   ├── card.css          # Card block styles
│   │   ├── profile.css       # Profile block styles
│   │   ├── projects.css      # Projects block styles
│   │   ├── social.css        # Social links block styles
│   │   └── footer.css        # Footer block styles
│   └── utilities/            # Utility classes
│       ├── interactive.css   # Interactive states
│       ├── helpers.css       # Helper classes
│       └── overlay.css       # Overlay utility
├── js/
│   └── card-interactions.js  # Card interaction logic
├── assets/                   # Images and files only
│   ├── *.svg                 # SVG icons
│   ├── charlie.webp          # Profile image
│   ├── favicon.png           # Site favicon
│   └── Charles_Conner_Resume.pdf
└── README.md
```

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **CSS Methodology**: BEM (Block Element Modifier)
- **Fonts**: Inter, Merriweather (Google Fonts)
- **Icons**: Custom SVG icons
- **Animations**: CSS Transitions & Transforms
- **Architecture**: Modular CSS with CSS Custom Properties

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)  
- Safari (latest)
- Edge (latest)

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 📧 Contact

**Charles Conner**
- Email: [charlieconner04@gmail.com](mailto:charlieconner04@gmail.com)
- LinkedIn: [charles-conner04](https://linkedin.com/in/charles-conner04)
- GitHub: [charliec2004](https://github.com/charliec2004)

---

⭐ **If you found this project interesting, please consider giving it a star!**
