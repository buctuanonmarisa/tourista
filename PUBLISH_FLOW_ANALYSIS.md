# Publish Flow & Validation Analysis

## Overview
This document contains a detailed analysis of the vlog publishing flow in the Tourista application, including validation logic, credits calculation, and error handling.

---

## 1. PUBLISHVLOG() FUNCTION
**Location:** `src/app/page.tsx` lines 447-480

### Current Implementation
The publishVlog function performs these steps:
1. Sets publishing state to true and clears any previous errors
2. Detects which video platform is being used (YouTube, Facebook, TikTok, Instagram)
3. Filters itinerary days to only include those with filled data
4. Calculates credits from day costs using calculateCreditsFromCost()
5. Makes POST request to /api/vlogs endpoint
6. On success: Resets form, fetches updated vlogs, redirects to dashboard
7. On error: Displays error message to user
8. Finally: Sets publishing state to false

### Validation Performed
**Current validations are MINIMAL:**
- ✅ Detects which video platform is used
- ✅ Filters itinerary days to only include filled ones
- ✅ Calculates credits based on day costs
- ❌ NO validation of user profile/credits
- ❌ NO validation of required fields (those happen in nextStep())
- ❌ NO validation of video URL validity

---

## 2. NEXTSTEP() FUNCTION - VALIDATION GATE
**Location:** `src/app/page.tsx` lines 357-371

### Current Implementation
The nextStep function acts as validation gate between form steps:

**Step 1 Validations:**
- Video URL required: "Please add a video link (YouTube, Facebook, TikTok, or Instagram)."
- Vlog title required: "Please add a vlog title."

**Step 2 Validations:**
- At least one itinerary day must have content: "Please fill in at least one itinerary day."

**Step 3 Behavior:**
- No validation occurs
- Directly calls publishVlog()

### Missing Validations at Step 3 (Publish Gate)
- No profile check (does user exist in database?)
- No user credits check
- No vlog count limit
- No blocked user check
- No validation that credits calculation is correct

---

## 3. CALCULATECREDITSFROMCOST() FUNCTION
**Location:** `src/app/page.tsx` lines 593-604

### Current Implementation
1. Sums all day costs from itinerary:
   - Removes empty cost entries
   - Strips currency symbols and commas (₱, $, spaces)
   - Parses to integer (defaults to 0 if invalid)

2. Converts to credits:
   - Formula: ₱75 = 1 credit
   - Uses Math.ceil() to round up
   - Returns 0 if total is 0 or negative

### Examples
- ₱75 day = 1 credit
- ₱76-150 days = 2 credits  
- ₱225 days (₱75 + ₱150) = 3 credits
- Free/no costs = 0 credits (free vlog)

---

## 4. PUBLISH BUTTON & ERROR DISPLAY
**Location:** `src/app/page.tsx` lines 1884-1900

### Button Behavior
- **Disabled state:** Only when publishing is true
- **Text changes:**
  - Steps 1-2: "Continue →"
  - Step 3: "Publish →" (or "Publishing…" while publishing)
- **No validation-based disabling:** Button doesn't disable based on form state validity

### Error Display
- Red error box displayed when publishError is set
- Shows error icon and error message text
- Displayed above the button row

---

## 5. READY TO PUBLISH SECTION
**Location:** `src/app/page.tsx` lines 1844-1882

### Information Displayed to Users
1. **Credits Calculation:**
   - "Credits per tourist" label with calculated amount
   - Text "Free" if 0 credits, otherwise "{N} credit(s)"

2. **Calculation Breakdown:**
   - "How we calculated this:" section
   - Total itinerary cost: ₱{totalDayCost}
   - Division formula: ÷ ₱75 per credit = {calculatedCredits}

3. **Revenue Projection** (only if credits > 0):
   - "At {N} credits · ₱{credits×10} per tourist · 80% to you = ₱{credits×8}"
   - "Est. 50 unlocks/month = ₱{(credits × 8 × 50).toLocaleString()} passive income"
   - Or if free: "Free vlog — great for building your audience."

4. **Ready to Publish Notice:**
   - "✅ Ready to publish?"
   - "Your vlog will go live immediately. Tourists can browse your itinerary and pay credits to unlock locked days. Make sure costs are accurate."

---

## 6. API ENDPOINT - SERVER-SIDE HANDLING
**Location:** `src/app/api/vlogs/route.ts` (POST method)

### What Happens When Data Is Sent
1. Accepts POST request with vlog data
2. Finds existing user or creates default "traveler" user
3. Creates vlog record with submitted data
4. Sets vlog status to "live" immediately
5. Returns created vlog as JSON

### Server-Side Validation Issues
**NO validation of:**
- User authentication/identity
- User profile existence or verification status
- Credits availability for creator
- Video URL validity
- Duplicate vlogs
- Spam/rate limiting
- Business rule constraints

⚠️ **CRITICAL:** Creates vlogs using a default "traveler" user if none exists in database!

---

## 7. STATE MANAGEMENT
**Location:** `src/app/page.tsx` lines 176-177

```typescript
const [publishing, setPublishing] = useState(false)
const [publishError, setPublishError] = useState('')
```

### Publishing Flow
1. User clicks "Publish →" at Step 3
2. nextStep() is called
3. Since postStep === 3, calls publishVlog()
4. setPublishing(true) (disables button)
5. Makes POST request to /api/vlogs
6. On error: setPublishError(error_message)
7. On success: Resets form, fetches updated vlogs, redirects to dashboard
8. setPublishing(false) in finally block

---

## SECURITY & VALIDATION GAPS

### CRITICAL ISSUES
1. No authentication check - Anyone can publish
2. No server-side validation - Any data is accepted
3. Default user auto-creation - Vlogs published to generic "traveler" account
4. No user profile validation - Doesn't check if user is real/verified
5. No credits validation - Doesn't verify costs are realistic

### HIGH PRIORITY
1. No rate limiting - Users could spam vlogs
2. No duplicate prevention - Same vlog could be published multiple times
3. No video URL validation - Doesn't verify the video actually exists
4. Limited error messages - Generic "Failed to publish. Please try again."

### MEDIUM PRIORITY
1. No cost validation - Extreme costs aren't flagged
2. No minimum itinerary requirement - Could publish with just one cost entry
3. No description requirement - Vlog could be published without description

---

## SUMMARY TABLE

| Component | Current Behavior | Issues |
|-----------|------------------|--------|
| **publishVlog()** | Calls API, handles response | No pre-flight validation |
| **nextStep()** | 3-step form validation | Step 3 skips all checks |
| **Credits Calculation** | 75 peso per credit formula | Works correctly, can be gamed |
| **Publish Button** | Disabled only while publishing | No validation-based disabling |
| **UI Display** | Shows credits and revenue | Informative but not protective |
| **API Endpoint** | Creates vlog with fallback user | No validation, no security |

---

## KEY FINDINGS

### What Users See Before Publishing
- Step 1: Video URL + Title fields with validation
- Step 2: Itinerary form with cost entries and validation
- Step 3: Credits calculation, revenue projection, confirmation message

### What Actually Gets Validated
- Step 1: Video URL and title are non-empty
- Step 2: At least one itinerary day has content
- Step 3: NOTHING

### What's Missing
- No confirmation that user is logged in / authenticated
- No check that user has authority to publish
- No verification that video URL is valid
- No validation of cost reasonableness
- No duplicate publish prevention
- No rate limiting
- No server-side validation gates

