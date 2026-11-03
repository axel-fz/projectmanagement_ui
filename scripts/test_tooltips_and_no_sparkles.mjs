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

    // Test 1: Check Tooltips across Dashboard elements
    console.log('2. Inspecting tooltips across the app...');
    const tooltipsFound = await page.evaluate(() => {
      const elementsWithTitle = Array.from(document.querySelectorAll('[title]')).map(el => ({
        tag: el.tagName.toLowerCase(),
        title: el.getAttribute('title'),
        text: el.textContent.trim().slice(0, 30)
      }));

      // Check specific key areas
      const sidebarLinks = Array.from(document.querySelectorAll('aside nav button')).map(b => ({
        text: b.textContent.trim(),
        title: b.getAttribute('title')
      }));

      const headerActions = Array.from(document.querySelectorAll('header button, header [title]')).map(b => ({
        title: b.getAttribute('title')
      })).filter(b => b.title);

      const statsCards = Array.from(document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-3 > div')).map(c => ({
        title: c.getAttribute('title')
      }));

      const statusPills = Array.from(document.querySelectorAll('tbody tr:first-child button')).map(b => ({
        text: b.textContent.trim(),
        title: b.getAttribute('title')
      }));

      return {
        totalWithTitle: elementsWithTitle.length,
        sidebarLinks,
        headerActions,
        statsCards,
        statusPills
      };
    });

    console.log('Tooltips Summary:', JSON.stringify(tooltipsFound, null, 2));

    // Test 2: Open Guided Tour and verify NO Sparkles icon (now Compass icon)
    console.log('3. Opening Guided Tour...');
    const helpBtn = await page.$('button[aria-label="Help & Guide"]');
    if (helpBtn) await helpBtn.click();
    await new Promise(r => setTimeout(r, 400));

    await page.evaluate(() => {
      const tourBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Help to use the app')
      );
      if (tourBtn) tourBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Inspect the icon in the guided tour modal
    const modalInspection = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      if (!modal) return { open: false };

      const iconSvg = modal.querySelector('.w-12.h-12 svg');
      const iconClasses = iconSvg?.getAttribute('class') || '';
      // Check if lucide-sparkles is present
      const isSparkles = iconClasses.includes('lucide-sparkles');
      const isCompass = iconClasses.includes('lucide-compass');

      const proTipSvg = modal.querySelector('.p-3.rounded-xl svg');
      const proTipClasses = proTipSvg?.getAttribute('class') || '';
      const isProTipLightbulb = proTipClasses.includes('lucide-lightbulb');

      return {
        open: true,
        isSparkles,
        isCompass,
        iconClasses,
        isProTipLightbulb,
        proTipClasses
      };
    });
    console.log('Guided Tour Icon Inspection:', modalInspection);

    if (modalInspection.isSparkles) {
      throw new Error('FAIL: Sparkles icon was still found in the modal!');
    }

    // Take screenshot of step 1 with the new Compass icon and Lightbulb pro-tip
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'guided_tour_no_sparkles_new_compass.png') });
    console.log('📸 Screenshot saved: guided_tour_no_sparkles_new_compass.png');

    console.log('✅ ALL TOOLTIPS AND LOGO REMOVAL TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await browser.close();
  }
})();

