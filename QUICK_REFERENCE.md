# Tourista Quick Reference Guide

## Module Quick Links

| Module | Purpose | Location | Key Files |
|--------|---------|----------|-----------|
| **Browse** | Vlog discovery & browsing | `src/modules/Browse.tsx` | Filtering, search, detail view |
| **PostVlog** | 3-step vlog creation | `src/modules/PostVlog.tsx` | Step 1-3, validation, publish |
| **Profile** | User profile management | `src/modules/Profile.tsx` | View, edit, social links |
| **Dashboard** | My vlogs management | `src/modules/Dashboard.tsx` | List, details, edit, delete |
| **Notifications** | Notification center | `src/modules/Notifications.tsx` | List, filter, mark read, delete |

---

## Custom Hooks

### usePostVlog()
```tsx
import { usePostVlog } from '@/hooks/usePostVlog'

const {
  postStep, postForm, itinDays, videoUrl,
  setPostForm, nextStep, prevStep, publishVlog
} = usePostVlog()
```

---

## Utility Functions

### Cost & Currency
```tsx
import { formatCost, parseCurrency } from '@/utils/vlogHelpers'

formatCost(2500, 'PHP')        // ₱2,500
parseCurrency('₱2,500')        // 2500
```

### Video Operations
```tsx
import { detectVideoSource, getEmbedUrl } from '@/utils/vlogHelpers'

detectVideoSource('youtube.com/watch?v=...')  // 'youtube'
getEmbedUrl('youtube.com/watch?v=...')        // 'youtube.com/embed/...'
```

### Credits & Earnings
```tsx
import { calculateCredits, calculateEarnings } from '@/utils/vlogHelpers'

calculateCredits(['₱2,500', '₱1,500'])  // 54
calculateEarnings(54, 50)                // ₱21,600
```

### Date & Time
```tsx
import { formatDate, formatTimeAgo } from '@/utils/vlogHelpers'

formatDate('2024-05-20')       // 'May 20, 2024'
formatTimeAgo('2024-05-20')    // '3 days ago'
```

### Text Operations
```tsx
import { truncate, getInitials } from '@/utils/vlogHelpers'

truncate('Long text here...', 20)  // 'Long text here...'
getInitials('John Doe')            // 'JD'
```

### Validation
```tsx
import { isValidEmail, isValidUrl } from '@/utils/vlogHelpers'

isValidEmail('user@example.com')   // true
isValidUrl('https://example.com')  // true
```

---

## API Endpoints Summary

### Browse Module
```
GET /api/vlogs?search=...&vibe=...&region=...&budget=...
GET /api/vlogs/[id]
POST /api/vlogs/[id]/like
GET /api/vlogs/[id]/reviews
POST /api/vlogs/[id]/reviews
POST /api/vlogs/[id]/unlock
```

### PostVlog Module
```
POST /api/vlogs
POST /api/upload
```

### Profile Module
```
GET /api/profile
POST /api/profile
```

### Dashboard Module
```
GET /api/vlogs?myVlogs=true
GET /api/vlogs/[id]
PATCH /api/vlogs/[id]
DELETE /api/vlogs/[id]
POST /api/vlogs/[id]/like
GET /api/vlogs/[id]/reviews
POST /api/vlogs/[id]/reviews
```

### Notifications Module
```
GET /api/notifications?type=...&unread=...
PATCH /api/notifications/[id]
DELETE /api/notifications/[id]
POST /api/notifications/mark-all-read
DELETE /api/notifications
```

---

## Common Patterns

### Fetch Data with Loading State
```tsx
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

const fetchData = useCallback(async () => {
  setLoading(true)
  setError('')
  try {
    const res = await fetch('/api/endpoint')
    if (!res.ok) throw new Error('Failed to fetch')
    const data = await res.json()
    setData(data)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}, [])
```

### Form Handling
```tsx
const [form, setForm] = useState({ field: '' })

const handleChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value })
}

const handleSubmit = async (e) => {
  e.preventDefault()
  const res = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form)
  })
}
```

### Conditional Rendering
```tsx
{loading ? (
  <div>Loading...</div>
) : error ? (
  <div style={{ color: 'red' }}>{error}</div>
) : data ? (
  <div>{/* render data */}</div>
) : (
  <div>No data</div>
)}
```

---

## File Organization

```
src/
├── modules/              # Feature modules
│   ├── Browse.tsx
│   ├── PostVlog.tsx
│   ├── Profile.tsx
│   ├── Dashboard.tsx
│   ├── Notifications.tsx
│   └── README.md
├── hooks/                # Custom hooks
│   └── usePostVlog.ts
├── utils/                # Utility functions
│   └── vlogHelpers.ts
├── components/           # Shared components
├── app/
│   ├── api/              # API routes
│   ├── layout.tsx
│   └── page.tsx
└── lib/
    └── prisma.ts
```

---

## Key Interfaces

### VlogCard
```ts
interface VlogCard {
  id: string
  title: string
  location: string
  cost?: number | null
  currency: string
  rating: number
  views: number
  likes: number
  credits: number
  thumbnailColor: string
  trending: boolean
  author: VlogAuthor
  description?: string | null
  youtubeUrl?: string | null
  facebookUrl?: string | null
  tiktokUrl?: string | null
  instagramUrl?: string | null
  duration?: number | null
  coverImage?: string | null
}
```

### VlogDetail
```ts
interface VlogDetail extends VlogCard {
  country: string
  region: string
  vibe: string
  ratingCount: number
  itinerary: ItineraryDay[]
  reviews: Review[]
}
```

### UserProfile
```ts
interface UserProfile {
  id: string
  handle: string
  name: string
  bio?: string | null
  tagline?: string | null
  initials: string
  avatarColor: string
  country?: string | null
  travelStyle?: string | null
  verified: boolean
  followers: number
  vlogCount: number
  avgRating: number
  totalViews: number
  credits: number
  earnings: number
  youtubeUrl?: string | null
  instagramUrl?: string | null
  tiktokUrl?: string | null
}
```

### Notification
```ts
interface Notification {
  id: string
  type: 'like' | 'review' | 'unlock' | 'follow' | 'earnings'
  title: string
  message: string
  relatedId?: string
  relatedType?: 'vlog' | 'user'
  read: boolean
  createdAt: string
  avatar?: string
  avatarColor?: string
}
```

---

## Common Tasks

### Add a New Module
1. Create `src/modules/NewModule.tsx`
2. Define interfaces at the top
3. Export default component
4. Add to main page integration

### Add a Utility Function
1. Add to `src/utils/vlogHelpers.ts`
2. Export function
3. Add JSDoc comments
4. Use in modules

### Add a Custom Hook
1. Create `src/hooks/useNewHook.ts`
2. Define return type
3. Export hook
4. Use in modules

### Fetch Data in Module
```tsx
const fetchData = useCallback(async () => {
  setLoading(true)
  try {
    const res = await fetch('/api/endpoint')
    const data = await res.json()
    setData(data)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}, [])

useEffect(() => {
  fetchData()
}, [fetchData])
```

---

## Debugging Tips

1. **Check Console** - Look for error messages
2. **Network Tab** - Verify API calls
3. **React DevTools** - Inspect component state
4. **Add Logs** - Use console.log() for debugging
5. **Check Types** - Verify TypeScript interfaces match data

---

## Performance Tips

1. **Use useCallback** - Memoize functions
2. **Use useMemo** - Memoize expensive calculations
3. **Lazy Load Modules** - Use React.lazy()
4. **Optimize Images** - Compress before upload
5. **Debounce Search** - Reduce API calls

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot read property of undefined" | Accessing data before it loads | Add null checks or loading state |
| "Failed to fetch" | API endpoint not found | Check endpoint URL and method |
| "Type error: X is not a function" | Function not imported | Check import statement |
| "State not updating" | Mutating state directly | Use setState or spread operator |
| "Infinite loop" | Missing dependency in useEffect | Add dependencies to dependency array |

---

## Resources

- **Modules README** - `src/modules/README.md`
- **Architecture Guide** - `MODULAR_ARCHITECTURE.md`
- **Project Instructions** - `CLAUDE.md`
- **API Documentation** - Check `src/app/api/` routes

---

## Last Updated
May 23, 2026
