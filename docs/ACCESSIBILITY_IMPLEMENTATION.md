# Accessibility Implementation Guide

**Project:** Dronacharya
**Target:** WCAG 2.1 AA Compliance
**Date:** 2026-02-09

## Implemented Changes

### 1. Root Layout (`/src/app/layout.tsx`)

**Changes:**
- ✅ Added `lang="en"` attribute to `<html>` element
- ✅ Added skip-to-main-content link for keyboard users
- ✅ Skip link is visually hidden but appears on focus

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
>
  Skip to main content
</a>
```

### 2. Header Component (`/src/components/layout/header.tsx`)

**Changes:**
- ✅ Logo link has descriptive `aria-label="Dronacharya home"`
- ✅ Decorative images marked with `aria-hidden="true"`
- ✅ Search button has `aria-label="Search courses, press Command K to open"`
- ✅ Icons marked with `aria-hidden="true"` (redundant with text)
- ✅ Keyboard shortcuts marked with `aria-hidden="true"`
- ✅ Notification bell has `aria-label="Notifications, you have new notifications"`
- ✅ Notification badge has descriptive `aria-label`
- ✅ User menu trigger has `aria-label="User menu for {name}"`

### 3. Sidebar Component (`/src/components/layout/sidebar.tsx`)

**Changes:**
- ✅ Wrapped in semantic `<aside>` with `aria-label="Main navigation"`
- ✅ Main navigation wrapped in `<nav aria-label="Primary navigation">`
- ✅ Bottom navigation wrapped in `<nav aria-label="Secondary navigation">`
- ✅ Active links marked with `aria-current="page"`
- ✅ Icons marked with `aria-hidden="true"`
- ✅ Separator has `role="separator"`
- ✅ Upgrade card has `aria-label="Upgrade promotion"`
- ✅ Upgrade button has `aria-label="Upgrade to Pro plan"`

### 4. Utility Library (`/src/lib/accessibility/sr-only.ts`)

**Created utilities for:**
- ✅ Live region management (`createSRLiveRegion`, `announceToSR`)
- ✅ Icon button labeling (`iconButtonLabel`)
- ✅ Count formatting (`formatCount`)
- ✅ Loading state announcements (`loadingAnnouncement`)
- ✅ Error announcements (`errorAnnouncement`)
- ✅ Gamification formatting (XP, streak, level)

### 5. Audit Documentation (`/docs/ACCESSIBILITY_AUDIT.md`)

**Created comprehensive audit report with:**
- ✅ Critical issues identified
- ✅ WCAG 2.1 AA checklist
- ✅ Priority-based recommendations
- ✅ Testing recommendations

## Remaining Tasks

### Priority 1: Critical (In Progress)

#### Search Dialog (`/src/components/search/search-dialog.tsx`)
- [ ] Add `role="listbox"` to results container
- [ ] Add `role="option"` to result items
- [ ] Implement keyboard navigation (arrow keys)
- [ ] Add `aria-selected` to focused item
- [ ] Announce loading state changes
- [ ] Announce "No results" to screen readers

#### Notification Bell (`/src/components/notifications/notification-bell.tsx`)
- [ ] Update `aria-label` to include count: `"Notifications (3 unread)"`
- [ ] Add live region for new notifications
- [ ] Ensure dropdown keyboard accessible

#### AI Tutor Panel (`/src/components/ai/ai-tutor-panel.tsx`)
- [ ] Add `aria-label` to minimize/maximize buttons
- [ ] Add `role="log"` and `aria-live="polite"` to message list
- [ ] Add `aria-label="Ask AI tutor a question"` to input
- [ ] Add descriptive `aria-label` to send button
- [ ] Announce when AI is responding

#### Login Form (`/src/app/auth/login/page.tsx`)
- [ ] Add `role="alert"` to error messages
- [ ] Announce loading state on button
- [ ] Ensure error messages read immediately

### Priority 2: Important

#### Main Layout Component
- [ ] Add `<main id="main-content">` wrapper around page content
- [ ] Ensure proper heading hierarchy (h1 → h2 → h3)
- [ ] Add landmark regions (`<main>`, `<nav>`, `<aside>`)

#### Focus Management
- [ ] Add visible focus indicators to all interactive elements
- [ ] Ensure focus ring has 2px minimum and high contrast
- [ ] Add focus trap to modal dialogs
- [ ] Return focus to trigger on modal close

#### Gamification Components
- [ ] XP Display: Add `aria-label` with formatted XP
- [ ] Streak Display: Add `aria-label` with formatted streak
- [ ] Level Progress: Add `aria-label` with level and progress
- [ ] Achievement Toast: Use `role="status"` with `aria-live`

#### Form Components
- [ ] Ensure all inputs have associated labels
- [ ] Add `aria-describedby` for helper text
- [ ] Add `aria-invalid` and `aria-errormessage` for errors
- [ ] Required fields marked with `aria-required` or `required`

### Priority 3: Enhancement

#### Keyboard Shortcuts
- [ ] Document all keyboard shortcuts
- [ ] Add shortcuts help modal (press `?`)
- [ ] Ensure no conflicts with browser/screen reader shortcuts
- [ ] Make configurable in settings

#### Touch Targets
- [ ] Audit all interactive elements for 44x44px minimum
- [ ] Add adequate spacing between touch targets
- [ ] Test on mobile devices

#### Color Contrast
- [ ] Run contrast checker on all text
- [ ] Ensure 4.5:1 ratio for normal text
- [ ] Ensure 3:1 ratio for large text (18pt+)
- [ ] Ensure 3:1 ratio for UI components
- [ ] Check gradient backgrounds (upgrade card)

#### Content Structure
- [ ] Verify heading hierarchy on all pages
- [ ] Add breadcrumbs where appropriate
- [ ] Ensure logical reading order
- [ ] Add descriptive page titles

## Testing Plan

### Automated Testing

1. **Add ESLint Plugin**
```bash
pnpm add -D eslint-plugin-jsx-a11y
```

```js
// .eslintrc.js
{
  extends: ['plugin:jsx-a11y/recommended'],
  plugins: ['jsx-a11y']
}
```

2. **Add axe-core to Tests**
```bash
pnpm add -D @axe-core/react
```

```tsx
// src/lib/test-utils.tsx
import { configureAxe } from '@axe-core/react';

if (process.env.NODE_ENV !== 'production') {
  configureAxe({
    rules: [
      { id: 'color-contrast', enabled: true },
    ],
  });
}
```

3. **Lighthouse CI Integration**
```yaml
# .github/workflows/a11y.yml
name: Accessibility Audit
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './.lighthouserc.json'
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Ensure logical tab order
- [ ] Activate buttons/links with Enter/Space
- [ ] Close dialogs with Escape
- [ ] Navigate lists with arrow keys
- [ ] No keyboard traps

#### Screen Reader Testing
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] All content announced logically
- [ ] Form labels read correctly
- [ ] Error messages announced immediately
- [ ] Loading states announced
- [ ] Dynamic updates announced

#### Visual Testing
- [ ] Zoom to 200% (no horizontal scroll)
- [ ] High contrast mode enabled
- [ ] Focus indicators visible
- [ ] Text readable at all sizes
- [ ] Touch targets adequate on mobile

## Code Examples

### Accessible Button
```tsx
<Button
  variant="ghost"
  size="icon"
  aria-label="Delete item"
>
  <Trash2 className="h-4 w-4" aria-hidden="true" />
</Button>
```

### Accessible Form Field
```tsx
<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    aria-describedby="email-help"
    aria-invalid={!!error}
    aria-errormessage={error ? "email-error" : undefined}
    required
  />
  <p id="email-help" className="text-sm text-muted-foreground">
    We'll never share your email.
  </p>
  {error && (
    <p id="email-error" role="alert" className="text-sm text-destructive">
      {error}
    </p>
  )}
</div>
```

### Accessible Loading State
```tsx
import { announceToSR } from '@/lib/accessibility/sr-only';

function Component() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      announceToSR('Loading content');
    }
  }, [isLoading]);

  return (
    <Button disabled={isLoading} aria-busy={isLoading}>
      {isLoading ? 'Loading...' : 'Submit'}
    </Button>
  );
}
```

### Accessible Live Region
```tsx
import { createSRLiveRegion, announceToSR } from '@/lib/accessibility/sr-only';

function NotificationSystem() {
  useEffect(() => {
    // Create live region on mount
    createSRLiveRegion('notifications-live', 'polite');

    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleNewNotification = (message: string) => {
    announceToSR(message, 'polite');
  };
}
```

## Best Practices

### Do's
✅ Use semantic HTML (`<nav>`, `<main>`, `<aside>`, `<button>`)
✅ Provide text alternatives for non-text content
✅ Ensure keyboard accessibility for all functionality
✅ Use ARIA when HTML alone isn't sufficient
✅ Test with actual screen readers and keyboard
✅ Announce dynamic content changes
✅ Maintain logical focus order
✅ Provide visible focus indicators

### Don'ts
❌ Use `<div>` with `onClick` instead of `<button>`
❌ Rely solely on color to convey information
❌ Use positive `tabindex` (breaks natural order)
❌ Hide content from screen readers unnecessarily
❌ Assume ARIA fixes semantic HTML issues
❌ Forget to test with keyboard only
❌ Use placeholders as labels
❌ Create keyboard traps

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [axe DevTools Extension](https://www.deque.com/axe/devtools/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [React Accessibility Docs](https://react.dev/learn/accessibility)

## Next Steps

1. ✅ Complete Priority 1 fixes
2. Add automated a11y testing to CI/CD
3. Create accessibility guidelines for developers
4. Schedule regular audits (quarterly)
5. Conduct user testing with people with disabilities
6. Add accessibility section to component library docs

---

**Status:** In Progress
**Last Updated:** 2026-02-09
**Assignee:** Accessibility Specialist
