# Publish Flow - Code Reference Guide

## EXACT CODE SECTIONS

### 1. publishVlog() Function
**File:** src/app/page.tsx  
**Lines:** 447-480

Detailed code provided in PUBLISH_FLOW_ANALYSIS.md

---

### 2. nextStep() Function
**File:** src/app/page.tsx  
**Lines:** 357-371

Detailed code provided in PUBLISH_FLOW_ANALYSIS.md

---

### 3. calculateCreditsFromCost() Function
**File:** src/app/page.tsx  
**Lines:** 593-604

Detailed code provided in PUBLISH_FLOW_ANALYSIS.md

---

### 4. Error Display & Publish Button
**File:** src/app/page.tsx  
**Lines:** 1884-1900

Detailed code provided in PUBLISH_FLOW_ANALYSIS.md

---

### 5. Ready to Publish Section
**File:** src/app/page.tsx  
**Lines:** 1844-1882

Detailed code provided in PUBLISH_FLOW_ANALYSIS.md

---

### 6. API Endpoint - POST /api/vlogs
**File:** src/app/api/vlogs/route.ts  
**Lines:** 46-116

Detailed code provided in PUBLISH_FLOW_ANALYSIS.md

---

### 7. State Declarations
**File:** src/app/page.tsx  
**Lines:** 176-177

const [publishing, setPublishing] = useState(false)
const [publishError, setPublishError] = useState('')

---

## Flow Diagrams

### User Click to Publish Flow

User clicks "Publish" (Step 3)
    |
    v
nextStep() called
    |
    +-> postStep === 3? YES
    |
    v
publishVlog() called
    |
    v
setPublishing(true) - Disable button
    |
    v
Video platform detection
    |
    v
Filter filled itinerary days
    |
    v
Calculate credits from costs
    |
    v
POST /api/vlogs with all data
    |
    +--> Response OK?
         |
         +-> YES: Reset form, fetch vlogs, redirect to dashboard
         |
         +-> NO: Display error message, stay on page
    |
    v
setPublishing(false) - Enable button

---

### Validation Gates

Step 1 (Video & Title)
    +-- Video URL empty?    -> ERROR
    +-- Title empty?        -> ERROR
    +-- Both filled?        -> GO TO STEP 2

Step 2 (Itinerary)
    +-- No days filled?     -> ERROR
    +-- At least one day?   -> GO TO STEP 3

Step 3 (Confirmation)
    +-- Display summary     -> GO TO publishVlog()
    +-- NO VALIDATION!      -> DIRECT PUBLISH

---

## Key Data Points Sent to API

When publishVlog() makes the POST request, it sends:

{
  "title": "string",
  "description": "string",
  "country": "string",
  "cities": "string",
  "vibe": "string",
  "credits": "number (calculated)",
  "coverImage": "string",
  "youtubeUrl": "string or null",
  "facebookUrl": "string or null",
  "tiktokUrl": "string or null",
  "instagramUrl": "string or null",
  "itinerary": [
    {
      "day": "number",
      "activity": "string",
      "cost": "string",
      "locked": "boolean",
      "highlights": "string or null",
      "foodTips": "string or null",
      "gettingThere": "string or null",
      "tips": "string or null"
    }
  ]
}

---

## Validation Checklist for Enhancement

### Client-Side (Next.js Frontend)
- Check video URL is valid format/exists
- Check title has minimum length
- Check at least one itinerary day exists
- Check costs are numeric and reasonable
- Check user is authenticated before Step 3
- Add pre-flight validation at Step 3

### Server-Side (API Endpoint)
- Validate authentication token/session
- Validate all required fields present
- Validate costs are numeric
- Validate video URLs are real
- Check for duplicate vlogs by same user
- Implement rate limiting
- Use actual user ID, not default fallback
- Add error logging for monitoring

---

## Quick Reference: What Gets Validated

AT STEP 1:
✓ Video URL is non-empty
✓ Vlog title is non-empty

AT STEP 2:
✓ At least one itinerary day has content

AT STEP 3:
✗ NOTHING - directly calls publishVlog()

AT API ENDPOINT:
✗ NOTHING - accepts any data
✗ Creates default user if none exists

