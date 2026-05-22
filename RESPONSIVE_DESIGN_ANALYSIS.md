# Tourista Responsive Design & Page Structure Analysis

## Executive Summary
Tourista uses a dual-layout approach:
1. **Mobile-first design** (default) with max-width constraints, sticky navigation, and tab-based page switching
2. **Desktop layout** (>900px) with side navigation rail, fixed filter panels, and Google Images-style grid

---

## 1. RESPONSIVE LAYOUT STRATEGY

### Max-Width Constraints
```css
.nav-inner { max-width: 560px }           /* Mobile nav container */
.w { max-width: 560px }                   /* Main content width */
.topnav-inner { max-width: 1600px }       /* Desktop nav full width */
.tn-page { max-width: 1600px }            /* Desktop page wrapper */
.gi-layout.with-panel { grid-template-columns: 1fr 420px } /* Panel layout */
```

**Key Breakpoints:**
- **900px**: Major layout switch (mobile → desktop)
- **1100px**: Panel adjustment (420px → 360px)
- **640px**: Grid columns reduction for small screens

---

## 2. MEDIA QUERIES IN globals.css

### Primary Breakpoint: @media (min-width: 900px)
**Lines 123-149**: Desktop layout transformation

```css
/* Hide mobile elements */
.nav { padding-left: 76px }
.nav .ni, .nav .pbtn, .nav .avb { display: none }
.tabs { display: none }

/* Show desktop side rail */
.side-rail {
  position: fixed; left: 0; top: 0; bottom: 0;
  width: 58px;
  background: var(--color-background-primary);
  display: flex; flex-direction: column;
  padding: 72px 8px 14px;
  z-index: 220;
}

/* Filter panel positioning */
.w:has(> .flt-section) > .flt-section {
  position: fixed;
  left: 72px; top: 82px;
  width: 286px;
  max-height: calc(100vh - 106px);
  overflow: auto;
  z-index: 120;
}
```

### Secondary Breakpoint: @media (min-width: 900px) and (max-width: 1160px)
**Lines 151-154**: Responsive filter panel collapse

```css
.w:has(> .flt-section) > .flt-section {
  transform: translateX(calc(-100% + 12px));
  transition: transform .18s;
}
.w:has(> .flt-section) > .flt-section:hover,
.w:has(> .flt-section) > .flt-section:focus-within {
  transform: translateX(0);
}
```

### Tablet Breakpoint: @media (max-width: 1100px)
**Line 523**: Panel width reduction
```css
.gi-layout.with-panel { grid-template-columns: 1fr 360px; }
```

### Large Tablet to Mobile: @media (max-width: 900px)
**Lines 525-532**: Panel repositioning
```css
.gi-layout.with-panel { grid-template-columns: 1fr }
.gi-panel { position: fixed; bottom: 0; max-height: 80vh; }
```

### Mobile Optimization: @media (max-width: 640px)
**Lines 533-537**: Grid and padding adjustments
```css
.gi-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
.tn-page { padding: 12px 12px 56px }
```

---

## 3. PAGE STATE MANAGEMENT

### Navigation System (page.tsx, lines 59-71)
```typescript
const [page, setPage] = useState('browse')
const [prev, setPrev] = useState('browse')

const go = (p: string) => { setPrev(page); setPage(p) }
const closeT = () => setPage('browse')

// Pages: 'browse', 'detail', 'profile', 'edit', 'post', 'dashboard', 'notif'
```

### Page Display Pattern
```html
<div className={`page${page === 'browse' ? ' on' : ''}`}>
  {/* Content only visible when page.on class is applied */}
</div>
```

**CSS (line 52):**
```css
.page { display: none }
.page.on { display: block; min-height: calc(100vh - 93px) }
```

---

## 4. DETAIL VIEW OPENING/CLOSING LOGIC

### Opening Detail View (lines 192-201)
```typescript
const openD = async (from: string, vlogId?: string) => {
  setPrev(from)                    // Remember where we came from
  setPage('detail')                // Switch to detail page
  setUnlocked(false)               // Reset unlock state
  setReviewText('')                // Clear review form
  
  if (!vlogId) return
  
  setVlogLoading(true)
  try {
    const r = await fetch(`/api/vlogs/${vlogId}`)
    const d: VlogDetail = await r.json()
    setVlog(d)
  } finally { setVlogLoading(false) }
}
```

### Closing Detail View (line 662)
```typescript
<div className="bk" onClick={() => go(prev)}>
  Back to {prev === 'profile' ? 'Profile' : prev === 'dashboard' ? 'Dashboard' : 'Explore'}
</div>
```

---

## 5. CSS CLASSES CONTROLLING VISIBILITY & LAYOUT

### Core Display Classes

| Class | Purpose | CSS |
|-------|---------|-----|
| `.page` | Page wrapper | `display: none` |
| `.page.on` | Active page | `display: block; min-height: calc(100vh - 93px)` |
| `.w` | Content wrapper | `max-width: 560px; width: 100%; margin: 0 auto; padding: 24px 20px 56px` |
| `.on` | Active state | Various (chips, tabs, buttons) |

### Vlog Card Classes (Feed)

| Class | Purpose |
|-------|---------|
| `.vl` | Vlog list container | `flex, column, border-radius 14px` |
| `.vr` | Vlog row (list item) | `flex, 13px gap, 14px padding` |
| `.vth` | Thumbnail | `88px × 58px, border-radius 10px` |
| `.vi` | Info section | `flex:1, min-width: 0` |
| `.feed-card` | Desktop card | `padding: 0, border: 1px, rounded 22px` |
| `.feed-video` | Desktop video | `aspect-ratio: 4/5, min-height: 560px` |

---

## 6. GRID & FLEX LAYOUTS FOR CARDS

### Grid Layouts

#### Google Images Browse Grid (lines 464-471)
```css
.gi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.gi-card {
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
}
```

#### Profile Vlog Grid (lines 259-267)
```css
.vg {
  display: grid;
  grid-template-columns: 1fr 1fr;  /* 2 columns */
  gap: 8px;
}
```

#### Dashboard Stats Grid (line 357)
```css
.kpig {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 9px;
}
```

#### Detail Stats Grid (line 189)
```css
.s4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border-radius: 24px;
}
```

### Flex Layouts

#### Vlog List (Line 82-104)
```css
.vl {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.vr {
  display: flex;
  gap: 13px;
  align-items: center;
}
```

#### Detail Layout (Lines 157-166)
```css
.w:has(> .bk) {
  display: flex;
  flex-direction: column;
}

.w:has(> .bk) > .bk { order: 0 }
.w:has(> .bk) > .vbox { order: 1 }
.w:has(> .bk) > .eng { order: 2 }
.w:has(> .bk) > .dtt { order: 3 }
```

---

## 7. RESPONSIVE PATTERNS SUMMARY

### Mobile-First Approach
- **Base**: 560px max-width containers, single-column layout
- **Navigation**: Sticky top nav (56px) + tab bar (37px) = 93px total
- **Padding**: 24px horizontal, 56px bottom (for tab bar)
- **Interaction**: Click to navigate between pages

### Desktop Enhancement (900px+)
- **Navigation**: 58px left side rail, 56px top nav
- **Filters**: Fixed panel (286px) on left, collapses on interaction (900-1160px)
- **Content**: Full-width with gutters, up to 1600px
- **Grids**: Auto-fill responsive grids with 4/5 column layouts
- **Panels**: Side panels fixed to viewport

### Key Responsive Values
```
Mobile: 560px max-width, 56px nav height
Tablet: 900px+ triggers desktop layout
Desktop: Up to 1600px with 420px panel
Small screens (<640px): 150px min grid columns, 12px padding
```

---

## 8. DETAIL VIEW DISPLAY MECHANISM

### Detail Page Template (lines 659-836)
The detail view is rendered in the DOM but hidden until `page === 'detail'`:
```jsx
{page === 'detail' && (
  <div className="page on">
    <div className="w">
      <div className="bk" onClick={() => go(prev)}>Back</div>
      
      {vlogLoading ? <div className="loading">...</div> : vlog ? (
        <>
          <div className="vbox">Video player</div>
          <div className="dtt">Title</div>
          <div className="dvl">Author info</div>
          <div className="s4">Stats</div>
          <div className="eng">Engagement buttons</div>
          <div className="ulb">Unlock box</div>
        </>
      ) : null}
    </div>
  </div>
)}
```

### CSS-Based Ordering
```css
.w:has(> .bk) > .bk { order: 0 }        /* Back button first */
.w:has(> .bk) > .vbox { order: 1 }      /* Video */
.w:has(> .bk) > .eng { order: 2 }       /* Engagement */
.w:has(> .bk) > .dtt { order: 3 }       /* Title */
.w:has(> .bk) > .dvl { order: 4 }       /* Author */
.w:has(> .bk) > .s4 { order: 5 }        /* Stats */
.w:has(> .bk) > .dd { order: 6 }        /* Description */
.w:has(> .bk) > .ulb { order: 7 }       /* Unlock */
```

---

## 9. KEY TAKEAWAYS

✅ Mobile-first design with progressive enhancement
✅ CSS-only state management using `.on` class and `:has()` selectors
✅ No JavaScript media queries — all responsive logic in CSS
✅ Predictable page switching with `page` state and `.page.on` class
✅ Google Images-inspired grid with auto-fill columns
✅ Detail view rendered in DOM but hidden until `page === 'detail'`
✅ Accessibility-first with proper semantic HTML and ARIA labels
✅ Performance-optimized with CSS-based visibility instead of rerendering

