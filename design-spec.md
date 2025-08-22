# Design Specification - Charlie Conner Portfolio

## BEM Architecture Overview

This portfolio website follows the **BEM (Block Element Modifier)** methodology for CSS organization, ensuring maintainable and scalable styling.

### BEM Naming Convention

- **Block**: Standalone component (`card`, `header`, `layout`)
- **Element**: Part of a block (`card__title`, `header__name`)
- **Modifier**: Variation of block/element (`card--about`, `card--skills`)

### Primary BEM Blocks

#### 1. `header` Block

- **Purpose**: Site navigation and identity
- **Elements**:
  - `header__identity` - Name and title section
  - `header__name` - Primary name display
  - `header__separator` - Visual separator
  - `header__title` - Role/subtitle
  - `header__nav` - Navigation container
- **Usage**: Contains site branding and navigation buttons

#### 2. `card` Block  

- **Purpose**: Content containers with interactive capabilities
- **Modifiers**:
  - `card--about` - About me information card
  - `card--skills` - Skills and tools showcase  
  - `card--contact` - Contact information card
  - `card--projects` - Projects listing card
  - `card--links` - Social media links card
  - `card--profile` - Profile image card
- **Elements**:
  - `card__header` - Card top section
  - `card__title` - Main card heading
  - `card__subtitle` - Secondary text
  - `card__content` - Main content area
  - `card__text` - Text content
  - `card__icon` - Icon containers
  - `card__icon-container` - Multiple icon wrapper
- **Usage**: All major content sections use card variants

#### 3. `layout` Block

- **Purpose**: Page structure and grid system
- **Elements**:
  - `layout__left` - Left column container
  - `layout__right` - Right column container
  - `layout__row` - Horizontal sections
- **Modifiers**:
  - `layout__row--top` - Upper row section
  - `layout__row--bottom` - Lower row section
- **Usage**: Controls overall page layout and responsive behavior

#### 4. `projects` Block

- **Purpose**: Project showcase functionality
- **Elements**:
  - `projects__list` - Container for all projects
  - `projects__item` - Individual project link
  - `projects__title` - Project name
  - `projects__arrow` - Visual indicator
  - `projects__underline` - Decorative element
- **Usage**: Displays GitHub project links with hover effects

#### 5. `profile` Block

- **Purpose**: Profile image display
- **Elements**:
  - `profile__image` - Main profile photo
- **Usage**: Handles responsive profile image sizing and display

#### 6. `social` Block

- **Purpose**: Social media links and separators
- **Elements**:
  - `social__link` - Clickable social links
  - `social__separator` - Visual dividers
- **Usage**: Footer social media navigation

### Utility Classes

Following BEM principles, utility classes use the `u-` prefix:

- `u-no-scroll` - Prevents scrolling overflow
- `u-flex-grow` - Flexible growing
- `u-flex-shrink` - Flexible shrinking  
- `u-visually-hidden` - Screen reader only content
- `u-dimmed` - Reduced opacity state

Text utilities use the `text--` modifier pattern:

- `text--nowrap` - Prevents text wrapping

### File Structure

The CSS is organized following ITCSS (Inverted Triangle CSS) principles:

```
styles/
├── base/          # Variables, reset, typography
├── layout/        # Page structure, grid system
├── components/    # BEM blocks (header, card, etc.)
└── utilities/     # Helper classes and overrides
```

### Assets Folder

The `/assets/` folder contains **only** images and files:

- SVG icons for skills and navigation
- Profile images (WebP format for performance)
- PDF resume file
- Favicon

**No CSS, JavaScript, or other code files are stored in assets** - this maintains clear separation of concerns between content and code.

### Responsive Design

The BEM blocks are designed mobile-first with three main breakpoints:

- Desktop: Full card-based layout
- Tablet (1210px): Stacked columns
- Mobile (770px): Single column, vertical stack

Each BEM block handles its own responsive behavior, making the system modular and maintainable.

### Interactive States

Interactive elements use consistent naming:

- `card--clone` - Expanded card state
- `overlay.active` - Background overlay state
- `skill-icon` - Animated skill icons

This BEM architecture ensures the portfolio remains maintainable, scalable, and easy to understand for future development.
