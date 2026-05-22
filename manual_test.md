# Manual Testing Steps

## Test 1: Emoji Picker Size Reduction
1. Open http://localhost:3001
2. Click "Create" button
3. Fill in video URL: https://www.youtube.com/watch?v=test
4. Fill in title: Test Vlog
5. Click "Continue →" to go to Step 2
6. Click the 😊 emoji button next to "Highlights"
7. **VERIFY**: Emoji picker should be noticeably smaller (200px instead of 300px)
8. **VERIFY**: Emoji picker should NOT show preview panel at the bottom
9. Click an emoji to insert it
10. **VERIFY**: Emoji is inserted into the textarea
11. **VERIFY**: Cursor position is restored after emoji insertion

## Test 2: Credits Validation
1. Continue from Test 1, or start fresh
2. Fill in itinerary details (at least one day with content)
3. Click "Continue →" to go to Step 3 (Credits & publish)
4. **VERIFY**: Checkbox "I've reviewed the credits..." is visible and unchecked
5. **VERIFY**: "Publish →" button is DISABLED (grayed out)
6. Check the checkbox
7. **VERIFY**: "Publish →" button becomes ENABLED
8. Uncheck the checkbox
9. **VERIFY**: "Publish →" button becomes DISABLED again

## Test 3: Free Day Validation
1. Continue from Test 2
2. Go back to Step 2
3. Lock ALL itinerary days (toggle the lock icon on each day)
4. Go forward to Step 3
5. Check the checkbox
6. Click "Publish →"
7. **VERIFY**: Error message appears: "Please unlock at least one itinerary day..."
8. Go back to Step 2
9. Unlock at least one day
10. Go forward to Step 3
11. Check the checkbox
12. Click "Publish →"
13. **VERIFY**: Vlog publishes successfully

## Test 4: Checkbox Reset on Back
1. Go to Step 3 with checkbox checked
2. Click "← Back" to go to Step 2
3. Click "Continue →" to go back to Step 3
4. **VERIFY**: Checkbox is unchecked again
5. **VERIFY**: Publish button is disabled

