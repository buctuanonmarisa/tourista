# Tourista Codebase Documentation Index

## 📚 Documentation Files

All files are in the project root directory:

### 1. **RESPONSIVE_DESIGN_ANALYSIS.md** ⭐ START HERE
**What it covers:**
- Media queries in globals.css (all breakpoints)
- CSS classes controlling visibility (.page, .on, .w)
- Grid and flex layouts for cards
- Detail view opening/closing logic
- Page state management system

**Best for:** Understanding how responsive design works

---

### 2. **CSS_LAYOUT_REFERENCE.md** 
**What it covers:**
- All 11 grid systems with code samples
- Browse feed cards (mobile vs desktop)
- Profile video grid (2-column)
- Dashboard KPI stats (4-column)
- Google Images grid (auto-fill responsive)
- Engagement buttons flex layout
- Itinerary days stacking

**Best for:** Copy-pasting layout patterns

---

### 3. **PAGE_STATE_FLOW.md**
**What it covers:**
- Page state machine (browse → detail → etc.)
- Navigation entry points
- Detail view opening mechanism
- Data fetching functions
- LocalStorage persistence
- API endpoints
- Feed intersection observer

**Best for:** Understanding how pages switch

---

### 4. **ARCHITECTURE_SUMMARY.md**
**What it covers:**
- Quick start overview
- Responsive design breakpoints (640px, 900px, 1100px)
- Page switching mechanism
- CSS class patterns
- Detail view layout with CSS order
- Grid vs Flex decision guide
- Design tokens (colors, spacing)

**Best for:** High-level architecture understanding

---

### 5. **BREAKPOINT_VISUAL_GUIDE.md**
**What it covers:**
- Visual ASCII diagrams of layouts
- Desktop layout (>900px) visualization
- Tablet layout (900-1100px) visualization
- Mobile layout (<900px) visualization
- Grid system visualizations (2-col, 4-col, auto-fill)
- Navigation state machine diagram
- CSS selector patterns

**Best for:** Visual learners

---

## 🎯 Quick Navigation

### I want to...

**Understand responsive design:**
1. Read RESPONSIVE_DESIGN_ANALYSIS.md (Section 2-7)
2. Check BREAKPOINT_VISUAL_GUIDE.md for visuals
3. See ARCHITECTURE_SUMMARY.md (Section 1)

**Add a new grid layout:**
1. Check CSS_LAYOUT_REFERENCE.md (Section 1-11)
2. Choose Grid or Flex from ARCHITECTURE_SUMMARY.md
3. Copy code sample and adapt

**Add a new page:**
1. Read PAGE_STATE_FLOW.md (Section 1-2)
2. Review page routing table (Section 9)
3. Look at similar page in page.tsx

**Understand detail view:**
1. Read RESPONSIVE_DESIGN_ANALYSIS.md (Section 4, 8)
2. Check CSS_LAYOUT_REFERENCE.md (Section 8 - Detail Page)
3. See PAGE_STATE_FLOW.md (Section "DETAIL PAGE")

**Fix mobile layout:**
1. Check BREAKPOINT_VISUAL_GUIDE.md (Mobile Layout section)
2. Find relevant CSS in globals.css
3. Review media query in RESPONSIVE_DESIGN_ANALYSIS.md (Section 2)

---

## 📊 Key Concepts

### Responsive Breakpoints
```
Mobile (default):    560px max-width
Tablet (900px+):     Side rail appears, tabs hide
Desktop (1100px+):   Wider panels, full-width content
Small screens (<640px): Smaller grid columns
```

### Page Switching
```
State: page = 'browse' | 'detail' | 'profile' | 'edit' | 'post' | 'dashboard' | 'notif'
CSS: .page { display: none } → .page.on { display: block }
Result: Only one page visible at a time
```

### Grid vs Flex
```
Grid:  Fixed columns, template-based       (profile: 2-col, stats: 4-col, browse: auto-fill)
Flex:  Flexible sizing, direction-based    (lists, buttons, navigation)
```

### Detail View Layout
```
Uses CSS order property to arrange content visually
.order: 0 = back button (first)
.order: 1 = video
.order: 2 = engagement buttons
.order: 3 = title
... etc
```

---

## 🔧 File Locations in Codebase

### CSS
- **src/app/globals.css** (1546 lines)
  - Lines 1-54: Base styles, nav, variables
  - Lines 123-149: Desktop layout (900px+)
  - Lines 151-154: Filter panel collapse (900-1160px)
  - Lines 157-167: Detail page CSS ordering
  - Lines 189-192: Detail stats grid
  - Lines 259-267: Profile video grid
  - Lines 357-359: Dashboard KPI grid
  - Lines 464-520: Google Images grid & panel
  - Lines 523-537: Mobile responsive adjustments

### React/TypeScript
- **src/app/page.tsx** (1529 lines)
  - Lines 59-71: Page state management
  - Lines 126-137: Data fetching
  - Lines 192-201: Detail view opening
  - Lines 474-1527: Full render logic
  - Lines 554-654: Browse page
  - Lines 659-836: Detail page
  - Lines 841-931: Profile page
  - Lines 1012-1419: Post vlog page
  - Lines 1424-1492: Dashboard page
  - Lines 1498-1525: Notifications page

---

## 🎨 Design System

### Colors
```
Primary:   --g: #2A7A50 (Green)
Secondary: --b: #0876A8 (Blue)
Accent:    --y: #D08A0A (Yellow)
Text:      --color-text-primary: #162A1F
BG:        --color-background-primary: #FFFFFF
           --color-background-secondary: #F2FAF6
```

### Spacing
```
Gaps:      6px, 8px, 10px, 13px, 20px, 24px
Padding:   8px, 11px, 14px, 20px, 24px
Radius:    6px, 10px, 12px, 14px, 20px, 22px, 24px
```

### Navigation Heights
```
Mobile:    56px nav + 37px tabs = 93px total
Desktop:   56px nav + 58px side rail (fixed left)
Content:   56px bottom padding for mobile tabs
```

---

## 🚀 Implementation Examples

### Add 3-Column Grid
```css
.my-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 900px) {
  .my-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .my-grid {
    grid-template-columns: 1fr;
  }
}
```

### Add New Page
```typescript
// 1. Add to page state
const [page, setPage] = useState('browse')

// 2. Add navigation
const go = (p: string) => { setPrev(page); setPage(p) }

// 3. Render page
{page === 'mypage' && (
  <div className="page on">
    <div className="w">
      {/* Your content */}
    </div>
  </div>
)}

// 4. Add button to navigate
<button onClick={() => go('mypage')}>Open My Page</button>
```

### Make Detail View Open
```typescript
const openD = async (from: string, vlogId?: string) => {
  setPrev(from)                    // Save context
  setPage('detail')                // Switch page
  setVlogLoading(true)
  try {
    const r = await fetch(`/api/vlogs/${vlogId}`)
    setVlog(await r.json())        // Load data
  } finally { setVlogLoading(false) }
}

// Trigger with:
onClick={() => openD('browse', v.id)}
```

---

## 📱 Testing Checklist

### Mobile (< 640px)
- [ ] Content fits 560px max-width
- [ ] Grid columns reduce to 1 or 2
- [ ] Nav is 56px, tabs 37px
- [ ] Bottom padding 56px for tabs
- [ ] Touch targets are 44px+ height

### Tablet (640px - 900px)
- [ ] Side rail still hidden
- [ ] Filter panel inline or collapsible
- [ ] Grid columns are 2-3
- [ ] Nav visible, tabs visible

### Desktop (900px+)
- [ ] Side rail visible (58px fixed left)
- [ ] Filter panel fixed (286px)
- [ ] Tabs hidden
- [ ] Full content width (1600px max)
- [ ] All 4 stat columns visible

### Desktop Large (1100px+)
- [ ] Panel width 420px
- [ ] Content still readable
- [ ] No horizontal scroll

---

## 🐛 Common Issues & Solutions

**Issue:** Content too wide on desktop
**Solution:** Check max-width constraints in globals.css (default 560px mobile, 1600px desktop)

**Issue:** Grid not responsive
**Solution:** Use `repeat(auto-fill, minmax(Xpx, 1fr))` or add media queries at 640px/900px

**Issue:** Page not switching
**Solution:** Verify `.page { display: none }` / `.page.on { display: block }` CSS

**Issue:** Detail view doesn't open
**Solution:** Check `openD()` function saves `prev` state before switching page

**Issue:** Mobile layout broken
**Solution:** Content wrapper `.w` should have `max-width: 560px; padding: 24px 20px 56px`

---

## 📖 Additional Resources

### In the Code
- **globals.css** - All styles (reference implementation)
- **page.tsx** - All logic and rendering
- Line numbers provided in every document for quick reference

### Design Patterns Used
- Mobile-first responsive design
- CSS state management with classes
- React hooks for data/state management
- IntersectionObserver for feed detection
- localStorage for persistence

---

## 🎓 Learning Path

**Complete Beginner:**
1. BREAKPOINT_VISUAL_GUIDE.md (visualize)
2. ARCHITECTURE_SUMMARY.md (high-level)
3. RESPONSIVE_DESIGN_ANALYSIS.md (details)

**Want to Build:**
1. ARCHITECTURE_SUMMARY.md (overview)
2. CSS_LAYOUT_REFERENCE.md (patterns)
3. PAGE_STATE_FLOW.md (navigation)

**Need Reference:**
1. Find your topic in this index
2. Jump to relevant document section
3. Check line numbers in source files

---

## ✅ Checklist: Understanding Tourista Architecture

- [ ] Know the 3 main breakpoints (640px, 900px, 1100px)
- [ ] Understand `.page` / `.page.on` display pattern
- [ ] Can explain page state machine (7 pages)
- [ ] Know how detail view opens (openD function)
- [ ] Understand grid vs flex usage
- [ ] Can read CSS media queries
- [ ] Know how CSS `order` arranges detail view
- [ ] Can add new grid layout
- [ ] Can add new page
- [ ] Know design tokens (colors, spacing)

---

**Last Updated:** May 19, 2026
**Tourista Version:** Latest
**Documentation Status:** ✅ Complete

