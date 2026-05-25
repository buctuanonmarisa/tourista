# Tourista Modules

This directory contains modular components for the Tourista travel vlogging platform. Each module is self-contained and handles a specific feature area.

## Module Overview

### 1. **Browse.tsx** - Vlog Discovery & Browsing
Handles the main vlog browsing experience with filtering and discovery.

**Features:**
- Browse and discover vlogs
- Filter by vibe, region, and budget
- Search functionality
- View vlog details
- Like and review vlogs
- Unlock premium content
- Follow creators

**Key State:**
- `vlogs` - List of vlog cards
- `search` - Search query
- `vibe`, `region`, `budget` - Filter selections
- `activeFeedId` - Currently visible vlog in feed
- `feedRefs` - IntersectionObserver refs for feed tracking

**Key Methods:**
- `fetchVlogs()` - Fetch vlogs with filters
- `onViewDetail()` - Callback when viewing vlog details

---

### 2. **PostVlog.tsx** - 3-Step Vlog Creation
Complete vlog posting flow with validation and publishing.

**Features:**
- **Step 1: Video & Info**
  - Video URL input (YouTube, Facebook, TikTok, Instagram)
  - Vlog title and description
  - Cover photo upload
  - Country and cities selection
  - Travel vibe tagging

- **Step 2: Itinerary**
  - Day-by-day breakdown
  - Activity descriptions
  - Cost per day
  - Lock/unlock days for monetization
  - Optional: highlights, food tips, getting there info

- **Step 3: Credits & Publish**
  - Automatic credits calculation (₱75 per credit)
  - Income projection display
  - Confirmation checkbox
  - Publish button

**Key State:**
- `postStep` - Current step (1-3)
- `postForm` - Form data (title, description, etc.)
- `itinDays` - Itinerary days array
- `videoUrl` - Video URL input
- `publishing` - Publishing state
- `creditsReviewed` - Confirmation checkbox

**Key Methods:**
- `nextStep()` - Validate and move to next step
- `prevStep()` - Go back to previous step
- `publishVlog()` - Submit vlog to API
- `validateStep()` - Validate current step

---

### 3. **Profile.tsx** - User Profile Management
User profile display and editing.

**Features:**
- View profile information
- Edit profile details (name, handle, bio, tagline)
- Customize avatar color
- Manage social links (YouTube, Instagram, TikTok)
- Display stats (followers, vlogs, earnings, credits)
- Verification status

**Key State:**
- `profile` - User profile data
- `isEditing` - Edit mode toggle
- `editForm` - Form data during editing
- `loading` - API loading state
- `error` - Error messages
- `success` - Success messages

**Key Methods:**
- `fetchProfile()` - Load user profile
- `updateProfile()` - Save profile changes
- `startEditing()` - Enter edit mode
- `cancelEditing()` - Exit edit mode

---

### 4. **Dashboard.tsx** - My Vlogs Management
Dashboard for managing user's own vlogs.

**Features:**
- List all user's vlogs
- View vlog details and analytics
- Edit vlog information
- Delete vlogs
- Like/unlike vlogs
- Submit and view reviews
- Track views, likes, and unlocks

**Key State:**
- `myVlogs` - User's vlog list
- `selectedVlogId` - Currently selected vlog
- `vlog` - Full vlog details
- `mode` - View mode (list/details/edit)
- `likeCount` - Like count for current vlog
- `liked` - Like status
- `reviewText` - Review input
- `reviewRating` - Review rating

**Key Methods:**
- `fetchMyVlogs()` - Load user's vlogs
- `fetchVlogDetails()` - Load full vlog details
- `deleteVlog()` - Delete a vlog
- `toggleLike()` - Like/unlike vlog
- `submitReview()` - Submit a review

---

### 5. **Notifications.tsx** - Notification Center
Centralized notification management.

**Features:**
- View all notifications
- Filter by type (likes, reviews, unlocks, follows, earnings)
- Mark as read/unread
- Delete notifications
- Clear all notifications
- Real-time notification updates
- Unread count badge

**Notification Types:**
- `like` - Someone liked your vlog
- `review` - Someone reviewed your vlog
- `unlock` - Someone unlocked your content
- `follow` - Someone followed you
- `earnings` - Earnings notification

**Key State:**
- `notifications` - Notification list
- `filter` - Active filter
- `loading` - API loading state
- `error` - Error messages

**Key Methods:**
- `fetchNotifications()` - Load notifications
- `markAsRead()` - Mark single notification as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification()` - Delete single notification
- `deleteAllNotifications()` - Clear all notifications

---

### 6. **TourMe.tsx** - Interactive World Tour
Map-first discovery modal for destination hopping.

**Features:**
- Animated world-tour intro with live destination pins
- Ranks destinations from live vlog views, likes, and trending state
- Switches into a real map-tile view for the selected destination
- Shows roaming avatar, next/previous destination controls, and itinerary clips
- Fetches the selected vlog detail from `/api/vlogs/[id]`

**Key State:**
- `stage` - World intro or selected place view
- `vlogId` - Selected destination vlog
- `detail` - Loaded vlog detail with itinerary days
- `clipId` - Selected itinerary day/clip

**Key Methods:**
- `loadDetail()` - Fetch selected vlog itinerary
- `selectDestination()` - Switch map and clips to a destination
- `moveDestination()` - Navigate previous/next destination

---

## Integration with Main Page

To integrate these modules into your main page (`src/app/page.tsx`), use them like this:

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
      {currentPage === 'browse' && <Browse onViewDetail={() => {}} onGoToProfile={() => setCurrentPage('profile')} />}
      {currentPage === 'post' && <PostVlog onPublishSuccess={() => setCurrentPage('dashboard')} />}
      {currentPage === 'profile' && <Profile onEditStart={() => {}} onEditEnd={() => {}} />}
      {currentPage === 'dashboard' && <Dashboard onViewDetail={() => {}} />}
      {currentPage === 'notifications' && <Notifications onNotificationClick={() => {}} />}
    </div>
  )
}
```

---

## Custom Hooks

### `usePostVlog()`
Manages all state and logic for the post vlog flow.

**Location:** `src/hooks/usePostVlog.ts`

**Returns:**
```ts
{
  // State
  postStep, postForm, itinDays, videoUrl, videoDetected,
  altLinks, showAltLinks, publishing, publishError, creditsReviewed,

  // Setters
  setPostStep, setPostForm, setItinDays, setVideoUrl, setVideoDetected,
  setAltLinks, setShowAltLinks, setCreditsReviewed,

  // Methods
  nextStep, prevStep, publishVlog, resetForm, validateStep
}
```

**Usage:**
```tsx
const { postStep, postForm, setPostForm, nextStep, publishVlog } = usePostVlog()
```

---

## Utility Functions

### `src/utils/vlogHelpers.ts`

Common helper functions for vlog operations:

- `formatCost(cost, currency)` - Format cost with currency symbol
- `detectVideoSource(url)` - Detect video platform from URL
- `getEmbedUrl(url)` - Get embed URL for video platforms
- `calculateCredits(costs)` - Calculate credits from costs
- `calculateEarnings(credits, unlocks)` - Calculate estimated earnings
- `formatDate(date)` - Format date to readable string
- `formatTimeAgo(date)` - Format time relative to now
- `truncate(text, length)` - Truncate text with ellipsis
- `isValidEmail(email)` - Validate email format
- `isValidUrl(url)` - Validate URL format
- `parseCurrency(value)` - Parse currency from string
- `formatNumber(num)` - Format number with commas
- `getInitials(name)` - Get initials from name
- `getRandomColor()` - Generate random color
- `debounce(func, wait)` - Debounce function
- `throttle(func, limit)` - Throttle function

**Usage:**
```tsx
import { formatCost, calculateCredits, formatTimeAgo } from '@/utils/vlogHelpers'

const cost = formatCost(2500, 'PHP') // ₱2,500
const credits = calculateCredits(['₱2,500', '₱1,500']) // 54
const time = formatTimeAgo('2024-05-20') // "3 days ago"
```

---

## File Structure

```
src/
├── modules/
│   ├── Browse.tsx           # Vlog discovery & browsing
│   ├── PostVlog.tsx         # 3-step vlog creation
│   ├── Profile.tsx          # User profile management
│   ├── Dashboard.tsx        # My vlogs management
│   ├── Notifications.tsx    # Notification center
│   └── README.md            # This file
├── hooks/
│   └── usePostVlog.ts       # Custom hook for post vlog state
└── utils/
    └── vlogHelpers.ts       # Common utility functions
```

---

## Best Practices

1. **Keep modules focused** - Each module handles one feature area
2. **Use custom hooks** - Extract complex state logic into hooks
3. **Use utility functions** - Avoid duplicating common operations
4. **Pass callbacks** - Use props for cross-module communication
5. **Handle errors gracefully** - Show user-friendly error messages
6. **Validate input** - Validate data before API calls
7. **Show loading states** - Provide feedback during async operations
8. **Use TypeScript** - Define interfaces for all data structures

---

## API Integration

Each module integrates with the following API endpoints:

### Browse Module
- `GET /api/vlogs` - List vlogs with filters
- `GET /api/vlogs/[id]` - Get vlog details
- `POST /api/vlogs/[id]/like` - Like/unlike vlog
- `GET/POST /api/vlogs/[id]/reviews` - Get/create reviews
- `POST /api/vlogs/[id]/unlock` - Unlock premium content

### PostVlog Module
- `POST /api/vlogs` - Create new vlog
- `POST /api/upload` - Upload media files

### Profile Module
- `GET/POST /api/profile` - Get/update user profile

### Dashboard Module
- `GET /api/vlogs?myVlogs=true` - Get user's vlogs
- `GET /api/vlogs/[id]` - Get vlog details
- `PATCH /api/vlogs/[id]` - Update vlog
- `DELETE /api/vlogs/[id]` - Delete vlog
- `POST /api/vlogs/[id]/like` - Like/unlike vlog
- `GET/POST /api/vlogs/[id]/reviews` - Get/create reviews

### Notifications Module
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/[id]` - Mark as read
- `DELETE /api/notifications/[id]` - Delete notification
- `POST /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications` - Delete all notifications

---

## Future Enhancements

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

## Last Updated
May 23, 2026
