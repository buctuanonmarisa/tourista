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
    
    // Get the HTML of the first vlog card
    const cardHTML = await page.evaluate(() => {
      const card = document.querySelector('.vr2');
      return card ? card.outerHTML : 'no card';
    });
    
    console.log('First vlog card HTML:');
    console.log(cardHTML.substring(0, 500));
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
