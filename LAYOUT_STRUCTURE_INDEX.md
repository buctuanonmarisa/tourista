# TOURISTA CODEBASE LAYOUT STRUCTURE - COMPLETE ANALYSIS

**Analysis Date**: May 19, 2026  
**Status**: Complete exploration of layout components, CSS classes, and structure

---

## 📁 Documentation Files Created

This analysis is split across multiple documents for easy reference:

### 1. **LAYOUT_ANALYSIS.md** (6.0 KB)
Quick reference table with:
- File paths and line numbers
- CSS class names organized by component
- Responsive breakpoint details
- Color variable system
- State-driven CSS classes

**Use this for**: Quick lookup of CSS classes and where they're defined

---

### 2. **LAYOUT_COMPONENTS.txt** (8.0 KB)
Visual component breakdown with:
- ASCII diagrams of each section
- Complete class descriptions
- Responsive behavior explanations
- Color system reference
- Interaction patterns

**Use this for**: Understanding component structure and interactions

---

### 3. Additional Documents (Already in repo)
- **PAGE_STATE_FLOW.md** - State management architecture
- **RESPONSIVE_DESIGN_ANALYSIS.md** - Detailed responsive behavior

---

## 🎯 Quick Navigation

### By Component

**Navigation & Sidebar**
- Navigation Bar (.nav) → See LAYOUT_COMPONENTS.txt section 1
- Side Rail (.side-rail) → See LAYOUT_COMPONENTS.txt section 2
- Tabs (.tabs) → See LAYOUT_COMPONENTS.txt section 3

**Browse Page**
- Search Input (.si) → LAYOUT_COMPONENTS section 4
- Collapsible Filters (.flt-section) → LAYOUT_COMPONENTS section 4
- Filter Chips (.ch) → LAYOUT_COMPONENTS section 4
- Vlog List (.vl, .vr) → LAYOUT_COMPONENTS section 5

**Detail Page**
- Back Button (.bk) → LAYOUT_COMPONENTS section 6
- Video Section (.vbox, .vpl) → LAYOUT_COMPONENTS section 6
- Stats Grid (.s4) → LAYOUT_COMPONENTS section 6
- Itinerary (.id, .iday) → LAYOUT_COMPONENTS section 6
- Reviews (.ri, .rin) → LAYOUT_COMPONENTS section 6
- Engagement (.eng, .eb) → LAYOUT_COMPONENTS section 6
- Unlock Box (.ulb) → LAYOUT_COMPONENTS section 6

### By File Location

**src/app/page.tsx** (Main Application)
| Component | Lines |
|-----------|-------|
| Navigation Bar | 478-509 |
| Side Rail | 511-536 |
| Tabs | 538-549 |
| Browse Filters | 554-654 |
| Detail Page | 659-836 |
| Other Pages | 838-1528 |

**src/app/globals.css** (Styling)
| Section | Lines |
|---------|-------|
| Navigation | 21-40 |
| Side Rail | 34, 134-141 |
| Tabs | 42-49 |
| Filters | 62-80 |
| Vlog List | 82-121 |
| Detail | 156-241 |
| Responsive | 123-155 |

---

## 🎨 CSS Class Quick Reference

### Navigation
```
.nav, .nav-inner, .logo, .logo-t, .sp, .ni, .pbtn, .avb, .ndot
```

### Sidebar
```
.side-rail, .side-btn, .side-btn.on, .side-btn.post, .side-avatar
```

### Tabs
```
.tabs, .tabs-inner, .tb, .tb.on, .tx
```

### Filters
```
.si, .flt-section, .flt-hdr, .flt-title, .flt-active, .flt-tog, 
.flt-body, .flt-row, .clbl, .cg, .ch, .ch.on
```

### Vlog Cards
```
.vl, .vr, .vth, .vp, .vi, .vt, .vm, .bx, .bc, .bf, .av,
.feed-videos, .feed-card, .feed-video
```

### Detail Page
```
.bk, .vbox, .vpl, .vpbig, .won, .pp, .pdot,
.dtt, .dvl, .dvln, .fbtn, .s4, .sb, .sv, .sl,
.dd, .eng, .eb, .eb.lk, .ulb, .ulc,
.id, .iday, .inn, .ico, .idc, .iclr, .icth, .icp,
.rlbl, .ri, .rn, .rs, .rin, .rsb
```

---

## 🔄 Responsive Behavior Summary

| Breakpoint | Layout | Side Rail | Tabs | Filters |
|------------|--------|-----------|------|---------|
| Mobile (<900px) | Full-width | Hidden | Visible | Normal |
| Tablet (900-1160px) | Split | Fixed 58px | Hidden | Hover expand |
| Desktop (≥1160px) | 3-column | Fixed 58px | Hidden | Fixed 286px |

---

## 🎭 State Management

Key component states (from src/app/page.tsx):

```javascript
// Navigation
page, prev

// Browse Filters  
search, vibe, region, budget, filtersOpen, activeFeedId

// Data
vlogs, vlog, profile, myVlogs

// Detail Page
liked, likeCount, unlocked, reviewText, followStates

// Post Form
postStep, videoUrl, postForm, itinDays, publishing

// UI
nCnt (notification count), readN (read notifications)
```

---

## 🎯 Implementation Notes

### Single Page Application
- All pages managed in `page.tsx` with state `const [page, setPage]`
- Pages toggle via `.page.on` CSS class
- Navigation via `go(page)` function

### CSS Architecture
- Atomic utility classes (.ni, .ch, .eb, etc.)
- Responsive CSS with @media queries
- CSS custom properties for colors (:root variables)
- No external UI libraries used

### Layout Strategy
- Mobile-first design
- Viewport width 560px max for mobile content
- Desktop adds 58px sidebar + 286px filters
- Detail panel uses sticky positioning

### Interactions
- IntersectionObserver for feed auto-play
- LocalStorage for drafts and pinned vlogs
- CSS transitions for smooth animations
- Aria labels for accessibility

---

## 🔗 File Locations

**Core Application Files**
```
src/app/
├── layout.tsx (20 lines - Root wrapper)
├── page.tsx (1,528 lines - ALL components + logic)
└── globals.css (546 lines - ALL styling)
```

**API Routes**
```
src/app/api/
├── vlogs/ (GET, POST)
├── vlogs/[id]/ (GET)
├── vlogs/[id]/like/ (POST)
├── vlogs/[id]/reviews/ (POST)
├── vlogs/[id]/unlock/ (POST)
├── profile/ (GET, PUT)
└── upload/ (POST)
```

**Database**
```
prisma/
└── schema.prisma - Database schema
```

---

## 📊 Component Breakdown by Purpose

### Navigation (Header + Sidebar)
- `.nav` - Top header (56px height)
- `.side-rail` - Left sidebar (58px width, desktop only)
- Both provide access to: Browse, Filters, Notifications, Dashboard, Post, Profile

### Content Area
- `.page` - Page container (hidden/shown via .on class)
- `.w` - Content wrapper (max-width 560px)

### Browse Section
- `.si` - Search input
- `.flt-section` - Collapsible filters
- `.cg` + `.ch` - Chip groups (vibe, region, budget)
- `.vl` + `.vr` - Vlog card list

### Detail Section
- `.vpl` - Video player (16:9 aspect)
- `.dtt` - Title (28px)
- `.dvl` - Author info
- `.s4` - Stats grid (4 columns)
- `.eng` - Engagement buttons
- `.id` - Itinerary days
- `.ri` - Reviews

### Special Components
- `.ulb` - Unlock box (premium content)
- `.en` - Post form sections
- `.pcv` + `.pbar` - Profile header

---

## 🎨 Color Palette

**Primary (Green - Land theme)**
- Main: #2A7A50 (--g)
- Dark: #1B5C3A (--g1)
- Light BG: #E6F5ED (--gl)

**Accent (Yellow - Sun)**
- Main: #D08A0A (--y)
- Light BG: #FEF0CC (--yl)

**Secondary (Blue - Water)**
- Main: #0876A8 (--b)
- Light BG: #D8F0FA (--bl)

**Text**
- Primary: #162A1F (dark)
- Secondary: #567268 (gray)

**Background**
- Primary: #FFFFFF (white)
- Secondary: #F2FAF6 (light gray)
- Tertiary: #EBF5F0 (lighter gray)

---

## ✅ Key Takeaways

1. **Single file architecture** - All UI in page.tsx, all CSS in globals.css
2. **Atomic CSS** - Small, reusable utility classes
3. **State-driven** - CSS toggles based on React state (.page.on, .ch.on, etc.)
4. **Mobile-first** - Base styles for mobile, enhancements at 900px breakpoint
5. **No frameworks** - Pure React + CSS, no component libraries
6. **Highly customizable** - Every detail is directly editable
7. **Color system** - Uses CSS custom properties for consistency
8. **Responsive** - Adapts from mobile (full width) to desktop (3-column)

---

## 📝 Notes for Future Development

- Consider breaking page.tsx into smaller component files
- All styling is in one file - consider CSS modules or Tailwind
- State management could use Context API or state library
- Add TypeScript stricter type checking
- Consider accessibility improvements (WCAG)
- Performance: memoize components, optimize re-renders

---

**Analysis Complete** ✓  
All layout components mapped, CSS classes documented, responsive behavior explained.

