# Tourista Page State & Navigation Flow

## Page State Machine

```typescript
// State Management
const [page, setPage] = useState('browse')        // Current page
const [prev, setPrev] = useState('browse')        // Previous page (for back button)

// Navigation
const go = (p: string) => { setPrev(page); setPage(p) }
const closeT = () => setPage('browse')

// Available Pages
type Page = 'browse' | 'detail' | 'profile' | 'edit' | 'post' | 'dashboard' | 'notif'
```

---

## Page Rendering Pattern

All pages follow this pattern:

```jsx
{page === 'browse' && (
  <div className="page on">
    <div className="w">
      {/* Page content */}
    </div>
  </div>
)}
```

### CSS Display Logic
```css
.page { display: none }                                    /* Hidden by default */
.page.on { display: block; min-height: calc(100vh - 93px) } /* Visible when .on */
```

---

## Page Navigation Map

### BROWSE PAGE (Default)
**Route:** `page === 'browse'`
**Entry:** App start, logo click, "Explore" button
**Exit:** Click vlog card → detail, Dashboard btn → dashboard, etc.

```
browse
  ├─ → detail (openD('browse', vlogId))
  ├─ → dashboard (go('dashboard'))
  ├─ → post (go('post'))
  ├─ → profile (go('profile'))
  ├─ → notif (go('notif'))
  └─ → edit (from profile)
```

**Browse State:**
```typescript
const [search, setSearch] = useState('')
const [vibe, setVibe] = useState('All vlogs')
const [region, setRegion] = useState('All regions')
const [budget, setBudget] = useState('Any budget')
const [filtersOpen, setFiltersOpen] = useState(true)
const [vlogs, setVlogs] = useState<VlogCard[]>([])
```

**Key Functions:**
- `fetchVlogs()` - Fetch filtered vlog list (lines 126-137)
- `openD('browse', vlogId)` - Open detail view

---

### DETAIL PAGE
**Route:** `page === 'detail'`
**Entry:** Click vlog card from browse/profile/dashboard
**Exit:** Back button (returns to `prev`)

```
detail
  └─ back to prev (browse | profile | dashboard)
```

**Detail State:**
```typescript
const [vlog, setVlog] = useState<VlogDetail | null>(null)
const [vlogLoading, setVlogLoading] = useState(false)
const [liked, setLiked] = useState(false)
const [likeCount, setLikeCount] = useState(0)
const [unlocked, setUnlocked] = useState(false)
const [reviewText, setReviewText] = useState('')
const [followStates, setFollowStates] = useState<Record<string, boolean>>({})
```

**Detail Opening (lines 192-201):**
```typescript
const openD = async (from: string, vlogId?: string) => {
  setPrev(from)                    // Save where we came from
  setPage('detail')
  setUnlocked(false)
  setReviewText('')
  
  if (!vlogId) return
  
  setVlogLoading(true)
  try {
    const r = await fetch(`/api/vlogs/${vlogId}`)
    const d: VlogDetail = await r.json()
    setVlog(d)
    setLikeCount(d.likes)
    setLiked(false)
  } finally { setVlogLoading(false) }
}
```

**Detail Interactions:**
- `tLike()` - Like/unlike vlog
- `doUnlock()` - Unlock itinerary with credits
- `submitReview()` - Post review
- `tFollow(id)` - Toggle follow author

---

### PROFILE PAGE
**Route:** `page === 'profile'`
**Entry:** Profile button, Author name click from detail
**Exit:** Edit → edit profile, Back → browse, Detail → detail

```
profile
  ├─ → edit (go('edit'))
  ├─ → detail (openD('profile', vlogId))
  └─ back to browse
```

**Profile State:**
```typescript
const [profile, setProfile] = useState<UserProfile | null>(null)
const [followStates, setFollowStates] = useState<Record<string, boolean>>({})
const [pinnedVlogIds, setPinnedVlogIds] = useState<Set<string>>(...)
```

**Profile Render (lines 841-931):**
- Cover photo with gradient
- Avatar + name + verified badge
- Stats: vlogs, avg rating, views, credits
- Pinned vlogs section (if any)
- All vlogs grid (2-column)

---

### EDIT PROFILE PAGE
**Route:** `page === 'edit'`
**Entry:** Edit button from profile
**Exit:** Cancel → profile, Save → profile

```
edit
  ├─ save profile (saveProfile())
  └─ cancel (go('profile'))
```

**Edit Form State:**
```typescript
const [pForm, setPForm] = useState({
  name: '',
  tagline: '',
  bio: '',
  country: 'Philippines',
  travelStyle: 'Budget',
  youtubeUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
})
```

**Edit Functions:**
- `saveProfile()` - Save to API (lines 408-414)
- `handleUpload(file)` - Upload avatar/cover (lines 416-421)

---

### POST A VLOG PAGE
**Route:** `page === 'post'`
**Entry:** Post button, Dashboard
**Exit:** Publish → dashboard, Cancel → browse, Back → previous

```
post (multi-step form)
  ├─ Step 1: Video & Info
  ├─ Step 2: Itinerary
  ├─ Step 3: Credits & Publish
  └─ Back at any step returns to browse
```

**Post State (lines 87-107):**
```typescript
const [postStep, setPostStep] = useState(1)
const [videoUrl, setVideoUrl] = useState('')
const [videoDetected, setVideoDetected] = useState('')
const [altLinks, setAltLinks] = useState({ fb: '', tt: '', ig: '' })
const [postForm, setPostForm] = useState({ ...defaultPostForm })
const [itinDays, setItinDays] = useState<ItineraryFormDay[]>(...)
const [publishing, setPublishing] = useState(false)
const [publishError, setPublishError] = useState('')
const [drafts, setDrafts] = useState<SavedDraft[]>(...)
const [postView, setPostView] = useState<'form' | 'drafts'>('form')
```

**Post Functions:**
- `nextStep()` - Validate & move to next step (lines 266-282)
- `publishVlog()` - Submit vlog to API (lines 316-347)
- `saveDraft()` - Save to localStorage (lines 349-363)
- `loadDraftById(id)` - Restore draft (lines 365-376)

**Post View:**
- `postView === 'form'` - Step-by-step form (lines 1056-1416)
- `postView === 'drafts'` - Draft list (lines 1017-1053)

---

### DASHBOARD PAGE
**Route:** `page === 'dashboard'`
**Entry:** Dashboard button
**Exit:** Post button → post, Vlog click → detail

```
dashboard
  ├─ → post (go('post'))
  └─ → detail (openD('dashboard', vlogId))
```

**Dashboard Content (lines 1424-1492):**
- KPI cards: Earnings, Credits, Views, Vlogs
- Monthly earnings chart
- My vlogs list (up to 4)

**Dashboard State:**
```typescript
const [myVlogs, setMyVlogs] = useState<VlogCard[]>([])

const fetchMyVlogs = useCallback(async () => {
  try {
    const r = await fetch('/api/vlogs?mine=true')
    const d = await r.json()
    if (Array.isArray(d)) setMyVlogs(d)
  } catch { }
}, [])
```

---

### NOTIFICATIONS PAGE
**Route:** `page === 'notif'`
**Entry:** Bell icon, Notifications button
**Exit:** Click notification (handled externally)

```
notif (read-only)
  └─ back to browse (auto)
```

**Notification State (lines 115-117):**
```typescript
const [nCnt, setNCnt] = useState(4)                    // Unread count
const [readN, setReadN] = useState<Set<string>>(new Set())  // Read notifications

const rdN = (id: string) => {
  if (readN.has(id)) return
  setReadN(s => new Set([...s, id]))
  setNCnt(n => Math.max(0, n - 1))
}
```

**Notifications List (lines 1506-1521):**
- Credit earned
- Review posted
- Users following
- Vlog trending

---

## State Persistence

### LocalStorage
```typescript
// Drafts
localStorage.getItem('tourista_drafts')      // JSON array of SavedDraft
localStorage.setItem('tourista_drafts', JSON.stringify(...))

// Pinned vlogs
localStorage.getItem('tourista_pinned')      // JSON array of vlog IDs
localStorage.setItem('tourista_pinned', JSON.stringify([...]))
```

### API Calls
```
GET  /api/vlogs              // Browse with filters
GET  /api/vlogs?mine=true    // My vlogs
GET  /api/vlogs/:id          // Detail view
GET  /api/profile            // User profile
POST /api/vlogs              // Publish vlog
POST /api/vlogs/:id/like     // Like vlog
POST /api/vlogs/:id/unlock   // Unlock itinerary
POST /api/vlogs/:id/reviews  // Post review
POST /api/profile            // Save profile
POST /api/upload             // Upload file
```

---

## Navigation Entry Points

| Button/Link | Current Page | Target Page | Function |
|-------------|-------------|------------|----------|
| Logo | Any | browse | `go('browse')` |
| Explore | Any | browse | `go('browse')` |
| Filters | browse | browse | `setFiltersOpen()` |
| Notifications | Any | notif | `go('notif')` |
| Dashboard | Any | dashboard | `go('dashboard')` |
| Post vlog | Any | post | `go('post')` + resetForms() |
| Profile | Any | profile | `go('profile')` |
| Edit profile | profile | edit | `go('edit')` |
| Back (detail) | detail | prev | `go(prev)` |
| Vlog card | browse | detail | `openD('browse', id)` |
| Vlog card | profile | detail | `openD('profile', id)` |
| Vlog card | dashboard | detail | `openD('dashboard', id)` |
| Author name | detail | profile | `go('profile')` |

---

## Mobile vs Desktop Navigation

### Mobile (< 900px)
- Top nav bar with logo, buttons (56px)
- Tab bar showing active page (37px)
- Side rail: Hidden
- Filter panel: Collapsible inline

### Desktop (>= 900px)
- Top nav bar (56px)
- Left side rail (58px fixed)
- Tab bar: Hidden
- Filter panel: Fixed left 286px (collapses 900-1160px)
- Main content: Right of rail

---

## Page Initialization

```typescript
// On mount (lines 161-163)
useEffect(() => { fetchVlogs() }, [fetchVlogs])
useEffect(() => { fetchMyVlogs() }, [fetchMyVlogs])
useEffect(() => { fetchProfile() }, [fetchProfile])

// Feed intersection observer (lines 164-184)
useEffect(() => {
  if (!vlogs.length) return
  setActiveFeedId(current => current ?? vlogs[0]?.id ?? null)
  
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
    
    if (visible?.target instanceof HTMLElement) {
      setActiveFeedId(visible.target.dataset.vlogId || null)
    }
  }, { threshold: [0.55, 0.75], rootMargin: '-12% 0px -18%' })
  
  vlogs.forEach(v => {
    const node = feedRefs.current[v.id]
    if (node) observer.observe(node)
  })
  
  return () => observer.disconnect()
}, [vlogs])
```

This tracks which feed video is visible on screen for video autoplay.

