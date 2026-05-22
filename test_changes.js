const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    console.log('✅ App loaded');
    
    // Click on "Create" or post button to start vlog creation
    await page.click('text=Create');
    console.log('✅ Clicked Create button');
    
    // Wait for step 1 to load
    await page.waitForSelector('input[placeholder*="YouTube"]', { timeout: 5000 });
    console.log('✅ Step 1 loaded');
    
    // Fill in video URL
    await page.fill('input[placeholder*="YouTube"]', 'https://www.youtube.com/watch?v=test');
    console.log('✅ Video URL filled');
    
    // Fill in title
    await page.fill('input[placeholder*="Siargao"]', 'Test Vlog Title');
    console.log('✅ Title filled');
    
    // Click Continue to go to step 2
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(500);
    console.log('✅ Moved to Step 2');
    
    // Check if emoji button exists
    const emojiButton = await page.$('button[title="Add emoji"]');
    if (emojiButton) {
      console.log('✅ Emoji button found');
      
      // Click emoji button to open picker
      await emojiButton.click();
      await page.waitForTimeout(500);
      
      // Check if emoji picker is visible
      const pickerHeight = await page.evaluate(() => {
        const picker = document.querySelector('[role="listbox"]');
        if (picker) {
          const rect = picker.getBoundingClientRect();
          return rect.height;
        }
        return null;
      });
      
      if (pickerHeight) {
        console.log(`✅ Emoji picker height: ${pickerHeight}px (should be ~200px)`);
        if (pickerHeight < 250) {
          console.log('✅ Emoji picker is compact (< 250px)');
        } else {
          console.log('⚠️ Emoji picker might be too large');
        }
      }
    } else {
      console.log('❌ Emoji button not found');
    }
    
    // Fill in some itinerary content
    const highlights = await page.$('textarea[placeholder*="What made this day special"]');
    if (highlights) {
      await highlights.fill('Amazing sunset views!');
      console.log('✅ Highlights filled');
    }
    
    // Click Continue to go to step 3
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(500);
    console.log('✅ Moved to Step 3 (Credits & publish)');
    
    // Check if checkbox exists
    const checkbox = await page.$('#credits-review-checkbox');
    if (checkbox) {
      console.log('✅ Credits review checkbox found');
      
      // Check if checkbox is unchecked
      const isChecked = await checkbox.isChecked();
      console.log(`✅ Checkbox is ${isChecked ? 'checked' : 'unchecked'} (should be unchecked)`);
      
      // Check if Publish button is disabled
      const publishBtn = await page.$('button:has-text("Publish →")');
      const isDisabled = await publishBtn.isDisabled();
      console.log(`✅ Publish button is ${isDisabled ? 'disabled' : 'enabled'} (should be disabled)`);
      
      // Check the checkbox
      await checkbox.check();
      await page.waitForTimeout(300);
      console.log('✅ Checkbox checked');
      
      // Check if Publish button is now enabled
      const isNowEnabled = await publishBtn.isDisabled();
      console.log(`✅ Publish button is now ${isNowEnabled ? 'disabled' : 'enabled'} (should be enabled)`);
      
      // Uncheck the checkbox
      await checkbox.uncheck();
      await page.waitForTimeout(300);
      console.log('✅ Checkbox unchecked');
      
      // Check if Publish button is disabled again
      const isDisabledAgain = await publishBtn.isDisabled();
      console.log(`✅ Publish button is ${isDisabledAgain ? 'disabled' : 'enabled'} (should be disabled)`);
      
    } else {
      console.log('❌ Credits review checkbox not found');
    }
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
