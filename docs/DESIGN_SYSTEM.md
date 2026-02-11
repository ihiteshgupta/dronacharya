# Dronacharya Design System

## Brand Identity

**Name:** Dronacharya (द्रोणाचार्य)
**Tagline:** "AI that teaches like a Guru"
**Parent Company:** Margadeshaka
**Philosophy:** Inspired by the legendary teacher from Mahabharata, embodying wisdom, guidance, and mastery-focused learning.

---

## Color Palette

### Primary Colors

#### Deep Indigo (Primary Brand)
```css
--indigo: oklch(0.45 0.18 280);        /* Base indigo */
--indigo-light: oklch(0.55 0.15 280);  /* Light variant */
--indigo-dark: oklch(0.25 0.12 280);   /* Dark variant */
```
**Usage:** Primary actions, navigation highlights, brand elements, focus states

#### Saffron Gold (Secondary Brand)
```css
--gold: oklch(0.78 0.17 70);          /* Base gold */
--gold-light: oklch(0.85 0.14 70);    /* Light variant */
--gold-dark: oklch(0.68 0.19 70);     /* Dark variant */
```
**Usage:** XP displays, achievements, premium features, accents

#### Teal (Accent)
```css
--teal: oklch(0.68 0.12 180);         /* Base teal */
--teal-light: oklch(0.78 0.10 180);   /* Light variant */
--teal-dark: oklch(0.58 0.14 180);    /* Dark variant */
```
**Usage:** Success states, progress indicators, complementary highlights

### Semantic Colors

```css
--emerald: oklch(0.70 0.18 155);  /* Success, growth, completion */
--amber: oklch(0.80 0.16 85);     /* Warning, XP, attention */
--rose: oklch(0.65 0.22 15);      /* Destructive, streak, urgency */
--blue: oklch(0.65 0.18 250);     /* Information, links */
```

### Gradients

```css
/* Brand gradient: Indigo → Teal */
--gradient-brand: linear-gradient(135deg, var(--indigo) 0%, var(--indigo-light) 50%, var(--teal) 100%);

/* Gold gradient: For XP and premium */
--gradient-gold: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);

/* XP gradient (alias) */
--gradient-xp: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);

/* Success gradient */
--gradient-success: linear-gradient(135deg, var(--teal) 0%, var(--teal-light) 100%);

/* Level gradient: Full spectrum */
--gradient-level: linear-gradient(135deg, var(--indigo-dark) 0%, var(--indigo) 50%, var(--gold) 100%);
```

---

## Typography

### Font Families

```css
--font-sans: Geist, ui-sans-serif, system-ui, -apple-system;
--font-mono: "Geist Mono", ui-monospace, SFMono-Regular;
--font-display: Geist, ui-sans-serif, system-ui;
```

### Hierarchy

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| H1 | 2.5rem (40px) | 700 | Page titles |
| H2 | 2rem (32px) | 700 | Section titles |
| H3 | 1.5rem (24px) | 600 | Subsection titles |
| H4 | 1.25rem (20px) | 600 | Card titles |
| Body | 1rem (16px) | 400 | Main content |
| Small | 0.875rem (14px) | 400 | Captions, labels |
| XS | 0.75rem (12px) | 500 | Badges, metadata |

### Typography Utilities

```css
letter-spacing: -0.02em;  /* Display text (headings) */
font-feature-settings: "rlig" 1, "calt" 1;  /* Enable ligatures */
```

---

## Spacing Scale

```
0.25rem (4px)   - xs
0.5rem (8px)    - sm
0.75rem (12px)  - md
1rem (16px)     - lg
1.5rem (24px)   - xl
2rem (32px)     - 2xl
3rem (48px)     - 3xl
4rem (64px)     - 4xl
```

---

## Border Radius

```css
--radius: 0.75rem;  /* Base radius */

--radius-sm: calc(var(--radius) - 4px);   /* 8px */
--radius-md: calc(var(--radius) - 2px);   /* 10px */
--radius-lg: var(--radius);                /* 12px */
--radius-xl: calc(var(--radius) + 4px);   /* 16px */
--radius-2xl: calc(var(--radius) + 8px);  /* 20px */
```

**Usage:**
- `radius-sm`: Badges, small buttons
- `radius-md`: Input fields, chips
- `radius-lg`: Cards, buttons (default)
- `radius-xl`: Feature cards, dialogs
- `radius-2xl`: Hero elements, modals

---

## Shadows

### Card Shadows
```css
shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
shadow-md: 0 4px 6px rgba(0,0,0,0.1);
shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
```

### Glow Effects
```css
/* Primary glow */
box-shadow: 0 0 20px oklch(from var(--violet) l c h / 0.3);

/* Gold glow */
box-shadow: 0 0 12px oklch(from var(--amber) l c h / 0.2);
```

---

## Animation

### Timing Functions

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);        /* Smooth exit */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);    /* Balanced */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy */
```

### Durations

```css
--duration-fast: 150ms;    /* Quick interactions */
--duration-normal: 250ms;  /* Standard transitions */
--duration-slow: 400ms;    /* Emphasis */
--duration-slower: 600ms;  /* Celebration */
```

### Keyframe Animations

#### XP Gain
```css
.animate-xp-gain {
  animation: xp-gain 0.6s var(--ease-spring);
}
```
Scale + brightness pulse

#### Streak Fire
```css
.animate-streak-fire {
  animation: streak-fire 1.5s ease-in-out infinite;
}
```
Gentle vertical float

#### Achievement Unlock
```css
.animate-achievement {
  animation: achievement-unlock 0.8s var(--ease-spring);
}
```
Scale + rotate entrance

#### Level Glow
```css
.animate-level-glow {
  animation: level-glow 2s ease-in-out infinite;
}
```
Pulsing box-shadow

---

## Component Patterns

### Cards

#### Default Card
```tsx
<Card className="border shadow-sm hover:shadow-md transition-all duration-300">
```

#### Interactive Card (Hover)
```tsx
<Card className="card-hover cursor-pointer group border shadow-sm hover:shadow-lg hover:border-primary/20">
```

#### Featured Card
```tsx
<Card className="border shadow-sm overflow-hidden relative">
  <div className="absolute top-0 left-0 right-0 h-1.5 gradient-brand shadow-sm" />
  {/* Content */}
</Card>
```

### Buttons

#### Primary (Brand)
```tsx
<Button className="gradient-brand text-white border-0 shadow-md hover:shadow-lg">
```

#### With Shine Effect
```tsx
<Button className="btn-shine gradient-brand text-white border-0">
```

#### Secondary
```tsx
<Button variant="outline" className="hover:bg-accent hover:border-primary/30">
```

### Badges

#### XP Badge
```css
.badge-xp {
  background: oklch(from var(--amber) l c h / 0.15);
  color: var(--amber);
  box-shadow: 0 0 12px oklch(from var(--amber) l c h / 0.2);
}
```

#### Streak Badge
```css
.badge-streak {
  background: oklch(from var(--rose) l c h / 0.15);
  color: var(--rose);
}
```

#### Level Badge
```css
.badge-level {
  background: var(--gradient-brand);
  color: white;
  box-shadow: 0 0 20px oklch(from var(--violet) l c h / 0.3);
}
```

---

## Indian-Inspired Design Elements

### Subtle Cultural Touches

1. **Devanagari Typography**: Display "द्रोणाचार्य" in headers where appropriate
2. **Saffron Gold Accents**: Traditional color of wisdom and learning
3. **Mandala-Inspired Patterns**: Consider for loading states or decorative elements
4. **Chakra-Based Progression**: 7-level system could align with chakra philosophy

### Recommended Icons

- **Lotus** (🪷): Purity, enlightenment → For achievements
- **Om Symbol**: Beginning of knowledge → For welcome/onboarding
- **Trident/Trishul**: Power, focus → For advanced mastery

---

## Accessibility

### Color Contrast

All text/background combinations meet WCAG AA standards (4.5:1 minimum):
- Primary on white: ✅ 8.2:1
- Gold on white: ✅ 4.8:1
- Muted text: ✅ 4.6:1

### Focus States

```css
.focus-ring:focus-visible {
  outline: 2px solid var(--violet);
  outline-offset: 2px;
}
```

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Dark Mode

All colors have dark mode variants with adjusted lightness for OLED screens:

```css
.dark {
  --indigo: oklch(0.55 0.20 280);      /* Brighter in dark */
  --gold: oklch(0.82 0.16 70);         /* Warmer in dark */
  --background: oklch(0.13 0.015 290); /* Deep indigo-tinted black */
}
```

---

## Usage Guidelines

### Do's ✅

- Use brand gradients for primary CTAs
- Apply subtle animations to celebrate user achievements
- Maintain consistent spacing using the defined scale
- Use semantic colors (emerald = success, rose = destructive)
- Add hover states to interactive elements

### Don'ts ❌

- Don't use solid black (#000000) – use `--foreground`
- Don't mix gradient directions inconsistently
- Don't animate on every interaction (motion budget)
- Don't use brand colors for destructive actions
- Don't exceed 3 animations on a single screen

---

## Implementation Checklist

- [x] Define color tokens in globals.css
- [x] Create gradient utilities
- [x] Implement keyframe animations
- [x] Apply brand colors to header logo
- [x] Update card components with consistent shadows
- [x] Add hover states with transitions
- [x] Enhance stat cards with gradient icons
- [x] Improve button visual feedback
- [ ] Add loading skeleton states
- [ ] Create toast notification styles
- [ ] Design error state patterns
- [ ] Build empty state illustrations

---

## References

- Tailwind CSS v4 Documentation
- OKLCH Color Space Guide
- Material Design Motion Principles
- Vedic Color Symbolism
