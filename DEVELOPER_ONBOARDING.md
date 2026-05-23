# Tourista Developer Onboarding Guide

Welcome to the Tourista project! This guide will help you understand the codebase and get started with development.

---

## 🚀 Quick Start (5 minutes)

### 1. Understand the Project
Tourista is a travel vlogging platform where creators can:
- Share travel experiences through vlogs
- Monetize content via a credit system
- Build communities with followers
- Earn passive income from unlocks

### 2. Understand the Architecture
The codebase is organized into **5 feature modules**:
- **Browse** - Discover vlogs
- **PostVlog** - Create vlogs (3-step flow)
- **Profile** - Manage user profile
- **Dashboard** - Manage my vlogs
- **Notifications** - View notifications

### 3. Key Files to Know
```
src/modules/          # Feature modules
src/hooks/            # Custom React hooks
src/utils/            # Utility functions
src/app/api/          # API endpoints
MODULAR_ARCHITECTURE.md  # Architecture guide
QUICK_REFERENCE.md    # Quick lookup
```

---

## 📚 Learning Path (30 minutes)

### Step 1: Read the Architecture (10 min)
1. Open `MODULAR_ARCHITECTURE.md`
2. Understand the 5 modules
3. Review the file structure
4. Check the integration pattern

### Step 2: Explore a Module (10 min)
1. Pick one module (e.g., `Browse.tsx`)
2. Read the module code
3. Understand the state management
4. Check the API endpoints used

### Step 3: Review Utilities (10 min)
1. Open `src/utils/vlogHelpers.ts`
2. Review available functions
3. Check `QUICK_REFERENCE.md` for examples
4. Understand how to use utilities

---

## 🏗️ Module Deep Dive

### Browse Module
**What it does:** Users discover and browse vlogs

**Key concepts:**
- Filtering (vibe, region, budget)
- Search functionality
- IntersectionObserver for feed tracking
- Vlog detail viewing

**When to modify:**
- Adding new filters
- Changing search behavior
- Modifying vlog card display
- Adding new interactions

**Related files:**
- `src/modules/Browse.tsx`
- API: `GET /api/vlogs`

---

### PostVlog Module
**What it does:** Users create vlogs in 3 steps

**Key concepts:**
- Step 1: Video & Info
- Step 2: Itinerary (day-by-day)
- Step 3: Credits & Publish
- Validation at each step
- Credits calculation (₱75 per credit)

**When to modify:**
- Adding new fields
- Changing validation rules
- Modifying credits calculation
- Adding new step

**Related files:**
- `src/modules/PostVlog.tsx`
- `src/hooks/usePostVlog.ts`
- API: `POST /api/vlogs`

---

### Profile Module
**What it does:** Users manage their profile

**Key concepts:**
- View profile information
- Edit profile details
- Customize avatar
- Manage social links
- Display statistics

**When to modify:**
- Adding new profile fields
- Changing avatar options
- Adding new statistics
- Modifying edit form

**Related files:**
- `src/modules/Profile.tsx`
- API: `GET/POST /api/profile`

---

### Dashboard Module
**What it does:** Users manage their vlogs

**Key concepts:**
- List user's vlogs
- View vlog details
- Edit vlog information
- Delete vlogs
- Like/review vlogs
- Track analytics

**When to modify:**
- Adding new analytics
- Changing vlog list display
- Adding new actions
- Modifying detail view

**Related files:**
- `src/modules/Dashboard.tsx`
- API: `GET/PATCH/DELETE /api/vlogs`

---

### Notifications Module
**What it does:** Users view notifications

**Key concepts:**
- 5 notification types
- Filter by type
- Mark as read/unread
- Delete notifications
- Unread count badge

**When to modify:**
- Adding new notification types
- Changing filter options
- Modifying notification display
- Adding new actions

**Related files:**
- `src/modules/Notifications.tsx`
- API: `GET/PATCH/DELETE /api/notifications`

---

## 🛠️ Common Development Tasks

### Task 1: Add a New Field to PostVlog

**Step 1:** Update the interface
```tsx
interface PostFormData {
  title: string
  description: string
  // Add new field here
  newField: string
}
```

**Step 2:** Update default form
```tsx
const defaultPostForm: PostFormData = {
  title: '',
  description: '',
  newField: '',
}
```

**Step 3:** Add form input
```tsx
<input
  type="text"
  value={postForm.newField}
  onChange={(e) => setPostForm({ ...postForm, newField: e.target.value })}
/>
```

**Step 4:** Include in API call
```tsx
body: JSON.stringify({
  ...postForm,
  newField: postForm.newField,
})
```

### Task 2: Add a New Utility Function

**Step 1:** Add to `src/utils/vlogHelpers.ts`
```tsx
export function myNewFunction(param: string): string {
  // Implementation
  return result
}
```

**Step 2:** Add JSDoc comments
```tsx
/**
 * Description of what the function does
 * @param param - Description of parameter
 * @returns Description of return value
 */
export function myNewFunction(param: string): string {
  // Implementation
  return result
}
```

**Step 3:** Use in module
```tsx
import { myNewFunction } from '@/utils/vlogHelpers'

const result = myNewFunction('input')
```

### Task 3: Add a New API Endpoint

**Step 1:** Create API route
```tsx
// src/app/api/newroute/route.ts
export async function GET(req: Request) {
  try {
    // Implementation
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: 'Error message' }, { status: 500 })
  }
}
```

**Step 2:** Use in module
```tsx
const res = await fetch('/api/newroute')
const data = await res.json()
```

### Task 4: Add Error Handling

**Pattern 1:** Try-catch
```tsx
try {
  const res = await fetch('/api/endpoint')
  const data = await res.json()
  setData(data)
} catch (err) {
  setError(err.message)
}
```

**Pattern 2:** Response check
```tsx
const res = await fetch('/api/endpoint')
if (!res.ok) {
  const error = await res.json()
  setError(error.message)
  return
}
const data = await res.json()
```

---

## 🧪 Testing Your Changes

### Manual Testing Checklist
- [ ] Feature works as expected
- [ ] Error messages are clear
- [ ] Loading states show
- [ ] Mobile responsive
- [ ] No console errors
- [ ] API calls succeed
- [ ] Data persists correctly

### Testing a Module
```tsx
// 1. Start dev server
npm run dev

// 2. Navigate to feature
// 3. Test all interactions
// 4. Check console for errors
// 5. Check Network tab for API calls
```

---

## 🐛 Debugging Tips

### 1. Check Console
```
Open DevTools → Console tab
Look for error messages
```

### 2. Check Network
```
Open DevTools → Network tab
Check API calls
Verify response data
```

### 3. Check React DevTools
```
Install React DevTools extension
Inspect component state
Check props
```

### 4. Add Logs
```tsx
console.log('Debug info:', variable)
console.error('Error:', error)
console.table(data)
```

### 5. Use Debugger
```tsx
debugger  // Pauses execution
// Step through code
```

---

## 📖 Code Style Guide

### Naming Conventions
```tsx
// Variables: camelCase
const userName = 'John'

// Functions: camelCase
function getUserData() {}

// Components: PascalCase
function UserProfile() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3

// Interfaces: PascalCase
interface UserProfile {}
```

### File Organization
```tsx
// 1. Imports
import { useState } from 'react'

// 2. Types/Interfaces
interface MyInterface {}

// 3. Constants
const MY_CONSTANT = 'value'

// 4. Component
export default function MyComponent() {
  // State
  const [state, setState] = useState()
  
  // Effects
  useEffect(() => {}, [])
  
  // Handlers
  const handleClick = () => {}
  
  // Render
  return <div></div>
}
```

### Comments
```tsx
// Use comments for WHY, not WHAT
// ✅ Good
// Debounce search to reduce API calls
const debouncedSearch = debounce(search, 300)

// ❌ Bad
// Set search state
setSearch(value)
```

---

## 🚨 Common Mistakes to Avoid

### 1. Mutating State Directly
```tsx
// ❌ Wrong
state.field = 'new value'

// ✅ Correct
setState({ ...state, field: 'new value' })
```

### 2. Missing Dependencies in useEffect
```tsx
// ❌ Wrong
useEffect(() => {
  fetchData()
}, []) // Missing fetchData dependency

// ✅ Correct
useEffect(() => {
  fetchData()
}, [fetchData])
```

### 3. Not Handling Errors
```tsx
// ❌ Wrong
const data = await fetch('/api/endpoint').then(r => r.json())

// ✅ Correct
try {
  const res = await fetch('/api/endpoint')
  if (!res.ok) throw new Error('Failed')
  const data = await res.json()
} catch (err) {
  setError(err.message)
}
```

### 4. Forgetting to Reset State
```tsx
// ❌ Wrong
const publishVlog = async () => {
  // Publish...
  // Forgot to reset form
}

// ✅ Correct
const publishVlog = async () => {
  // Publish...
  resetForm()
}
```

---

## 📋 Checklist Before Submitting Code

- [ ] Code follows naming conventions
- [ ] No console errors or warnings
- [ ] Error handling implemented
- [ ] Loading states shown
- [ ] Mobile responsive
- [ ] TypeScript types defined
- [ ] Comments added for complex logic
- [ ] No unused imports
- [ ] No hardcoded values
- [ ] API calls tested
- [ ] Documentation updated

---

## 🔗 Useful Resources

### Documentation
- `MODULAR_ARCHITECTURE.md` - Architecture overview
- `QUICK_REFERENCE.md` - Quick lookup
- `src/modules/README.md` - Module details
- `CLAUDE.md` - Project instructions

### External Resources
- [React Docs](https://react.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 💬 Getting Help

### Questions About...
- **Architecture** → Read `MODULAR_ARCHITECTURE.md`
- **Specific Module** → Read module code + `src/modules/README.md`
- **Utilities** → Check `QUICK_REFERENCE.md`
- **API** → Check `src/app/api/` routes
- **Project** → Read `CLAUDE.md`

### Debugging Help
1. Check console for errors
2. Check Network tab for API issues
3. Add console.log statements
4. Use React DevTools
5. Review similar code in other modules

---

## 🎯 Your First Task

### Recommended First Task: Add a New Filter to Browse

**Difficulty:** Easy | **Time:** 30 minutes

**Steps:**
1. Open `src/modules/Browse.tsx`
2. Add new filter state (e.g., `const [newFilter, setNewFilter] = useState('')`)
3. Add filter UI (button or dropdown)
4. Update `fetchVlogs()` to include new filter
5. Test the filter works
6. Update `src/modules/README.md` with new filter

**Resources:**
- Look at existing filters (vibe, region, budget)
- Check `QUICK_REFERENCE.md` for patterns
- Review API endpoint in `src/app/api/vlogs/route.ts`

---

## 📞 Contact & Support

For questions or issues:
1. Check documentation first
2. Review similar code in other modules
3. Check console for error messages
4. Ask in team chat/email

---

## 🎓 Learning Resources

### Recommended Reading Order
1. This file (5 min)
2. `MODULAR_ARCHITECTURE.md` (10 min)
3. `QUICK_REFERENCE.md` (5 min)
4. One module code (10 min)
5. `src/modules/README.md` (10 min)

**Total: ~40 minutes to understand the codebase**

---

## ✅ Onboarding Checklist

- [ ] Read this file
- [ ] Read `MODULAR_ARCHITECTURE.md`
- [ ] Read `QUICK_REFERENCE.md`
- [ ] Explore one module
- [ ] Run `npm run dev`
- [ ] Test a feature
- [ ] Review `src/utils/vlogHelpers.ts`
- [ ] Understand API structure
- [ ] Complete first task
- [ ] Ask questions if needed

---

## 🎉 Welcome to the Team!

You're now ready to contribute to Tourista. The modular architecture makes it easy to:
- Understand the codebase
- Add new features
- Fix bugs
- Collaborate with others

Happy coding! 🚀

---

## 📅 Last Updated
May 23, 2026

## 👨‍💻 Created By
Claude Code Assistant
