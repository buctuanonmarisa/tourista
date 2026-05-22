const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    console.log('Step 1: Navigate to app');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    console.log('✅ App loaded');
    
    console.log('\nStep 2: Click Dashboard button');
    await page.click('button[aria-label="Dashboard"]');
    await delay(1500);
    console.log('✅ Clicked Dashboard button');
    
    // Check current page
    const currentPage = await page.evaluate(() => {
      return document.body.innerText.substring(0, 100);
    });
    console.log(`Current page content: ${currentPage.substring(0, 50)}...`);
    
    // Check if we're on dashboard or detail page
    const isDetailPage = await page.evaluate(() => {
      return document.body.innerText.includes('Back to Dashboard');
    });
    
    const isDashboard = await page.evaluate(() => {
      return document.body.innerText.includes('Good morning');
    });
    
    console.log(`Is detail page: ${isDetailPage}`);
    console.log(`Is dashboard: ${isDashboard}`);
    
    if (isDashboard) {
      console.log('\n✅ Successfully on dashboard page');
      
      // Check for split-view layout
      const hasGiLayout = await page.$('.gi-layout') !== null;
      const hasGiGrid = await page.$('.gi-grid') !== null;
      console.log(`Has gi-layout: ${hasGiLayout}`);
      console.log(`Has gi-grid: ${hasGiGrid}`);
      
      // Get vlog cards
      const vlogCards = await page.$$('.vr2');
      console.log(`Found ${vlogCards.length} vlog cards`);
      
      if (vlogCards.length > 0) {
        console.log('\nStep 3: Click first vlog card');
        await vlogCards[0].click();
        await delay(2000);
        
        // Check if panel appeared
        const hasPanel = await page.$('.gi-panel') !== null;
        const stillOnDashboard = await page.evaluate(() => {
          return document.body.innerText.includes('Good morning');
        });
        
        console.log(`Panel visible: ${hasPanel}`);
        console.log(`Still on dashboard: ${stillOnDashboard}`);
        
        if (hasPanel && stillOnDashboard) {
          console.log('✅ Split-view working! Panel appeared on right side');
        } else if (!stillOnDashboard) {
          console.log('❌ Navigated away from dashboard instead of showing split-view');
        }
      }
    }
    
    await page.screenshot({ path: '/tmp/dashboard-screenshots/final-test.png' });
    console.log('\n📸 Screenshot saved');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
