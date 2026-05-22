# Tourista Codebase: Quick Start Guide

## Files Created

✅ **RESPONSIVE_DESIGN_ANALYSIS.md** - Full responsive patterns, breakpoints, and page switching
✅ **CSS_LAYOUT_REFERENCE.md** - All grid/flex systems with code samples
✅ **PAGE_STATE_FLOW.md** - Complete navigation state machine and API calls

---

## Architecture Overview

### 1. Responsive Design (Mobile-First)

**Breakpoints:**
```
Default (Mobile):    560px max-width, 56px nav + 37px tabs
900px+:             Desktop layout, 58px left rail, 286px filter panel
1100px+:            Wider panels (420px)
640px and below:    Smaller grid columns
```

**Key Pattern:**
```css
.page { display: none }
.page.on { display: block; min-height: calc(100vh - 93px) }
```

Only one page visible at a time via CSS display toggle.

---

### 2. Page Switching Mechanism

**State:**
```typescript
const [page, setPage] = useState('browse')
const [prev, setPrev] = useState('browse')

const go = (p: string) => { setPrev(page); setPage(p) }
```

**Pages:** browse | detail | profile | edit | post | dashboard | notif

**Example:**
```jsx
{page === 'browse' && <div className="page on">...</div>}
{page === 'detail' && <div className="page on">...</div>}
```

---

### 3. Detail View Opening

```typescript
// Click vlog card
onClick={() => openD('browse', v.id)}

// Opens detail with context
const openD = async (from: string, vlogId?: string) => {
  setPrev(from)              // Save where we came from
  setPage('detail')          // Switch to detail
  
  setVlogLoading(true)
  try {
    const r = await fetch(`/api/vlogs/${vlogId}`)
    setVlog(await r.json())
  } finally { setVlogLoading(false) }
}

// Back button returns to prev
<div className="bk" onClick={() => go(prev)}>
  Back to {prev === 'profile' ? 'Profile' : prev === 'dashboard' ? 'Dashboard' : 'Explore'}
</div>
```

---

### 4. CSS Class Patterns

#### Visibility Classes
```css
.page { display: none }           /* All hidden */
.page.on { display: block }       /* Only active one shown */

.on { color: var(--g); }          /* Active state (buttons, chips) */
.on { background: var(--gl) }     /* Active background */
```

#### Layout Classes
```css
.w { max-width: 560px; margin: 0 auto; padding: 24px 20px 56px }
.nav-inner { max-width: 560px; display: flex; align-items: center }
.side-rail { position: fixed; left: 0; width: 58px }  /* Desktop only */
```

#### Grid Systems
```css
.vg { display: grid; grid-template-columns: 1fr 1fr; gap: 8px }        /* 2-col profile */
.kpig { display: grid; grid-template-columns: repeat(4, 1fr) }        /* 4-col stats */
.gi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) }
```

#### Flex Systems
```css
.vl { display: flex; flex-direction: column; gap: 1px }               /* Vlog list */
.eng { display: flex; gap: 10px }                                     /* Engagement buttons */
.w:has(> .bk) { display: flex; flex-direction: column }               /* Detail page ordering */
```

---

### 5. Detail View Layout

Uses CSS `order` property to arrange content:

```css
.w:has(> .bk) {
  display: flex;
  flex-direction: column;
}

.w:has(> .bk) > .bk { order: 0 }     /* Back button first */
.w:has(> .bk) > .vbox { order: 1 }   /* Video */
.w:has(> .bk) > .eng { order: 2 }    /* Engagement buttons */
.w:has(> .bk) > .dtt { order: 3 }    /* Title */
.w:has(> .bk) > .dvl { order: 4 }    /* Author */
.w:has(> .bk) > .s4 { order: 5 }     /* Stats */
.w:has(> .bk) > .dd { order: 6 }     /* Description */
.w:has(> .bk) > .ulb { order: 7 }    /* Unlock box */
/* ... more items ... */
```

**Result:** Content renders in source order but displays in visual order.

---

### 6. Media Query Strategy

#### Desktop Enhancement (900px+)
```css
@media (min-width: 900px) {
  .nav { padding-left: 76px }                    /* Make room for rail */
  .tabs { display: none }                        /* Hide tabs */
  .side-rail { display: flex }                   /* Show rail */
  .w:has(> .flt-section) > .flt-section {
    position: fixed;
    left: 72px; top: 82px;
    width: 286px;
    z-index: 120;
  }
}
```

#### Collapsible Filter Panel (900-1160px)
```css
@media (min-width: 900px) and (max-width: 1160px) {
  .w:has(> .flt-section) > .flt-section {
    transform: translateX(calc(-100% + 12px));  /* Hidden by default */
  }
  .w:has(> .flt-section) > .flt-section:hover {
    transform: translateX(0);                   /* Visible on hover */
  }
}
```

#### Bottom Sheet Panel (Mobile)
```css
@media (max-width: 900px) {
  .gi-panel {
    position: fixed;
    left: 0; right: 0; bottom: 0;
    max-height: 80vh;
    border-radius: 16px 16px 0 0;  /* Top corners rounded */
  }
}
```

---

## Grid & Flex Quick Reference

### When to Use Grid
- Fixed number of columns (4 stats, 2-column profile)
- Need `grid-template-columns: repeat(4, 1fr)`
- Want auto-fill responsive: `repeat(auto-fill, minmax(220px, 1fr))`
- Creating "card" layouts with templates

### When to Use Flex
- One-dimensional layout (row or column)
- Need equal space: `gap: 10px`
- Vertical stacking: `flex-direction: column`
- Equal widths: `flex: 1`

**Tourista Uses Both:**
```css
.vg { display: grid; grid-template-columns: 1fr 1fr }    /* Grid: 2-col cards */
.vr { display: flex; gap: 13px }                          /* Flex: Row with gap */
.w:has(> .bk) { display: flex; flex-direction: column }  /* Flex: Ordered content */
```

---

## Navigation & State Flow

```
START
  └─ browse (default)
      ├─ Click vlog → openD('browse', id)
      │   └─ detail (video, engagement, itinerary)
      │       └─ Click back → go(prev) → browse
      │
      ├─ Click Profile btn → go('profile')
      │   ├─ Edit btn → go('edit')
      │   │   └─ Save → go('profile')
      │   └─ Click vlog → openD('profile', id)
      │       └─ Detail → back → profile
      │
      ├─ Click Dashboard → go('dashboard')
      │   ├─ Post btn → go('post')
      │   │   └─ Publish → go('dashboard')
      │   └─ Click vlog → openD('dashboard', id)
      │       └─ Detail → back → dashboard
      │
      ├─ Click Notifications → go('notif')
      │   └─ Auto-close → browse
      │
      └─ Filter, search → stay on browse
```

---

## Key CSS Classes Summary

```css
/* Visibility */
.page { display: none }
.page.on { display: block }
.on { color/background: green theme }

/* Layout */
.w { max-width: 560px; centered }
.nav-inner { max-width: 560px }
.topnav-inner { max-width: 1600px }

/* Navigation */
.nav { sticky top, 56px height }
.tabs { sticky below nav, 37px (mobile only) }
.side-rail { fixed left, 58px, desktop only }

/* Content */
.vl { flex column, vlog list }
.vr { flex row, vlog card }
.vg { grid 2-col, profile videos }
.kpig { grid 4-col, stats }
.gi-grid { grid auto-fill, browse }
.s4 { grid 4-col, detail stats }

/* Detail Page */
.w:has(> .bk) { flex column }
.w:has(> .bk) > .* { order: N (0-20) }
.bk { back button }
.vbox { video player }
.eng { engagement buttons }
.dtt { title }
.dvl { author info }
```

---

## File Locations

- **globals.css** - All responsive CSS (1546 lines)
  - Lines 1-54: Base styles & nav
  - Lines 123-149: Desktop layout (900px+)
  - Lines 151-154: Filter panel collapse (900-1160px)
  - Lines 523-537: Responsive breakpoints
  - Lines 464-520: Google Images grid

- **page.tsx** - All React logic (1529 lines)
  - Lines 59-71: Page state management
  - Lines 126-137: Data fetching
  - Lines 192-201: Detail view opening
  - Lines 474-1527: Full render logic

---

## Design Tokens

**Colors:**
```
--g: #2A7A50           (Green - primary)
--b: #0876A8           (Blue - secondary)
--y: #D08A0A           (Yellow - accent)
--color-text-primary: #162A1F
--color-background-primary: #FFFFFF
--color-background-secondary: #F2FAF6
```

**Spacing:**
```
Gap: 6px, 8px, 10px, 13px, 20px, 24px
Padding: 8px, 11px, 14px, 20px, 24px
Border-radius: 6px, 10px, 12px, 14px, 20px, 22px, 24px
```

**Breakpoints:**
```
640px: Small mobile
900px: Tablet → Desktop switch
1100px: Desktop refinement
1160px: Filter panel full width
1600px: Max desktop width
```

---

## Next Steps for Frontend Design

1. **Add new card layout?** Use `.gi-grid { grid-template-columns: repeat(auto-fill, minmax(X, 1fr)) }`
2. **New page?** Add to state, render with `{page === 'name' && <div className="page on">}`
3. **Mobile modal?** Copy `.gi-panel` with `position: fixed; bottom: 0; max-height: 80vh`
4. **Responsive component?** Base mobile (560px), enhance at 900px/1100px breakpoints
5. **Detail view for new content?** Use CSS `order` property to arrange sections

