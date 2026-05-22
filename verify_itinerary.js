const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for vlogs to load
    await page.waitForSelector('.vgc', { timeout: 5000 }).catch(() => null);
    
    // Click on the first vlog to open the detail panel
    const firstVlog = await page.$('.vgc');
    if (firstVlog) {
      await firstVlog.click();
      await page.waitForTimeout(1000);
      
      // Take a screenshot of the detail panel
      await page.screenshot({ path: 'itinerary-panel.png', fullPage: false });
      console.log('Screenshot saved: itinerary-panel.png');
      
      // Check if itinerary section exists
      const itinerarySection = await page.$('text=Day-by-day itinerary');
      if (itinerarySection) {
        console.log('✓ Itinerary section found in detail panel!');
      } else {
        console.log('✗ Itinerary section NOT found in detail panel');
      }
    } else {
      console.log('No vlogs found to click');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
