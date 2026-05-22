const puppeteer = require('puppeteer');

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
    
    console.log('Loading app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    
    // Click dashboard
    await page.click('button[aria-label="Dashboard"]');
    await delay(1500);
    
    console.log('Clicking first vlog card...');
    const vlogCards = await page.$$('.vr2');
    if (vlogCards.length > 0) {
      await vlogCards[0].click();
      await delay(2000);
    }
    
    // Check the actual DOM structure
    const domStructure = await page.evaluate(() => {
      const grid = document.querySelector('.gi-grid');
      const panel = document.querySelector('.gi-panel');
      return {
        hasGiLayout: !!document.querySelector('.gi-layout'),
        hasGiGrid: !!grid,
        hasGiPanel: !!panel,
        hasDashboard: document.body.innerText.includes('Good morning'),
        hasDetailPanel: document.body.innerText.includes('Unlock itinerary') || document.body.innerText.includes('Reviews'),
        panelTitle: document.querySelector('.gi-panel-title')?.innerText || 'no title',
        gridVisible: grid ? grid.offsetParent !== null : false,
        panelVisible: panel ? panel.offsetParent !== null : false,
      };
    });
    
    console.log('DOM Structure:', JSON.stringify(domStructure, null, 2));
    
    if (domStructure.hasGiPanel && domStructure.hasDashboard && domStructure.panelVisible) {
      console.log('\n✅ SUCCESS: Split-view is working!');
    } else {
      console.log('\n❌ FAIL: Split-view not working');
    }
    
    await page.screenshot({ path: '/tmp/dashboard-screenshots/final-check.png' });
    console.log('Screenshot saved');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
