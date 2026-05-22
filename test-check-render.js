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
    
    // Check initial page
    const initialContent = await page.evaluate(() => {
      return {
        hasBrowse: document.body.innerText.includes('No vlogs found'),
        hasDashboard: document.body.innerText.includes('Good morning'),
        hasKPIs: !!document.querySelector('.kpig'),
        hasVlogList: !!document.querySelector('.vl2'),
      };
    });
    console.log('Initial page state:', initialContent);
    
    // Click dashboard
    await page.click('button[aria-label="Dashboard"]');
    await delay(1500);
    
    // Check after dashboard click
    const afterDashboard = await page.evaluate(() => {
      return {
        hasBrowse: document.body.innerText.includes('No vlogs found'),
        hasDashboard: document.body.innerText.includes('Good morning'),
        hasKPIs: !!document.querySelector('.kpig'),
        hasVlogList: !!document.querySelector('.vl2'),
        vlogCardCount: document.querySelectorAll('.vr2').length,
      };
    });
    console.log('After dashboard click:', afterDashboard);
    
    // Check the vlog card HTML
    const vlogCardHTML = await page.evaluate(() => {
      const card = document.querySelector('.vr2');
      return card ? card.outerHTML.substring(0, 200) : 'no card found';
    });
    console.log('Vlog card HTML:', vlogCardHTML);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
