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
    
    // Wait for page to be interactive
    await page.waitForSelector('button[aria-label="Dashboard"]', { timeout: 5000 });
    console.log('✅ Dashboard button found');
    
    console.log('\nStep 2: Click Dashboard button');
    await page.click('button[aria-label="Dashboard"]');
    
    // Wait for dashboard content to appear
    try {
      await page.waitForSelector('.kpig', { timeout: 5000 });
      console.log('✅ Dashboard KPIs loaded');
    } catch (e) {
      console.log('⚠️ Dashboard KPIs not found, checking for vlog list...');
    }
    
    await delay(1000);
    
    // Check for vlog list
    const vlogCards = await page.$$('.vr2');
    console.log(`✅ Found ${vlogCards.length} vlog cards`);
    
    if (vlogCards.length > 0) {
      console.log('\nStep 3: Click first vlog card');
      
      // Get initial page content
      const beforeClick = await page.evaluate(() => {
        return {
          hasPanel: !!document.querySelector('.gi-panel'),
          pageText: document.body.innerText.substring(0, 200)
        };
      });
      console.log(`Before click - has panel: ${beforeClick.hasPanel}`);
      
      // Click the card
      await vlogCards[0].click();
      await delay(2000);
      
      // Check after click
      const afterClick = await page.evaluate(() => {
        return {
          hasPanel: !!document.querySelector('.gi-panel'),
          hasDashboard: document.body.innerText.includes('My vlogs'),
          hasDetail: document.body.innerText.includes('Back to Dashboard'),
          pageTitle: document.querySelector('.gi-panel-title')?.innerText || 'no title'
        };
      });
      
      console.log(`After click - has panel: ${afterClick.hasPanel}`);
      console.log(`After click - has dashboard: ${afterClick.hasDashboard}`);
      console.log(`After click - has detail page: ${afterClick.hasDetail}`);
      console.log(`Panel title: ${afterClick.pageTitle}`);
      
      if (afterClick.hasPanel && afterClick.hasDashboard) {
        console.log('\n✅ SUCCESS: Split-view working! Panel appeared on right side');
      } else if (afterClick.hasDetail) {
        console.log('\n❌ FAIL: Navigated to detail page instead of split-view');
      } else {
        console.log('\n⚠️ UNCLEAR: Panel state unclear');
      }
    }
    
    await page.screenshot({ path: '/tmp/dashboard-screenshots/v3-test.png' });
    console.log('\n📸 Screenshot saved');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
