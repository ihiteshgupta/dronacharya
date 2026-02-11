# Accessibility Quick Start Guide

**For Dronacharya Developers**

Quick reference for implementing accessible components. For full details, see [ACCESSIBILITY_IMPLEMENTATION.md](./ACCESSIBILITY_IMPLEMENTATION.md).

## Quick Checklist ✓

When creating/updating a component, ensure:

- [ ] Semantic HTML used (`<button>`, `<nav>`, `<main>`, not `<div onClick>`)
- [ ] All interactive elements keyboard accessible (Tab, Enter, Space)
- [ ] Icon-only buttons have `aria-label`
- [ ] Form inputs have associated `<label>` with `htmlFor`
- [ ] Images have `alt` text (or `aria-hidden` if decorative)
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Touch targets are 44x44px minimum on mobile
- [ ] Focus indicators visible (automatic with globals.css)

## Common Patterns

### Icon-Only Button

```tsx
import { iconButtonLabel } from '@/lib/accessibility/sr-only';

<Button
  variant="ghost"
  size="icon"
  aria-label={iconButtonLabel('Delete', 'item')}
>
  <Trash2 className="h-4 w-4" aria-hidden="true" />
</Button>
```

### Form Field

```tsx
<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    aria-describedby="email-help"
    aria-invalid={!!error}
    required
  />
  <p id="email-help" className="text-sm text-muted-foreground">
    We'll never share your email.
  </p>
  {error && (
    <p role="alert" className="text-sm text-destructive">
      {error}
    </p>
  )}
</div>
```

### Loading State

```tsx
import { announceToSR } from '@/lib/accessibility/sr-only';

const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  if (isLoading) {
    announceToSR('Loading content');
  }
}, [isLoading]);

<Button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

### Navigation

```tsx
<nav aria-label="Main navigation">
  <ul>
    <li>
      <Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>
        Dashboard
      </Link>
    </li>
  </ul>
</nav>
```

### Search/Combobox

```tsx
<div role="combobox" aria-expanded={open} aria-controls="results">
  <Input
    aria-label="Search courses"
    aria-autocomplete="list"
    value={query}
    onChange={handleChange}
  />
  {open && (
    <div id="results" role="listbox">
      {results.map((result) => (
        <div
          key={result.id}
          role="option"
          aria-selected={selected === result.id}
          onClick={() => handleSelect(result)}
        >
          {result.name}
        </div>
      ))}
    </div>
  )}
</div>
```

### Modal/Dialog

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent aria-describedby="dialog-description">
    <DialogTitle>Confirm Action</DialogTitle>
    <DialogDescription id="dialog-description">
      Are you sure you want to delete this item?
    </DialogDescription>
    <div>
      <Button onClick={handleCancel}>Cancel</Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </div>
  </DialogContent>
</Dialog>
```

### Notification Toast

```tsx
import { announceToSR } from '@/lib/accessibility/sr-only';

function showNotification(message: string) {
  announceToSR(message, 'polite');

  toast({
    title: "Success",
    description: message,
  });
}
```

### Gamification Stats

```tsx
import { formatXPForSR } from '@/lib/accessibility/sr-only';

<div aria-label={formatXPForSR(xp)}>
  <span className="font-bold">{xp.toLocaleString()}</span> XP
</div>
```

## Utilities Reference

### Screen Reader Utilities

```tsx
import {
  announceToSR,
  iconButtonLabel,
  formatCount,
  formatXPForSR,
  formatStreakForSR,
  formatLevelForSR,
} from '@/lib/accessibility/sr-only';

// Announce to screen readers
announceToSR('Item deleted successfully', 'polite');
announceToSR('Error: Form validation failed', 'assertive');

// Icon button labels
aria-label={iconButtonLabel('Close')}
aria-label={iconButtonLabel('Delete', 'comment')}

// Format counts
aria-label={formatCount(unreadCount, 'notification', 'notifications')}
// Returns: "No notifications", "1 notification", "5 notifications", "99+ notifications"

// Format XP/Streak/Level
aria-label={formatXPForSR(1250)} // "1,250 experience points"
aria-label={formatStreakForSR(7)} // "7 days learning streak"
aria-label={formatLevelForSR(5, 65)} // "Level 5, 65% progress to next level"
```

### CSS Classes

```css
.sr-only           /* Screen reader only (visually hidden) */
.skip-link         /* Skip to main content link */
.wcag-aa-text      /* High contrast text (4.5:1 ratio) */
.contrast-high     /* Extra high contrast text */
```

## ARIA Attributes Quick Reference

| Attribute | Use Case | Example |
|-----------|----------|---------|
| `aria-label` | Label for element with no visible text | `aria-label="Close dialog"` |
| `aria-labelledby` | Reference to element ID containing label | `aria-labelledby="title"` |
| `aria-describedby` | Reference to element ID with description | `aria-describedby="help-text"` |
| `aria-current` | Mark current item in navigation | `aria-current="page"` |
| `aria-expanded` | Whether element is expanded | `aria-expanded={isOpen}` |
| `aria-hidden` | Hide from screen readers | `aria-hidden="true"` |
| `aria-live` | Announce dynamic updates | `aria-live="polite"` |
| `aria-busy` | Element is loading | `aria-busy={isLoading}` |
| `aria-invalid` | Form field has error | `aria-invalid={!!error}` |
| `aria-required` | Field is required | `aria-required="true"` |

## Common Mistakes to Avoid

❌ **Don't:**
```tsx
// Using div as button
<div onClick={handleClick}>Click me</div>

// Missing label
<Input placeholder="Email" />

// No alt text
<img src="/logo.png" />

// Color-only indication
<span className="text-red">Error</span>

// Positive tabindex
<div tabIndex={1}>Content</div>
```

✅ **Do:**
```tsx
// Use semantic button
<Button onClick={handleClick}>Click me</Button>

// Proper label
<Label htmlFor="email">Email</Label>
<Input id="email" placeholder="you@example.com" />

// Descriptive alt text
<img src="/logo.png" alt="Dronacharya logo" />

// Text + color for errors
<span className="text-red" role="alert">Error: Invalid input</span>

// No positive tabindex (use -1 or none)
<div tabIndex={-1}>Content</div>
```

## Testing Your Work

### Keyboard Test (5 min)
1. Tab through all interactive elements
2. Activate with Enter/Space
3. Close dialogs with Escape
4. Navigate lists with arrows

### Screen Reader Test (10 min)
1. Enable VoiceOver (macOS: Cmd+F5)
2. Navigate with VO+Right Arrow
3. Interact with VO+Space
4. Listen to all content

### Quick Checks
- [ ] Zoom to 200% - no horizontal scroll?
- [ ] All text readable?
- [ ] Focus indicators visible?
- [ ] No color-only indicators?

## Resources

- **Full Guide:** [ACCESSIBILITY_IMPLEMENTATION.md](./ACCESSIBILITY_IMPLEMENTATION.md)
- **Audit Report:** [ACCESSIBILITY_AUDIT.md](./ACCESSIBILITY_AUDIT.md)
- **Summary:** [ACCESSIBILITY_SUMMARY.md](./ACCESSIBILITY_SUMMARY.md)
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Patterns:** https://www.w3.org/WAI/ARIA/apg/

## Questions?

Check the full implementation guide or ask the accessibility specialist.

---

**Remember:** Accessibility is not optional. It's a legal requirement and makes your app better for everyone.
