# Tourista CSS Grid & Layout Reference

## Quick Reference: All Grid Systems

### 1. BROWSE PAGE - Feed Cards (Mobile)
**Used by:** `.vl.feed-videos` (lines 111-112)
**Structure:** Vertical flex list with auto aspect ratio

```css
.vl { display: flex; flex-direction: column; gap: 1px; }
.vr { display: flex; gap: 13px; padding: 14px 15px; }
.vth { width: 88px; height: 58px; border-radius: 10px; }
.vi { flex: 1; min-width: 0; }
```

**Result:** Single column, card-style layout with thumbnail + info

### 2. BROWSE PAGE - Feed Cards (Desktop)
**Used by:** `.w:has(> .flt-section) .feed-card` (lines 112-119)
**Structure:** Card-based grid

```css
.feed-card {
  display: block;
  border: 1px solid var(--color-border-secondary);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 8px 22px rgba(27,92,58,.08);
}

.w:has(> .flt-section) .feed-video {
  width: 100%;
  height: auto;
  aspect-ratio: 4/5;
  border-radius: 0;
  position: relative;
}

@media (min-width: 900px) {
  .w:has(> .flt-section) .feed-video {
    aspect-ratio: 4/5;
    min-height: 560px;
  }
}
```

**Result:** Large portrait video cards with 4:5 aspect ratio

---

### 3. PROFILE PAGE - Video Grid
**Used by:** `.vg` (lines 259-260)
**Structure:** 2-column responsive grid

```css
.vg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 0 16px 14px;
}

.vgc {
  border-radius: 10px;
  overflow: visible;
  cursor: pointer;
  border: 1px solid var(--color-border-tertiary);
  transition: border-color .12s;
}

.vgc:hover {
  border-color: var(--g);
}

.vgc:hover .pin-btn {
  opacity: 1!important;
}

.vgth {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vgi {
  padding: 8px 9px;
}
```

**Result:** 2-column grid with pinnable cards

---

### 4. DASHBOARD - KPI Stats Grid
**Used by:** `.kpig` (line 357)
**Structure:** 4-column stats grid

```css
.kpig {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 9px;
  margin-bottom: 22px;
}

.kp {
  padding: 13px;
  border-radius: 12px;
  border: 1px solid var(--color-border-tertiary);
  background: var(--color-background-primary);
}

.kpv { font-size: 20px; font-weight: 700; margin-bottom: 2px; }
.kpl { font-size: 11px; color: var(--color-text-secondary); text-transform: uppercase; }
```

**Result:** 4 equal-width stat boxes

---

### 5. DETAIL PAGE - Stats Grid
**Used by:** `.s4` (lines 189-192)
**Structure:** 4-column stat display

```css
.s4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border: 1px solid var(--color-border-secondary);
  border-radius: 24px;
  overflow: hidden;
  background: var(--color-background-primary);
  margin-bottom: 22px;
  box-shadow: 0 8px 20px rgba(27,92,58,.08);
}

.sb {
  padding: 20px 8px;
  background: var(--color-background-primary);
  text-align: center;
}

.sv { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
.sl { font-size: 10.5px; color: var(--color-text-secondary); text-transform: uppercase; }
```

**Result:** 4-column stat boxes with dividers

---

### 6. GOOGLE IMAGES BROWSE GRID
**Used by:** `.gi-grid` (lines 466-467)
**Structure:** Responsive auto-fill grid

```css
.gi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

@media (max-width: 640px) {
  .gi-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
  }
}

.gi-card {
  position: relative;
  cursor: pointer;
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-background-primary);
  border: 1px solid transparent;
  transition: all .12s;
  display: flex;
  flex-direction: column;
}

.gi-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(27,92,58,.12);
}

.gi-card.on {
  border-color: #1a73e8;
  outline: 2px solid #1a73e8;
  outline-offset: -2px;
}

.gi-thumb {
  width: 100%;
  aspect-ratio: 4/3;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-secondary);
}
```

**Result:** Responsive grid (4-5 cols desktop, 2 cols mobile) with hover effects

---

### 7. GOOGLE IMAGES SIDE PANEL
**Used by:** `.gi-panel` (lines 485-520)
**Structure:** Sticky side panel with scrolling

```css
.gi-panel {
  position: sticky;
  top: 155px;
  max-height: calc(100vh - 175px);
  overflow-y: auto;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border-secondary);
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(27,92,58,.1);
  scrollbar-width: thin;
}

@media (max-width: 1100px) {
  .gi-layout.with-panel {
    grid-template-columns: 1fr 360px;
    gap: 16px;
  }
}

@media (max-width: 900px) {
  .gi-layout.with-panel {
    grid-template-columns: 1fr;
  }
  
  .gi-panel {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: auto;
    max-height: 80vh;
    border-radius: 16px 16px 0 0;
    z-index: 300;
  }
}
```

**Result:** Sticky right panel (desktop) or bottom modal (mobile)

---

### 8. DETAIL PAGE - Content Ordering
**Used by:** `.w:has(> .bk)` (lines 157-167)
**Structure:** Flex column with CSS ordering

```css
.w:has(> .bk) {
  display: flex;
  flex-direction: column;
}

.w:has(> .bk) > * { order: 20 }      /* Default: last */
.w:has(> .bk) > .bk { order: 0 }     /* Back button */
.w:has(> .bk) > .loading { order: 1 }
.w:has(> .bk) > .vbox { order: 1 }   /* Video box */
.w:has(> .bk) > .eng { order: 2 }    /* Engagement */
.w:has(> .bk) > .dtt { order: 3 }    /* Title */
.w:has(> .bk) > .dvl { order: 4 }    /* Author line */
.w:has(> .bk) > .s4 { order: 5 }     /* Stats */
.w:has(> .bk) > .dd { order: 6 }     /* Description */
.w:has(> .bk) > .ulb { order: 7 }    /* Unlock box */
```

**Result:** Video + engagement first, then metadata

---

### 9. ENGAGEMENT BUTTONS
**Used by:** `.eng` (lines 196-197)
**Structure:** Flex equal-width buttons

```css
.eng {
  display: flex;
  gap: 10px;
  padding: 0;
  border-top: none;
  border-bottom: none;
  margin-bottom: 28px;
}

.eb {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 13px 8px;
  border-radius: 20px;
  border: 1.5px solid var(--color-border-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  transition: all .12s;
}

.eb:hover {
  background: var(--gp);
  border-color: var(--gm);
  color: var(--g1);
}

.eb.lk {
  color: #e53935;
  border-color: #facccc;
  background: #fff5f5;
}
```

**Result:** 4 equal-width buttons (Like, Comment, Share, Save)

---

### 10. ITINERARY DAYS
**Used by:** `.id` (lines 212-226)
**Structure:** Stacked cards with flex info

```css
.id {
  padding: 20px 24px;
  border: 1px solid var(--color-border-secondary);
  border-bottom: none;
  background: var(--color-background-primary);
}

.slbl + .id { border-radius: 22px 22px 0 0; }
.id:last-of-type {
  border-bottom: 1px solid var(--color-border-secondary);
  border-radius: 0 0 22px 22px;
  margin-bottom: 34px;
}

.ir1 {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.iday {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--g1);
  color: #fff;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
}

.inn {
  font-size: 17px;
  font-weight: 800;
  flex: 1;
  line-height: 1.35;
}

.ico {
  font-size: 13px;
  font-weight: 800;
  color: var(--g1);
  white-space: nowrap;
}
```

**Result:** Vertical stack with circular day badges

---

### 11. FILTER CHIPS ROW
**Used by:** `.cg` (lines 76-80)
**Structure:** Flex wrap chips

```css
.cg {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 7px;
}

.ch {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  border: 1.5px solid var(--color-border-secondary);
  color: var(--color-text-secondary);
  background: var(--color-background-primary);
  transition: all .12s;
}

.ch:hover {
  border-color: var(--g);
  color: var(--g);
  background: var(--gp);
}

.ch.on {
  background: var(--g);
  color: #fff;
  border-color: var(--g);
}
```

**Result:** Wrapping chip row with toggle states

---

## Responsive Strategy Summary

| Element | Mobile | Desktop (900px) | Desktop (1100px) |
|---------|--------|-----------------|-----------------|
| Max Content Width | 560px | 560px + margin | 1600px |
| Grid Columns | 1-2 | 2-4 | 4-5 |
| Sidebar | Hidden | Fixed 58px | Fixed 58px |
| Filter Panel | Collapsible | Fixed 286px | Fixed 286px |
| Panel Width | N/A | 420px | 360px |
| Feed Cards | Flex list | 4:5 cards | 4:5 cards min-560px |

---

## CSS Hierarchy: Grid vs Flex

### Use Grid When:
- Fixed number of columns (4 stats, profile grid)
- Need gap control between rows/cols
- Want auto-fill responsive behavior
- Creating card layouts with templates

### Use Flex When:
- One-dimensional layout (rows or columns)
- Equal spacing with gap
- Flexible content sizing (lists, buttons)
- Alignment is complex (center, space-between)

Tourista combines both:
- **Grid**: Browse, Stats, KPI displays
- **Flex**: Lists, Buttons, Navigation, Detail content

