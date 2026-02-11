# Dronacharya Responsive Design System

Complete guide to the responsive design system implementation for Dronacharya learning platform.

## Table of Contents

- [Overview](#overview)
- [Breakpoints](#breakpoints)
- [Typography](#typography)
- [Spacing System](#spacing-system)
- [Grid System](#grid-system)
- [Container System](#container-system)
- [Utility Classes](#utility-classes)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Accessibility](#accessibility)

---

## Overview

The Dronacharya responsive design system is built on:

- **Mobile-first approach**: Design for 320px+ screens first, then enhance for larger devices
- **Fluid scaling**: Typography and spacing scale smoothly using CSS `clamp()`
- **CSS custom properties**: All tokens defined as CSS variables for consistency
- **Tailwind CSS 4**: Modern Tailwind with `@theme` directive integration
- **Performance**: Minimal CSS bundle, no JavaScript-based layouts

---

## Breakpoints

Standard breakpoints following mobile-first design:

| Name  | Min Width | Target Devices         | Prefix |
|-------|-----------|------------------------|--------|
| Base  | 320px     | Mobile phones          | -      |
| sm    | 640px     | Landscape phones       | `sm:`  |
| md    | 768px     | Tablets                | `md:`  |
| lg    | 1024px    | Desktops               | `lg:`  |
| xl    | 1280px    | Large desktops         | `xl:`  |
| 2xl   | 1536px    | Extra large screens    | `2xl:` |

### CSS Variables

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Usage with Tailwind

```html
<!-- Hide on mobile, show on tablet -->
<div class="hidden md:block">Tablet and up</div>

<!-- Full width on mobile, half on desktop -->
<div class="w-full lg:w-1/2">Responsive width</div>

<!-- Stack on mobile, grid on desktop -->
<div class="flex flex-col lg:grid lg:grid-cols-3">
  <!-- Content -->
</div>
```

---

## Typography

### Fluid Typography Scale

All font sizes scale fluidly between mobile and desktop using `clamp()`:

| Class           | Mobile | Desktop | Actual CSS                                     | Usage                    |
|-----------------|--------|---------|------------------------------------------------|--------------------------|
| `text-fluid-xs`   | 12px   | 14px    | `clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)`   | Captions, labels         |
| `text-fluid-sm`   | 14px   | 16px    | `clamp(0.875rem, 0.825rem + 0.25vw, 1rem)`    | Small text, metadata     |
| `text-fluid-base` | 16px   | 18px    | `clamp(1rem, 0.925rem + 0.375vw, 1.125rem)`   | Body text (default)      |
| `text-fluid-lg`   | 18px   | 20px    | `clamp(1.125rem, 1.025rem + 0.5vw, 1.25rem)`  | Emphasized text          |
| `text-fluid-xl`   | 20px   | 24px    | `clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)`     | Large text               |
| `text-fluid-2xl`  | 24px   | 32px    | `clamp(1.5rem, 1.3rem + 1vw, 2rem)`           | Sub-headings             |
| `text-fluid-3xl`  | 30px   | 40px    | `clamp(1.875rem, 1.6rem + 1.375vw, 2.5rem)`   | Section headings         |
| `text-fluid-4xl`  | 36px   | 48px    | `clamp(2.25rem, 1.875rem + 1.875vw, 3rem)`    | Page headings            |
| `text-fluid-5xl`  | 48px   | 64px    | `clamp(3rem, 2.4rem + 3vw, 4rem)`             | Hero text                |

### Semantic Heading Classes

Pre-configured heading styles with appropriate sizing, line-height, and letter-spacing:

| Class       | Font Size | Line Height | Letter Spacing | Font Weight | Usage |
|-------------|-----------|-------------|----------------|-------------|-------|
| `.heading-1` | 4xl (36-48px) | tight (1.25) | tight (-0.025em) | 700 | Page titles |
| `.heading-2` | 3xl (30-40px) | tight (1.25) | tight (-0.025em) | 600 | Section titles |
| `.heading-3` | 2xl (24-32px) | snug (1.375) | tight (-0.025em) | 600 | Subsections |
| `.heading-4` | xl (20-24px) | snug (1.375) | normal | 600 | Card headers |
| `.heading-5` | lg (18-20px) | normal (1.5) | normal | 600 | Small headers |
| `.heading-6` | base (16-18px) | normal (1.5) | normal | 600 | Inline headers |

### Line Heights

```css
--line-height-tight: 1.25;    /* Headings, titles */
--line-height-snug: 1.375;    /* Subheadings */
--line-height-normal: 1.5;    /* Body text */
--line-height-relaxed: 1.625; /* Long-form content */
--line-height-loose: 2;       /* Poetry, code */
```

### Letter Spacing

```css
--letter-spacing-tighter: -0.05em;
--letter-spacing-tight: -0.025em;  /* Headings */
--letter-spacing-normal: 0em;      /* Body text */
--letter-spacing-wide: 0.025em;
--letter-spacing-wider: 0.05em;
```

### Examples

```html
<!-- Fluid typography -->
<h1 class="text-fluid-4xl font-bold">Welcome to Dronacharya</h1>
<p class="text-fluid-base text-muted-foreground">Learn at your own pace</p>

<!-- Semantic headings -->
<h1 class="heading-1 gradient-text">Hero Title</h1>
<h2 class="heading-2">Section Title</h2>
<h3 class="heading-3">Subsection</h3>
```

---

## Spacing System

### Fluid Spacing Scale

All spacing tokens scale fluidly based on viewport width:

| Token          | Mobile | Desktop | CSS Variable        | Common Usage          |
|----------------|--------|---------|---------------------|-----------------------|
| `spacing-0`    | 0      | 0       | `--spacing-0`       | No spacing            |
| `spacing-px`   | 1px    | 1px     | `--spacing-px`      | Borders               |
| `spacing-0-5`  | 2px    | 2.4px   | `--spacing-0-5`     | Micro spacing         |
| `spacing-1`    | 4px    | 6px     | `--spacing-1`       | Tight spacing         |
| `spacing-2`    | 8px    | 12px    | `--spacing-2`       | Small gaps            |
| `spacing-3`    | 12px   | 16px    | `--spacing-3`       | Default spacing       |
| `spacing-4`    | 16px   | 24px    | `--spacing-4`       | Medium spacing        |
| `spacing-6`    | 24px   | 36px    | `--spacing-6`       | Large spacing         |
| `spacing-8`    | 32px   | 48px    | `--spacing-8`       | XL spacing            |
| `spacing-12`   | 48px   | 72px    | `--spacing-12`      | Section spacing       |
| `spacing-16`   | 64px   | 96px    | `--spacing-16`      | Large sections        |
| `spacing-24`   | 96px   | 144px   | `--spacing-24`      | Hero sections         |
| `spacing-32`   | 128px  | 192px   | `--spacing-32`      | XXL sections          |

### Gap Utilities

Responsive gap sizes for flex/grid layouts:

| Class          | Value           | Usage                    |
|----------------|-----------------|--------------------------|
| `.gap-fluid-xs` | spacing-2 (8-12px) | Tight grid/flex gaps    |
| `.gap-fluid-sm` | spacing-3 (12-16px) | Small gaps              |
| `.gap-fluid-md` | spacing-4 (16-24px) | Medium gaps (default)   |
| `.gap-fluid-lg` | spacing-6 (24-36px) | Large gaps              |
| `.gap-fluid-xl` | spacing-8 (32-48px) | XL gaps                 |

### Usage

```html
<!-- Using CSS custom properties -->
<div style="padding: var(--spacing-4);">Content</div>
<div style="gap: var(--gap-md);">Grid</div>

<!-- Using utility classes -->
<div class="p-fluid-md">Responsive padding</div>
<div class="gap-fluid-md grid">Responsive gap</div>
```

---

## Grid System

### Responsive Grid Classes

Auto-adapting grids that change columns based on screen size:

#### `.grid-responsive-1`

Always 1 column (all breakpoints):

```html
<div class="grid-responsive-1">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

#### `.grid-responsive-2`

- Mobile (< 768px): 1 column
- Tablet (768px+): 2 columns

```html
<div class="grid-responsive-2">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

#### `.grid-responsive-3`

- Mobile (< 768px): 1 column
- Tablet (768px - 1023px): 2 columns
- Desktop (1024px+): 3 columns

```html
<div class="grid-responsive-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

#### `.grid-responsive-4`

- Mobile (< 640px): 1 column
- Small (640px - 1023px): 2 columns
- Desktop (1024px+): 4 columns

```html
<div class="grid-responsive-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
```

### Auto-Fit Grids (Card Layouts)

Automatically fit as many columns as possible based on card minimum width:

| Class         | Min Card Width | Max Columns | Usage                  |
|---------------|----------------|-------------|------------------------|
| `.grid-auto-sm` | 16rem (256px) | Auto-fit    | Small cards, avatars  |
| `.grid-auto-md` | 20rem (320px) | Auto-fit    | Standard cards        |
| `.grid-auto-lg` | 24rem (384px) | Auto-fit    | Large feature cards   |

```html
<!-- Responsive card grid -->
<div class="grid-auto-md gap-fluid-md">
  <div class="card p-fluid-lg">
    <h3 class="heading-4">Course 1</h3>
    <p class="text-fluid-sm">Description</p>
  </div>
  <div class="card p-fluid-lg">
    <h3 class="heading-4">Course 2</h3>
    <p class="text-fluid-sm">Description</p>
  </div>
  <!-- More cards... -->
</div>
```

### CSS Variables

```css
--grid-cols-1: repeat(1, minmax(0, 1fr));
--grid-cols-2: repeat(2, minmax(0, 1fr));
--grid-cols-3: repeat(3, minmax(0, 1fr));
--grid-cols-4: repeat(4, minmax(0, 1fr));
--grid-cols-6: repeat(6, minmax(0, 1fr));
--grid-cols-12: repeat(12, minmax(0, 1fr));

--grid-auto-sm: repeat(auto-fit, minmax(16rem, 1fr));
--grid-auto-md: repeat(auto-fit, minmax(20rem, 1fr));
--grid-auto-lg: repeat(auto-fit, minmax(24rem, 1fr));
```

---

## Container System

### `.container-responsive`

Responsive container with automatic max-widths and fluid padding:

| Breakpoint | Max Width | Padding (Horizontal) |
|------------|-----------|----------------------|
| Mobile     | 100%      | 16-24px              |
| md (768px) | 768px     | 24-36px              |
| lg (1024px)| 1024px    | 32-48px              |
| xl (1280px)| 1280px    | 32-48px              |
| 2xl (1536px)| 1536px   | 32-48px              |

### Usage

```html
<div class="container-responsive">
  <!-- Content automatically centered and max-width constrained -->
  <h1 class="heading-1">Page Title</h1>
  <p class="text-fluid-base">Content</p>
</div>
```

### CSS Variables

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

---

## Utility Classes

### Stack (Vertical Spacing)

Automatically add consistent margin-top between child elements:

| Class       | Spacing      | Usage                     |
|-------------|--------------|---------------------------|
| `.stack-xs` | 8-12px       | Tight content             |
| `.stack-sm` | 12-16px      | Form fields               |
| `.stack-md` | 16-24px      | Default content blocks    |
| `.stack-lg` | 24-36px      | Sections                  |
| `.stack-xl` | 32-48px      | Large sections            |

```html
<div class="stack-md">
  <h2>Heading</h2>
  <!-- Automatic 16-24px margin-top -->
  <p>First paragraph</p>
  <!-- Automatic 16-24px margin-top -->
  <p>Second paragraph</p>
</div>
```

### Section Spacing

Consistent vertical padding for page sections:

| Class              | Mobile      | Tablet      | Desktop     |
|--------------------|-------------|-------------|-------------|
| `.section-spacing` | 48-72px     | 64-96px     | 96-144px    |

```html
<section class="section-spacing container-responsive">
  <h2 class="heading-2">Section Title</h2>
  <p>Content</p>
</section>
```

### Fluid Padding/Margin

Padding and margin that scales with screen size:

#### Padding Classes

| Class          | All Sides | Horizontal | Vertical |
|----------------|-----------|------------|----------|
| Small          | `.p-fluid-sm` | `.px-fluid-sm` | `.py-fluid-sm` |
| Medium         | `.p-fluid-md` | `.px-fluid-md` | `.py-fluid-md` |
| Large          | `.p-fluid-lg` | `.px-fluid-lg` | `.py-fluid-lg` |
| Extra Large    | `.p-fluid-xl` | `.px-fluid-xl` | `.py-fluid-xl` |

#### Margin Classes

| Class          | All Sides | Horizontal | Vertical |
|----------------|-----------|------------|----------|
| Small          | `.m-fluid-sm` | `.mx-fluid-sm` | `.my-fluid-sm` |
| Medium         | `.m-fluid-md` | `.mx-fluid-md` | `.my-fluid-md` |
| Large          | `.m-fluid-lg` | `.mx-fluid-lg` | `.my-fluid-lg` |
| Extra Large    | `.m-fluid-xl` | `.mx-fluid-xl` | `.my-fluid-xl` |

```html
<!-- Card with responsive padding -->
<div class="card p-fluid-lg">
  <h3 class="heading-4">Card Title</h3>
  <p class="text-fluid-base">Content with fluid padding</p>
</div>

<!-- Section with fluid vertical margin -->
<div class="my-fluid-xl">
  <p>Content with responsive vertical margin</p>
</div>
```

---

## Usage Examples

### Hero Section

```html
<section class="section-spacing container-responsive">
  <div class="stack-lg text-center">
    <h1 class="heading-1 gradient-text">
      Welcome to Dronacharya
    </h1>
    <p class="text-fluid-xl text-muted-foreground max-w-3xl mx-auto">
      AI-powered learning platform that adapts to your pace
    </p>
    <div class="flex flex-col sm:flex-row gap-fluid-md justify-center">
      <button class="btn btn-primary">Get Started</button>
      <button class="btn btn-outline">Learn More</button>
    </div>
  </div>
</section>
```

### Course Card Grid

```html
<div class="container-responsive section-spacing">
  <h2 class="heading-2 mb-8">Available Courses</h2>

  <div class="grid-auto-md gap-fluid-md">
    <div class="card p-fluid-lg card-hover">
      <h3 class="heading-4 mb-3">Python Fundamentals</h3>
      <p class="text-fluid-sm text-muted-foreground mb-4">
        Learn Python from scratch with hands-on exercises
      </p>
      <div class="flex items-center justify-between">
        <span class="badge badge-xp">100 XP</span>
        <button class="btn btn-sm btn-primary">Start Learning</button>
      </div>
    </div>

    <div class="card p-fluid-lg card-hover">
      <h3 class="heading-4 mb-3">Data Science</h3>
      <p class="text-fluid-sm text-muted-foreground mb-4">
        Master data analysis with pandas and NumPy
      </p>
      <div class="flex items-center justify-between">
        <span class="badge badge-xp">150 XP</span>
        <button class="btn btn-sm btn-primary">Start Learning</button>
      </div>
    </div>

    <!-- More cards... -->
  </div>
</div>
```

### Two-Column Layout

```html
<div class="container-responsive section-spacing">
  <div class="grid-responsive-2 gap-fluid-lg items-center">
    <!-- Text Column -->
    <div class="stack-md">
      <h2 class="heading-2">Learn with AI Tutors</h2>
      <p class="text-fluid-base text-muted-foreground">
        Our AI-powered tutors provide personalized guidance
        and instant feedback as you learn.
      </p>
      <ul class="stack-sm">
        <li class="flex items-start gap-2">
          <span class="text-primary">✓</span>
          <span class="text-fluid-base">Socratic questioning</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">✓</span>
          <span class="text-fluid-base">Real-time feedback</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">✓</span>
          <span class="text-fluid-base">Adaptive difficulty</span>
        </li>
      </ul>
    </div>

    <!-- Image Column -->
    <div class="relative aspect-video bg-gradient-brand rounded-lg">
      <!-- Image or illustration -->
    </div>
  </div>
</div>
```

### Dashboard Layout

```html
<div class="container-responsive section-spacing">
  <!-- Header -->
  <div class="stack-md mb-8">
    <h1 class="heading-1">Dashboard</h1>
    <p class="text-fluid-base text-muted-foreground">
      Track your learning progress
    </p>
  </div>

  <!-- Stats Grid -->
  <div class="grid-responsive-4 gap-fluid-md mb-8">
    <div class="card p-fluid-md">
      <div class="text-fluid-sm text-muted-foreground mb-1">Total XP</div>
      <div class="heading-2 gradient-text-gold">1,250</div>
    </div>

    <div class="card p-fluid-md">
      <div class="text-fluid-sm text-muted-foreground mb-1">Streak</div>
      <div class="heading-2 text-rose">7 days</div>
    </div>

    <div class="card p-fluid-md">
      <div class="text-fluid-sm text-muted-foreground mb-1">Level</div>
      <div class="heading-2 text-primary">5</div>
    </div>

    <div class="card p-fluid-md">
      <div class="text-fluid-sm text-muted-foreground mb-1">Courses</div>
      <div class="heading-2">3</div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="grid-responsive-3 gap-fluid-lg">
    <div class="lg:col-span-2">
      <div class="card p-fluid-lg">
        <h3 class="heading-3 mb-4">Continue Learning</h3>
        <!-- Content -->
      </div>
    </div>

    <div>
      <div class="card p-fluid-lg">
        <h3 class="heading-4 mb-4">Recent Achievements</h3>
        <!-- Content -->
      </div>
    </div>
  </div>
</div>
```

### Form Layout

```html
<div class="container-responsive max-w-2xl section-spacing">
  <div class="card p-fluid-xl">
    <h2 class="heading-2 mb-2">Create Account</h2>
    <p class="text-fluid-sm text-muted-foreground mb-6">
      Join Dronacharya and start learning today
    </p>

    <form class="stack-md">
      <div class="stack-sm">
        <label class="text-fluid-sm font-medium">Full Name</label>
        <input
          type="text"
          class="input w-full"
          placeholder="Enter your name"
        />
      </div>

      <div class="stack-sm">
        <label class="text-fluid-sm font-medium">Email</label>
        <input
          type="email"
          class="input w-full"
          placeholder="you@example.com"
        />
      </div>

      <div class="stack-sm">
        <label class="text-fluid-sm font-medium">Password</label>
        <input
          type="password"
          class="input w-full"
          placeholder="••••••••"
        />
      </div>

      <button type="submit" class="btn btn-primary w-full mt-4">
        Create Account
      </button>
    </form>
  </div>
</div>
```

---

## Best Practices

### 1. Mobile-First Design

Always design for mobile screens first (320px+), then progressively enhance for larger screens:

```html
<!-- Good: Mobile-first approach -->
<div class="flex flex-col md:flex-row gap-4">
  <!-- Stacks on mobile, horizontal on tablet+ -->
</div>

<!-- Avoid: Desktop-first (harder to maintain) -->
<div class="flex flex-row sm:flex-col md:flex-row">
  <!-- Confusing breakpoint logic -->
</div>
```

### 2. Use Fluid Typography

Prefer `.text-fluid-*` classes over fixed sizes for better responsive scaling:

```html
<!-- Good: Fluid typography -->
<h1 class="text-fluid-4xl">Welcome</h1>
<p class="text-fluid-base">Body text</p>

<!-- Avoid: Fixed sizes that don't scale -->
<h1 class="text-5xl">Welcome</h1>
```

### 3. Semantic Heading Hierarchy

Use semantic heading classes that combine size, weight, and spacing:

```html
<!-- Good: Semantic hierarchy -->
<h1 class="heading-1">Page Title</h1>
<h2 class="heading-2">Section</h2>
<h3 class="heading-3">Subsection</h3>

<!-- Avoid: Manual styling -->
<h1 class="text-4xl font-bold leading-tight">Page Title</h1>
```

### 4. Consistent Spacing

Use spacing CSS variables or fluid utility classes:

```html
<!-- Good: Consistent spacing tokens -->
<div class="p-fluid-lg mb-fluid-md">
  <div style="margin-top: var(--spacing-4);">Content</div>
</div>

<!-- Avoid: Arbitrary values -->
<div class="p-6 mb-5">
  <div style="margin-top: 18px;">Content</div>
</div>
```

### 5. Grid Over Manual Layouts

Prefer responsive grid classes over manual flex/grid configurations:

```html
<!-- Good: Responsive grid utilities -->
<div class="grid-responsive-3 gap-fluid-md">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>

<!-- Avoid: Manual breakpoints (verbose) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
  <!-- Works, but verbose and harder to maintain -->
</div>
```

### 6. Container Wrapping

Wrap page sections in `.container-responsive` for proper max-widths and padding:

```html
<!-- Good: Proper container -->
<section class="section-spacing container-responsive">
  <h2 class="heading-2">Section</h2>
  <!-- Content automatically centered and constrained -->
</section>

<!-- Avoid: Manual container setup -->
<section class="py-12 px-4 max-w-7xl mx-auto">
  <!-- Verbose and inconsistent -->
</section>
```

### 7. Stack Pattern for Vertical Rhythm

Use `.stack-*` classes for consistent vertical spacing:

```html
<!-- Good: Automatic vertical rhythm -->
<div class="stack-md">
  <h2>Title</h2>
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
  <ul>
    <li>Item</li>
  </ul>
</div>

<!-- Avoid: Manual margins -->
<div>
  <h2 class="mb-4">Title</h2>
  <p class="mb-4">Paragraph 1</p>
  <p class="mb-4">Paragraph 2</p>
  <!-- Repetitive and error-prone -->
</div>
```

### 8. Touch Target Sizes

Ensure interactive elements meet WCAG 2.1 minimum size (44x44px) on mobile:

```html
<!-- Good: Adequate touch target -->
<button class="btn min-h-[44px] min-w-[44px]">
  Click Me
</button>

<!-- Avoid: Too small for touch -->
<button class="btn text-xs px-2 py-1">
  Click Me
</button>
```

### 9. Readable Line Length

Keep text content within 45-75 characters per line for readability:

```html
<!-- Good: Constrained line length -->
<div class="max-w-3xl mx-auto">
  <p class="text-fluid-base">
    Long-form content that's easy to read...
  </p>
</div>

<!-- Avoid: Full-width text (hard to read) -->
<p class="w-full text-fluid-base">
  Long-form content that's hard to read...
</p>
```

### 10. Combine with Tailwind

Responsive design system classes work seamlessly with Tailwind utilities:

```html
<div class="container-responsive section-spacing">
  <div class="grid-auto-md gap-fluid-md">
    <div class="card p-fluid-lg hover:shadow-lg transition-shadow">
      <!-- Combines custom classes with Tailwind utilities -->
      <h3 class="heading-4 text-primary mb-3">Title</h3>
      <p class="text-fluid-sm text-muted-foreground line-clamp-3">
        Description...
      </p>
    </div>
  </div>
</div>
```

---

## Accessibility

### Color Contrast

All fluid typography maintains WCAG AA contrast ratios:

- Normal text (16px+): 4.5:1 minimum
- Large text (18px+ or 14px+ bold): 3:1 minimum
- Interactive elements: 3:1 minimum

### Focus States

All interactive elements have visible focus indicators:

```css
*:focus-visible {
  outline: 2px solid var(--violet);
  outline-offset: 2px;
}

.focus-ring:focus-visible {
  outline: 2px solid var(--violet);
  outline-offset: 2px;
}
```

### Touch Targets

Minimum touch target size: 44x44px (WCAG 2.1 Level AAA)

```html
<!-- Buttons meet minimum size -->
<button class="btn min-h-[44px] px-6">
  Action
</button>

<!-- Icon buttons have adequate padding -->
<button class="btn-icon w-11 h-11">
  <Icon />
</button>
```

### Semantic HTML

Use proper heading hierarchy (h1-h6) with semantic classes:

```html
<!-- Good: Semantic structure -->
<h1 class="heading-1">Main Title</h1>
<h2 class="heading-2">Section</h2>
<h3 class="heading-3">Subsection</h3>

<!-- Avoid: Div soup -->
<div class="text-4xl font-bold">Main Title</div>
<div class="text-3xl font-semibold">Section</div>
```

### Reduced Motion

Respect user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Readers

Ensure content is accessible to screen readers:

```html
<!-- Descriptive labels -->
<button aria-label="Close dialog">
  <XIcon />
</button>

<!-- Skip links for keyboard navigation -->
<a href="#main-content" class="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

---

## Performance

### CSS Custom Properties

Efficient runtime scaling without JavaScript:

```css
/* Single definition, scales everywhere */
--spacing-4: clamp(1rem, 0.8rem + 1vw, 1.5rem);

/* Used throughout */
.card {
  padding: var(--spacing-4);
}
```

### Fluid Typography with clamp()

Reduces need for multiple media queries:

```css
/* Instead of: */
@media (min-width: 768px) { font-size: 1.125rem; }
@media (min-width: 1024px) { font-size: 1.25rem; }

/* Use: */
font-size: clamp(1rem, 0.925rem + 0.375vw, 1.125rem);
```

### Grid Auto-Fit

No JavaScript needed for responsive card layouts:

```css
/* Automatically adjusts columns */
grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
```

### Minimal Bundle Size

All utilities are vanilla CSS (no runtime cost):

- Zero JavaScript dependencies
- CSS-only responsive behavior
- Minimal specificity conflicts
- Tree-shakeable with PurgeCSS

---

## Testing

### Breakpoint Testing

Test at these critical widths:

1. **320px** - iPhone SE, small phones
2. **375px** - iPhone 12/13 mini
3. **414px** - iPhone 12/13 Pro Max
4. **768px** - iPad mini, tablets
5. **1024px** - iPad Pro, small laptops
6. **1280px** - Standard desktop
7. **1920px** - Full HD monitors

### Tools

- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- Safari Responsive Design Mode
- BrowserStack (cross-browser testing)
- Percy (visual regression testing)

### Checklist

- [ ] Text remains readable at all breakpoints
- [ ] Images scale appropriately
- [ ] Touch targets meet 44x44px minimum on mobile
- [ ] No horizontal scrolling on any breakpoint
- [ ] Contrast ratios meet WCAG AA standards
- [ ] Focus indicators visible on all interactive elements
- [ ] Grid/flex layouts don't break at edge cases
- [ ] Forms are usable on mobile devices
- [ ] Navigation is accessible on all screen sizes

---

## Migration Guide

### From Fixed to Fluid Typography

```html
<!-- Before -->
<h1 class="text-5xl">Title</h1>
<p class="text-base">Body</p>

<!-- After -->
<h1 class="heading-1">Title</h1>
<p class="text-fluid-base">Body</p>
```

### From Manual Grid to Responsive Grid

```html
<!-- Before -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <!-- Cards -->
</div>

<!-- After -->
<div class="grid-responsive-3 gap-fluid-md">
  <!-- Cards -->
</div>
```

### From Fixed Spacing to Fluid Spacing

```html
<!-- Before -->
<div class="p-6 mb-8">
  <div style="margin-top: 16px;">Content</div>
</div>

<!-- After -->
<div class="p-fluid-lg mb-fluid-xl">
  <div style="margin-top: var(--spacing-4);">Content</div>
</div>
```

---

## Resources

### Documentation

- [Tailwind CSS 4 Docs](https://tailwindcss.com/docs)
- [CSS clamp() Guide](https://web.dev/min-max-clamp/)
- [Responsive Design Best Practices](https://web.dev/responsive-web-design-basics/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools

- [Fluid Type Scale Calculator](https://www.fluid-type-scale.com/)
- [Clamp() Calculator](https://clamp.font-size.app/)
- [Grid Generator](https://cssgrid-generator.netlify.app/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## Changelog

### v1.0.0 (2026-02-09)

- Initial responsive design system implementation
- Fluid typography scale (9 sizes)
- Semantic heading classes (h1-h6)
- Fluid spacing system (14 tokens)
- Responsive grid utilities (4 variants + 3 auto-fit)
- Container system with max-widths
- Stack pattern for vertical rhythm
- Comprehensive utility classes
- Full documentation and examples

---

**Last Updated**: February 9, 2026
**Maintainer**: Dronacharya Development Team
**License**: MIT
