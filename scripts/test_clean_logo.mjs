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
    await new Promise(r => setTimeout(r, 1000));

    // Inspect brand logo section
    const logoInspection = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      const logoArea = aside?.querySelector('.flex.items-center.gap-3');
      const text = logoArea?.textContent.trim();
      const hasWorkspaceV2 = logoArea?.textContent.includes('Workspace v2.0');
      const hasNF = logoArea?.textContent.includes('NF');
      const hasNexaFlow = logoArea?.textContent.includes('NexaFlow');

      return {
        text,
        hasWorkspaceV2,
        hasNF,
        hasNexaFlow
      };
    });

    console.log('Logo Inspection Result:', logoInspection);

    if (logoInspection.hasWorkspaceV2) {
      throw new Error('FAIL: "Workspace v2.0" is still present in the logo!');
    }

    // Capture screenshot of sidebar logo
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'sidebar_logo_clean.png') });
    console.log('📸 Screenshot saved: sidebar_logo_clean.png');

    console.log('✅ "Workspace v2.0" label successfully removed from logo!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await browser.close();
  }
})();

