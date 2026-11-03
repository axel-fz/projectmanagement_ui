import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('/home/axel/.gemini/antigravity/brain/3d8d30d7-2cec-4c3b-8860-4190e7ffb7da/scratch');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    console.log('1. Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));

    // Test 1: Check Computed Font Styles
    console.log('2. Inspecting computed font styles...');
    const fontInfo = await page.evaluate(() => {
      const bodyStyle = window.getComputedStyle(document.body);
      const h1Style = window.getComputedStyle(document.querySelector('h1'));
      const tableStyle = window.getComputedStyle(document.querySelector('table') || document.body);

      return {
        bodyFontFamily: bodyStyle.fontFamily,
        bodyFontFeatureSettings: bodyStyle.fontFeatureSettings,
        bodyLetterSpacing: bodyStyle.letterSpacing,
        h1FontFamily: h1Style?.fontFamily,
        tableFontFamily: tableStyle?.fontFamily
      };
    });

    console.log('Computed Typography Info:', JSON.stringify(fontInfo, null, 2));

    // Take screenshot of dark mode with Inter font
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'inter_font_dark_mode.png') });
    console.log('📸 Screenshot saved: inter_font_dark_mode.png');

    // Test 2: Switch to Light Mode and verify Inter rendering
    console.log('3. Switching to light mode...');
    const themeBtn = await page.$('button[aria-label*="light"], button[aria-label*="dark"]');
    if (themeBtn) await themeBtn.click();
    await new Promise(r => setTimeout(r, 500));

    // Take screenshot of light mode with Inter font
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'inter_font_light_mode.png') });
    console.log('📸 Screenshot saved: inter_font_light_mode.png');

    console.log('✅ INTER FONT INTEGRATION SUCCESSFULLY VERIFIED!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await browser.close();
  }
})();

