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
    
    // Capture console logs
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    console.log('Loading app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    
    await page.waitForSelector('button[aria-label="Dashboard"]', { timeout: 5000 });
    console.log('Clicking Dashboard button...');
    await page.click('button[aria-label="Dashboard"]');
    
    await page.waitForSelector('.vr2', { timeout: 5000 });
    console.log('Dashboard loaded, clicking first vlog card...');
    
    const vlogCards = await page.$$('.vr2');
    if (vlogCards.length > 0) {
      await vlogCards[0].click();
      await delay(2000);
      console.log('Card clicked, waiting for result...');
    }
    
    await page.screenshot({ path: '/tmp/dashboard-screenshots/with-logs.png' });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
