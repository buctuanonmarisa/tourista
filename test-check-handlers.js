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
    
    // Intercept all navigation
    page.on('framenavigated', frame => {
      console.log('Frame navigated to:', frame.url());
    });
    
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
    
    // Check final URL
    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);
    
    // Check if we're on detail page
    const isDetailPage = await page.evaluate(() => {
      return document.body.innerText.includes('Back to Dashboard');
    });
    console.log('Is detail page:', isDetailPage);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
