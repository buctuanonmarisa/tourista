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
    
    // Check for dashboard elements
    const hasKPIs = await page.$('.kpig') !== null;
    const hasVlogList = await page.$('.vl2') !== null;
    console.log(`✅ Dashboard KPIs visible: ${hasKPIs}`);
    console.log(`✅ Vlog list visible: ${hasVlogList}`);
    
    // Take screenshot
    const screenshotDir = '/tmp/dashboard-screenshots';
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
    
    await page.screenshot({ path: path.join(screenshotDir, '01-dashboard-list.png') });
    console.log('📸 Screenshot saved: 01-dashboard-list.png');
    
    console.log('\nStep 3: Check vlog cards');
    const vlogCards = await page.$$('.vr2');
    console.log(`✅ Found ${vlogCards.length} vlog cards`);
    
    if (vlogCards.length > 0) {
      console.log('\nStep 4: Click first vlog card');
      await vlogCards[0].click();
      await delay(1500);
      console.log('✅ Clicked first vlog card');
      
      // Check if detail panel appeared
      const detailPanel = await page.$('.gi-panel');
      console.log(`✅ Detail panel visible: ${detailPanel !== null}`);
      
      await page.screenshot({ path: path.join(screenshotDir, '02-dashboard-details.png') });
      console.log('📸 Screenshot saved: 02-dashboard-details.png');
      
      console.log('\nStep 5: Test close button');
      const closeBtn = await page.$('.gi-panel-close');
      if (closeBtn) {
        await closeBtn.click();
        await delay(800);
        const panelAfterClose = await page.$('.gi-panel');
        console.log(`✅ Panel closed: ${panelAfterClose === null}`);
      }
    }
    
    console.log('\nStep 6: Click Post vlog button');
    const postBtns = await page.$$('button.nb');
    if (postBtns.length > 0) {
      await postBtns[0].click();
      await delay(1500);
      console.log('✅ Clicked Post vlog button');
      
      // Check if post form appeared
      const postFormTitle = await page.evaluate(() => {
        return document.body.innerText.includes('Post a new vlog');
      });
      console.log(`✅ Post form visible: ${postFormTitle}`);
      
      await page.screenshot({ path: path.join(screenshotDir, '03-dashboard-post-form.png') });
      console.log('📸 Screenshot saved: 03-dashboard-post-form.png');
    }
    
    console.log('\nStep 7: Test mobile responsiveness');
    await page.setViewport({ width: 375, height: 667 });
    await delay(800);
    console.log('✅ Resized to mobile (375x667)');
    
    await page.screenshot({ path: path.join(screenshotDir, '04-dashboard-mobile.png') });
    console.log('📸 Screenshot saved: 04-dashboard-mobile.png');
    
    console.log('\n✅ All verification steps completed successfully!');
    console.log(`📁 Screenshots saved to: ${screenshotDir}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
