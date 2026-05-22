# Tourista Codebase - Detailed Findings

## QUICK REFERENCE

### 1. Country List (Lines 55-72, 1154, 1341)
- Currently: 6 countries (Philippines, Japan, Vietnam, Thailand, Indonesia, Other)
- CITIES_BY_COUNTRY object at line 65-72
- Two select dropdowns need updating

### 2. Day Expansion (Lines 1472-1645)
- Uses `expanded?: boolean` in ItineraryFormDay
- Toggle button at line 1484-1486
- CSS classes: .day-card, .day-hdr, .day-body at globals.css:319-337

### 3. Media Upload (Lines 318-349, 1499-1606)
- handleDayMedia function at 318-349
- Supports images and videos
- Carousel with navigation arrows and dot indicators
- Optimistic UI updates with server sync

### 4. Emoji Support
- Status: NO emoji picker library
- Only hardcoded emoji labels
- Standard textarea inputs (no picker)
- Recommendation: Add emoji-picker-react

### 5. Credits & Publish (Lines 1654-1692, 497-508)
- Formula: Credits = CEIL(Total Cost / 75)
- Shows calculation breakdown
- Displays earnings estimate (80% to creator)
- Projects monthly income

## KEY CODE LOCATIONS

### Default Form & Countries
src/app/page.tsx line 55:
```
const defaultPostForm = { country: 'Philippines', ... }
```

src/app/page.tsx lines 65-72:
```
const CITIES_BY_COUNTRY: Record<string, string[]> = { ... }
```

### Day Expansion Toggle
src/app/page.tsx line 1484:
```
<button className="day-toggle" onClick={() => updDay(i, 'expanded', !d.expanded)}>
```

### Media Upload
src/app/page.tsx line 318:
```
const handleDayMedia = async (i: number, file: File) => { ... }
```

### Calculate Credits
src/app/page.tsx line 497:
```
const calculateCreditsFromCost = () => { ... }
```

### Step 3 Display
src/app/page.tsx line 1656:
```
const calculatedCredits = calculateCreditsFromCost()
```

---

## RECOMMENDATIONS

**High Priority:**
1. Expand country list to 195+ countries
2. Add emoji picker library
3. Refactor 2,266-line component

**Medium Priority:**
4. Add image crop/rotate features
5. Add media captions
6. Implement lazy loading

**Low Priority:**
7. Add featured media option
8. Performance optimizations
