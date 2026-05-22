# TOURISTA LAYOUT STRUCTURE ANALYSIS

## Quick Reference - File Paths & Classes

### Core Files
- **Main App**: `src/app/page.tsx` (1,500+ lines)
- **Styling**: `src/app/globals.css` (546 lines)  
- **Root Layout**: `src/app/layout.tsx` (minimal wrapper)

---

## 1. NAVIGATION BAR

**File**: `src/app/page.tsx` (lines 478-509)

| Component | CSS Class | Details |
|-----------|-----------|---------|
| Container | `.nav` | `height: 56px`, sticky, flex layout |
| Wrapper | `.nav-inner` | `max-width: 560px`, centered |
| Logo | `.logo` | Clickable brand element |
| Logo Text | `.logo-t` | 19px, dark green (#1B5C3A) |
| Spacer | `.sp` | `flex: 1` (pushes items right) |
| Icon Buttons | `.ni` | 36×36px, hover: light green bg |
| Primary Button | `.pbtn` | Green bg, rounded pill |
| Avatar | `.avb` | 33×33px circle, green |
| Badge | `.ndot` | Red dot, top-right |

---

## 2. SIDE RAIL (Left Sidebar)

**File**: `src/app/page.tsx` (lines 511-536)

| Component | CSS Class | Details |
|-----------|-----------|---------|
| Container | `.side-rail` | Fixed left sidebar (58px width) |
| Nav Button | `.side-btn` | 42×42px, rounded, flex centered |
| Active Button | `.side-btn.on` | Light green bg + green icon |
| Post Button | `.side-btn.post` | Green text, white on hover |
| Avatar Button | `.side-avatar` | 38×38px circle at bottom |
| Active Avatar | `.side-avatar.on` | Green outline shadow |

**Responsive**: Hidden on mobile, fixed on desktop (900px+)

---

## 3. TABS SECTION (Mobile-Only)

**File**: `src/app/page.tsx` (lines 538-549)

| Component | CSS Class | Details |
|-----------|-----------|---------|
| Container | `.tabs` | Sticky, scrollable flex |
| Inner | `.tabs-inner` | Max-width 560px, scrolls horizontally |
| Tab | `.tb` | 11×14px padding, border-bottom indicator |
| Active Tab | `.tb.on` | Green text + green border |
| Close Button | `.tx` | 16×16px circle, green on hover |

**Responsive**: Hidden on desktop (900px+)

---

## 4. BROWSE PAGE FILTERS

### Search Input
**File**: `src/app/page.tsx` (lines 558-562)

| Component | CSS Class | Details |
|-----------|-----------|---------|
| Container | `.si` | Flex, border, focus shadow |
| Input | `.si input` | Full-width, transparent bg |

### Collapsible Filter Section
**File**: `src/app/page.tsx` (lines 565-606)

| Component | CSS Class | Details |
|-----------|-----------|---------|
| Container | `.flt-section` | Border-radius 12px, margin-bottom 20px |
| Header | `.flt-hdr` | Flex, space-between, clickable |
| Title | `.flt-title` | Uppercase, secondary color |
| Active Filters | `.flt-active` | Green text, shows selected filters |
| Toggle Button | `.flt-tog` | Collapse/expand with rotating arrow |
| Body | `.flt-body` | Collapsible content area |
| Row | `.flt-row` | Group for vibe/region/budget |
| Category Label | `.clbl` | Uppercase, small |

### Filter Chips
| Component | CSS Class | Details |
|-----------|-----------|---------|
| Group | `.cg` | Flex, wrap, gap 6px |
| Chip | `.ch` | 6×14px padding, rounded pill |
| Active Chip | `.ch.on` | Green bg, white text |

**Responsive Desktop (900px+)**:
- `.flt-section` becomes fixed left sidebar (286px)
- `position: fixed; left: 72px; top: 82px`

---

## 5. VLOG CARDS & LIST VIEW

**File**: `src/app/page.tsx` (lines 613-650)

| Component | CSS Class | Details |
|-----------|-----------|---------|
| List Container | `.vl` | Flex column, gap 1px, rounded |
| Card Row | `.vr` | Flex, gap 13px, padding 14×15px |
| Thumbnail | `.vth` | 88×58px, rounded, gradient bg |
| Play Button | `.vp` | 26×26px circle, white |
| Info Section | `.vi` | Flex 1, min-width 0 |
| Title | `.vt` | 13.5px, ellipsis |
| Metadata | `.vm` | 12px, flex, secondary color |
| Badge | `.bx` | Small, rounded |
| Credit Badge | `.bc` | Yellow bg (credits) |
| Free Badge | `.bf` | Green bg (free) |
| Avatar | `.av` | 20×20px circle |

**Thumbnail Colors**:
- `.t1` - Green gradient
- `.t2` - Brown gradient
- `.t3` - Blue gradient
- `.t4` - Purple gradient
- `.t5` - Dark green gradient

**Feed Variants**:
| Component | CSS Class | Details |
|-----------|-----------|---------|
| Feed Layout | `.feed-videos` | Gap 22px, no border, transparent |
| Feed Card | `.feed-card` | Rounded 22px, shadow, 4:5 aspect |
| Feed Video | `.feed-video` | 4:5 aspect ratio |

---

## 6. DETAIL PAGE STRUCTURE

**File**: `src/app/page.tsx` (lines 659-836)

### Key Sections
| Section | CSS Classes | Details |
|---------|------------|---------|
| Back Button | `.bk` | Green text, font-weight 700 |
| Video | `.vbox`, `.vpl`, `.vpbig` | 16:9 aspect, rounded, shadow |
| Watch On | `.won`, `.pp` | Platform links with color dots |
| Title | `.dtt` | 28px, font-weight 800 |
| Author | `.dvl`, `.dvln`, `.fbtn` | Author info + follow button |
| Stats | `.s4`, `.sb`, `.sv` | 4-column grid |
| Engagement | `.eng`, `.eb` | Like, comment, share, save |
| Unlock Box | `.ulb`, `.ulc` | Yellow gradient, orange button |
| Itinerary | `.id`, `.iday`, `.idc` | Day-by-day breakdown |
| Reviews | `.ri`, `.rin`, `.rsb` | User reviews + input |

---

## 7. PAGE WRAPPER

| Component | CSS Class | Details |
|-----------|-----------|---------|
| Page Container | `.page` | `display: none` by default |
| Active Page | `.page.on` | `display: block` |
| Content Wrapper | `.w` | `max-width: 560px`, centered |

---

## 8. RESPONSIVE BREAKPOINTS

**Mobile (< 900px)**:
- Top nav + tabs visible
- Side rail hidden
- Filters normal layout

**Desktop (900px - 1160px)**:
- Fixed left sidebar (58px)
- Tabs hidden
- Filters collapsible with hover

**Wide Desktop (>= 1160px)**:
- Filters fixed sidebar (286px)
- Detail panel right (420px)

---

## 9. COLOR VARIABLES

```css
--g: #2A7A50             /* Main Green */
--g1: #1B5C3A            /* Dark Green */
--gl: #E6F5ED            /* Green Light BG */
--y: #D08A0A             /* Main Yellow */
--b: #0876A8             /* Main Blue */
--color-text-primary: #162A1F
--color-text-secondary: #567268
--color-background-primary: #FFFFFF
--color-border-secondary: rgba(27,92,58,.13)
```

