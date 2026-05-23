# Tourista Modular Architecture

## Overview

The Tourista codebase has been refactored into a modular architecture to improve code organization, maintainability, and understanding. Each feature area is now isolated into its own module with clear responsibilities and interfaces.

---

## Directory Structure

```
tourista/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main page (integrates modules)
│   ├── components/           # Shared components
│   ├── modules/              # Feature modules
│   │   ├── Browse.tsx        # Vlog discovery & browsing
│   │   ├── PostVlog.tsx      # 3-step vlog creation
│   │   ├── Profile.tsx       # User profile management
│   │   ├── Dashboard.tsx     # My vlogs management
│   │   ├── Notifications.tsx # Notification center
│   │   └── README.md         # Module documentation
│   ├── hooks/                # Custom React hooks
│   │   └── usePostVlog.ts    # Post vlog state management
│   ├── utils/                # Utility functions
│   │   └── vlogHelpers.ts    # Common vlog operations
│   └── lib/
│       └── prisma.ts         # Prisma client
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding
├── public/                   # Static assets
├── CLAUDE.md                 # Project instructions
├── MODULAR_ARCHITECTURE.md   # This file
└── package.json              # Dependencies
```

---

## Module Descriptions

### 1. Browse Module (`src/modules/Browse.tsx`)

**Purpose:** Handle vlog discovery, browsing, and filtering

**Responsibilities:**
- Display list of vlogs
- Filter by vibe, region, budget
- Search functionality
- Track active vlog in feed
- Handle vlog detail viewing

**Key Components:**
- Vlog card grid
- Filter panel (vibe, region, budget)
- Search bar
- Vlog detail panel

**State Management:**
- `vlogs` - Array of vlog cards
- `search` - Search query
- `vibe`, `region`, `budget` - Filter selections
- `activeFeedId` - Currently visible vlog
- `feedRefs` - IntersectionObserver refs

**API Endpoints Used:**
- `GET /api/vlogs` - Fetch vlogs with filters
- `GET /api/vlogs/[id]` - Get vlog details
- `POST /api/vlogs/[id]/like` - Like/unlike
- `GET/POST /api/vlogs/[id]/reviews` - Reviews
- `POST /api/vlogs/[id]/unlock` - Unlock content

---

### 2. PostVlog Module (`src/modules/PostVlog.tsx`)

**Purpose:** Handle the complete 3-step vlog creation flow

**Responsibilities:**
- Collect video information (URL, title, description)
- Build day-by-day itinerary
- Calculate credits and show earnings projection
- Validate each step
- Publish vlog to API

**Key Components:**
- Step 1: Video & Info form
- Step 2: Itinerary builder
- Step 3: Credits & Publish confirmation
- Step indicator
- Navigation buttons

**State Management:**
- `postStep` - Current step (1-3)
- `postForm` - Form data
- `itinDays` - Itinerary days
- `videoUrl` - Video URL
- `publishing` - Publishing state
- `creditsReviewed` - Confirmation flag

**Validation Rules:**
- Step 1: Video URL and title required
- Step 2: At least one day with content
- Step 3: Credits reviewed + at least one unlocked day

**API Endpoints Used:**
- `POST /api/vlogs` - Create vlog
- `POST /api/upload` - Upload media

---

### 3. Profile Module (`src/modules/Profile.tsx`)

**Purpose:** Display and manage user profile

**Responsibilities:**
- Display profile information
- Edit profile details
- Manage social links
- Customize avatar
- Show user statistics

**Key Components:**
- Profile header (avatar, name, stats)
- Profile info display
- Edit form
- Social links section

**State Management:**
- `profile` - User profile data
- `isEditing` - Edit mode toggle
- `editForm` - Form data during editing
- `loading` - API loading state
- `error`, `success` - Messages

**API Endpoints Used:**
- `GET /api/profile` - Fetch profile
- `POST /api/profile` - Update profile

---

### 4. Dashboard Module (`src/modules/Dashboard.tsx`)

**Purpose:** Manage user's own vlogs

**Responsibilities:**
- List user's vlogs
- View vlog details and analytics
- Edit vlog information
- Delete vlogs
- Manage reviews and likes
- Track performance metrics

**Key Components:**
- Vlog grid
- Vlog detail panel
- Edit form
- Review section
- Delete confirmation

**State Management:**
- `myVlogs` - User's vlog list
- `selectedVlogId` - Currently selected vlog
- `vlog` - Full vlog details
- `mode` - View mode (list/details/edit)
- `likeCount`, `liked` - Like state
- `reviewText`, `reviewRating` - Review input

**API Endpoints Used:**
- `GET /api/vlogs?myVlogs=true` - Fetch user's vlogs
- `GET /api/vlogs/[id]` - Get vlog details
- `PATCH /api/vlogs/[id]` - Update vlog
- `DELETE /api/vlogs/[id]` - Delete vlog
- `POST /api/vlogs/[id]/like` - Like/unlike
- `GET/POST /api/vlogs/[id]/reviews` - Reviews

---

### 5. Notifications Module (`src/modules/Notifications.tsx`)

**Purpose:** Centralized notification management

**Responsibilities:**
- Display notifications
- Filter by type
- Mark as read/unread
- Delete notifications
- Show unread count

**Key Components:**
- Notification list
- Filter tabs
- Notification item
- Clear all button

**Notification Types:**
- `like` - Someone liked your vlog
- `review` - Someone reviewed your vlog
- `unlock` - Someone unlocked your content
- `follow` - Someone followed you
- `earnings` - Earnings notification

**State Management:**
- `notifications` - Notification list
- `filter` - Active filter
- `loading` - API loading state
- `error` - Error messages

**API Endpoints Used:**
- `GET /api/notifications` - Fetch notifications
- `PATCH /api/notifications/[id]` - Mark as read
- `DELETE /api/notifications/[id]` - Delete notification
- `POST /api/notifications/mark-all-read` - Mark all read
- `DELETE /api/notifications` - Delete all

---

## Custom Hooks

### usePostVlog (`src/hooks/usePostVlog.ts`)

Encapsulates all state and logic for the post vlog flow.

**Returns:**
```ts
{
  // State
  postStep: number
  postForm: PostFormData
  itinDays: ItineraryFormDay[]
  videoUrl: string
  videoDetected: string
  altLinks: { fb: string; tt: string; ig: string }
  showAltLinks: boolean
  publishing: boolean
  publishError: string
  creditsReviewed: boolean

  // Setters
  setPostStep: (step: number) => void
  setPostForm: (form: PostFormData) => void
  setItinDays: (days: ItineraryFormDay[]) => void
  setVideoUrl: (url: string) => void
  setVideoDetected: (detected: string) => void
  setAltLinks: (links: any) => void
  setShowAltLinks: (show: boolean) => void
  setCreditsReviewed: (reviewed: boolean) => void

  // Methods
  nextStep: () => void
  prevStep: () => void
  publishVlog: () => Promise<boolean>
  resetForm: () => void
  validateStep: (step: number) => boolean
}
```

**Usage:**
```tsx
const { postStep, postForm, nextStep, publishVlog } = usePostVlog()
```

---

## Utility Functions

### vlogHelpers (`src/utils/vlogHelpers.ts`)

Common functions for vlog operations:

**Cost & Currency:**
- `formatCost(cost, currency)` - Format with currency symbol
- `parseCurrency(value)` - Parse currency from string
- `formatNumber(num)` - Format with commas

**Video Operations:**
- `detectVideoSource(url)` - Detect platform (YouTube, Facebook, etc.)
- `getEmbedUrl(url)` - Get embed URL for iframe

**Credits & Earnings:**
- `calculateCredits(costs)` - Calculate credits from costs
- `calculateEarnings(credits, unlocks)` - Estimate earnings

**Date & Time:**
- `formatDate(date)` - Format to readable date
- `formatTimeAgo(date)` - Format relative time (e.g., "2 hours ago")

**Text Operations:**
- `truncate(text, length)` - Truncate with ellipsis
- `getInitials(name)` - Get initials from name

**Validation:**
- `isValidEmail(email)` - Validate email format
- `isValidUrl(url)` - Validate URL format

**Utilities:**
- `getRandomColor()` - Generate random color
- `debounce(func, wait)` - Debounce function
- `throttle(func, limit)` - Throttle function

---

## Integration Pattern

To use modules in the main page:

```tsx
import Browse from '@/modules/Browse'
import PostVlog from '@/modules/PostVlog'
import Profile from '@/modules/Profile'
import Dashboard from '@/modules/Dashboard'
import Notifications from '@/modules/Notifications'

export default function Home() {
  const [currentPage, setCurrentPage] = useState('browse')

  return (
    <div>
      {currentPage === 'browse' && (
        <Browse 
          onViewDetail={() => {}} 
          onGoToProfile={() => setCurrentPage('profile')} 
        />
      )}
      {currentPage === 'post' && (
        <PostVlog 
          onPublishSuccess={() => setCurrentPage('dashboard')} 
        />
      )}
      {currentPage === 'profile' && (
        <Profile 
          onEditStart={() => {}} 
          onEditEnd={() => {}} 
        />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard 
          onViewDetail={() => {}} 
        />
      )}
      {currentPage === 'notifications' && (
        <Notifications 
          onNotificationClick={() => {}} 
        />
      )}
    </div>
  )
}
```

---

## Benefits of Modular Architecture

1. **Separation of Concerns** - Each module handles one feature area
2. **Reusability** - Modules can be used independently
3. **Testability** - Easier to unit test isolated modules
4. **Maintainability** - Changes to one module don't affect others
5. **Scalability** - Easy to add new modules
6. **Code Organization** - Clear file structure and responsibilities
7. **Team Collaboration** - Multiple developers can work on different modules
8. **Performance** - Can lazy-load modules as needed

---

## Data Flow

```
User Interaction
    ↓
Module Component
    ↓
Custom Hook (if applicable)
    ↓
Utility Functions (if applicable)
    ↓
API Call
    ↓
Backend Processing
    ↓
Database Update
    ↓
Response to Module
    ↓
State Update
    ↓
UI Re-render
```

---

## Module Communication

Modules communicate through:

1. **Props** - Pass data and callbacks to child components
2. **Callbacks** - Handle events from child modules
3. **Shared State** - Use context or parent component state
4. **API** - Fetch/update data from backend

Example:
```tsx
// Parent component
<Browse 
  onViewDetail={(vlogId) => {
    setCurrentPage('details')
    setSelectedVlogId(vlogId)
  }}
/>

// Browse module
<VlogCard 
  onClick={() => onViewDetail(vlog.id)}
/>
```

---

## Future Enhancements

- [ ] Add Context API for global state management
- [ ] Implement Redux for complex state
- [ ] Add real-time notifications with WebSockets
- [ ] Implement draft auto-save
- [ ] Add media upload progress tracking
- [ ] Implement vlog analytics dashboard
- [ ] Add follower/following management
- [ ] Implement messaging system
- [ ] Add vlog scheduling
- [ ] Implement advanced search filters
- [ ] Add vlog recommendations
- [ ] Implement user verification system

---

## Testing Strategy

Each module should have:

1. **Unit Tests** - Test individual functions
2. **Component Tests** - Test component rendering and interactions
3. **Integration Tests** - Test module interactions
4. **E2E Tests** - Test complete user flows

Example test structure:
```
src/modules/__tests__/
├── Browse.test.tsx
├── PostVlog.test.tsx
├── Profile.test.tsx
├── Dashboard.test.tsx
└── Notifications.test.tsx

src/hooks/__tests__/
└── usePostVlog.test.ts

src/utils/__tests__/
└── vlogHelpers.test.ts
```

---

## Performance Considerations

1. **Code Splitting** - Lazy load modules with React.lazy()
2. **Memoization** - Use React.memo() for expensive components
3. **Hooks Optimization** - Use useCallback() and useMemo()
4. **API Caching** - Cache API responses when appropriate
5. **Image Optimization** - Optimize images before upload
6. **Bundle Size** - Monitor and optimize bundle size

---

## Documentation

Each module includes:
- JSDoc comments for functions
- TypeScript interfaces for data structures
- README.md with usage examples
- Clear variable and function names

---

## Last Updated
May 23, 2026

## Created By
Claude Code Assistant

## Status
✅ Complete - All 5 modules created with custom hooks and utilities
