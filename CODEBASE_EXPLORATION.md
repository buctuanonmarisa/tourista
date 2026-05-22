# Tourista Codebase Exploration Report

## Summary

I've explored the Tourista codebase and documented findings for 5 key areas:

### 1. COUNTRY LIST (Lines 55-72, 1154, 1341)
- **Current:** Only 6 countries (Philippines, Japan, Vietnam, Thailand, Indonesia, Other)
- **Location:** defaultPostForm (line 55), CITIES_BY_COUNTRY object (lines 65-72)
- **UI:** Two select dropdowns - Edit Profile (1154) and Post Form (1341)
- **Action:** Need to expand CITIES_BY_COUNTRY and both select elements

### 2. DAY EXPANSION (Lines 1472-1645)
- **Working:** YES - expandable collapsible days
- **Key Class:** `.day-card` with `.open` modifier when expanded
- **State:** `expanded?: boolean` in ItineraryFormDay interface
- **Toggle Button:** Line 1484-1486, toggles `expanded` state
- **CSS Classes:** `.day-hdr` (header), `.day-body` (expandable content)

### 3. MEDIA UPLOAD (Lines 318-349, 1499-1606)
- **Fully Implemented:**
  - Multiple media per day (media[] array)
  - Both images and videos supported
  - Carousel with navigation arrows and dot indicators
  - Optimistic UI updates with server sync
  - Error handling and rollback
  - Delete individual items
- **Handler:** handleDayMedia function (318-349)
- **UI:** Media carousel with counter, prev/next buttons, dot navigation (1502-1584)

### 4. EMOJI SUPPORT
- **Status:** NO emoji picker library found
- **Current:** Only hardcoded emoji labels (✨ 🍜 🚌 💡)
- **Text Input:** Standard HTML textarea fields (no emoji picker)
- **Dependencies:** None in package.json
- **Recommendation:** Add emoji-picker-react library

### 5. CREDITS & PUBLISH (Lines 1654-1692, 497-508)
- **calculateCreditsFromCost:** Lines 497-508
  - Formula: CEIL(Total Day Cost / 75)
  - 1 credit = ₱75 of trip cost
- **Step 3 Display:** 
  - Credits per tourist (Free or X credits)
  - Calculation breakdown box
  - Earnings estimate (80% to creator, estimated monthly income)
  - Ready to publish warning
- **CSS:** .crc, .crt, .crv, .cri classes

---

## DETAILED FINDINGS

### Country List Details
**File:** src/app/page.tsx

```typescript
// Line 55 - Default form
const defaultPostForm = { country: 'Philippines', ... }

// Lines 65-72 - City mapping
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'Philippines': [20+ cities],
  'Japan': [20+ cities],
  'Vietnam': [15+ cities],
  'Thailand': [15+ cities],
  'Indonesia': [20+ cities],
  'Other': []
}
```

**Select Dropdowns:**
- Edit Profile: Line 1154 (only 4 countries)
- Post Form Step 1: Line 1341 (6 countries including Other)

### Day Expansion Details

**State Interface** (Lines 43-50):
- `expanded?: boolean` - tracks open/closed state
- `media?: MediaItem[]` - multiple media items
- `mediaCarouselIndex?: number` - current carousel position

**Update Function** (Line 315):
```typescript
const updDay = (i: number, k: keyof ItineraryFormDay, v: string | boolean | null) =>
  setItinDays(d => d.map((x, j) => j === i ? { ...x, [k]: v } : x))
```

**CSS** (globals.css:319-337):
- `.day-card` - bordered container
- `.day-card.open` - adds border-bottom to header
- `.day-hdr` - flexbox header with gray background
- `.day-body` - flex column with 12px gap
- `.day-toggle` - expand/collapse button

### Media Upload Details

**handleDayMedia Function** (Lines 318-349):
1. Create object URL for preview
2. Add to state optimistically
3. Upload file to server
4. Replace local URL with server URL
5. On error: remove from state, revoke object URL

**Carousel Features**:
- Previous button: Moves index backward with wrap-around
- Next button: Moves index forward with wrap-around
- Dot indicators: 8px white dots, current dot fully opaque
- Counter: "current/total" format in top-right
- Delete: Removes current item and adjusts index

**Upload Zone** (Lines 1587-1605):
- Accepts both image/* and video/*
- Shows "Upload photos or videos" or "Add more..."
- Has uploading state indicator

### Emoji Implementation

**Hardcoded Labels:**
- Line 1610: `✨ Highlights`
- Line 1619: `🍜 Food tips`
- Line 1628: `🚌 Getting around`
- Line 1637: `💡 Tips & budget breakdown`
- Lines 971-974: Same emojis in detail view

**No Picker:**
- Standard textarea with onChange handler
- No emoji-picker-react or similar
- Users must type/paste emojis manually

### Credits Calculation

**Formula** (Lines 497-508):
```typescript
const totalDayCost = itinDays.reduce((sum, day) => {
  if (!day.cost.trim()) return sum
  const cleaned = day.cost.replace(/[₱$,\s]/g, '')
  const num = parseInt(cleaned) || 0
  return sum + num
}, 0)

return totalDayCost > 0 ? Math.ceil(totalDayCost / 75) : 0
```

**Display** (Lines 1667-1684):
- Large yellow number showing credits
- Gray box showing: Total Cost / 75 = Credits
- Info line showing: Credits × ₱10 per tourist × 80% = ₱creator_share
- Monthly projection: creator_share × 50 unlocks

**Example:**
- Day 1: ₱2,500
- Day 2: ₱1,500
- Total: ₱4,000
- Credits: CEIL(4000/75) = 54 credits
- Price: 54 × ₱10 = ₱540 per tourist
- Creator gets: ₱540 × 80% = ₱432
- Monthly est: ₱432 × 50 = ₱21,600

---

## FILE STRUCTURE

**src/app/page.tsx** (2,266 lines)
- Entire app in single component
- Types at top (6-51)
- Constants (55-72)
- State hooks (75-145)
- API helpers (149-207)
- Helper functions (209-520)
- Render return (524-2266)

**src/app/globals.css** (500+ lines)
- Design tokens and colors
- Component styles
- Post form styles (270-356)
- Day card styles (319-337)

---

## RECOMMENDATIONS

**High Priority:**
1. Expand country list to all 195+ countries
2. Add emoji picker library
3. Refactor 2,266-line component into smaller files

**Medium Priority:**
4. Add image crop/rotate features
5. Add media captions
6. Implement lazy loading

**Low Priority:**
7. Add featured media option
8. Performance optimizations
9. Code splitting

---

## CODE SNIPPETS

### Get Calculate Credits Value
Location: Line 497-508
This function is called on line 1656 in Step 3 form

### Modify Day Expansion
Location: Line 1484
Change the onClick handler to modify expand behavior

### Add Media to Day
Location: Line 318
handleDayMedia is called from line 1595 when user uploads

### View Current Countries
Location: Line 65-72
CITIES_BY_COUNTRY object contains all mappings

---

## NEXT STEPS

1. **Review** this document with the team
2. **Prioritize** which features to expand first
3. **Create tasks** for each recommendation
4. **Plan refactoring** of page.tsx into components
