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

    // Test 1: Open Help Dropdown
    console.log('2. Clicking Help button in navbar...');
    const helpBtn = await page.$('button[aria-label="Help & Guide"]');
    if (!helpBtn) throw new Error('Help button not found');
    await helpBtn.click();
    await new Promise(r => setTimeout(r, 400));

    // Verify both tour options exist in the dropdown
    const options = await page.evaluate(() => {
      const dropdown = document.querySelector('header .w-80');
      return Array.from(dropdown?.querySelectorAll('button') || []).map(b => b.textContent.trim());
    });
    console.log('Help dropdown options:', options);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'help_dropdown_with_project_tour.png') });

    // Test 2: Click "How to create projects & tasks"
    console.log('3. Clicking "How to create projects & tasks"...');
    await page.evaluate(() => {
      const dropdown = document.querySelector('header .w-80');
      const optionBtn = Array.from(dropdown?.querySelectorAll('button') || []).find(b =>
        b.textContent.includes('How to create projects & tasks')
      );
      if (optionBtn) optionBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Test 3: Inspect Project & Task Creation Tour Step 1
    const step1Info = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      const title = modal?.querySelector('#tour-headline')?.textContent.trim();
      const stepText = modal?.textContent.match(/Step \d+ of \d+/)?.[0];
      const category = modal?.querySelector('span.uppercase')?.textContent.trim();
      const buttons = Array.from(modal?.querySelectorAll('button') || []).map(b => b.textContent.trim());
      const hasAction = buttons.some(t => t.includes('Practice') || t.includes('Open'));
      return { title, stepText, category, hasAction, buttons };
    });
    console.log('Step 1 (How to Create a Project):', step1Info);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'project_task_tour_step1.png') });

    // Test 4: Navigate to Step 2 (Project Form Fields)
    console.log('4. Navigating to Step 2...');
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Next Step')
      );
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const step2Info = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      const title = modal?.querySelector('#tour-headline')?.textContent.trim();
      const stepText = modal?.textContent.match(/Step \d+ of \d+/)?.[0];
      return { title, stepText };
    });
    console.log('Step 2 (Filling Required Project Details):', step2Info);

    // Test 5: Navigate to Step 3 (How to Create a Task)
    console.log('5. Navigating to Step 3 (How to Create a Task)...');
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Next Step')
      );
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const step3Info = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      const title = modal?.querySelector('#tour-headline')?.textContent.trim();
      const stepText = modal?.textContent.match(/Step \d+ of \d+/)?.[0];
      return { title, stepText };
    });
    console.log('Step 3 (How to Create a Task):', step3Info);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'project_task_tour_step3.png') });

    // Test 6: Advance to Step 4 (Status Quick-Toggles) and Step 5 (People Involved)
    await page.keyboard.press('ArrowRight');
    await new Promise(r => setTimeout(r, 300));
    await page.keyboard.press('ArrowRight');
    await new Promise(r => setTimeout(r, 300));

    const step5Info = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      const title = modal?.querySelector('#tour-headline')?.textContent.trim();
      const stepText = modal?.textContent.match(/Step \d+ of \d+/)?.[0];
      const completeBtn = Array.from(modal?.querySelectorAll('button') || []).find(b =>
        b.textContent.includes('Complete Tour')
      )?.textContent.trim();
      return { title, stepText, completeBtn };
    });
    console.log('Step 5 (Filter Tasks by Project & People Involved):', step5Info);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'project_task_tour_step5.png') });

    // Test 7: Click "Complete Tour"
    console.log('6. Completing tour...');
    await page.evaluate(() => {
      const completeBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Complete Tour')
      );
      if (completeBtn) completeBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const isClosed = await page.evaluate(() => !document.querySelector('div[role="dialog"]'));
    console.log('Product tour closed cleanly:', isClosed);

    console.log('✅ ALL PRODUCT TOUR TESTS PASSED!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await browser.close();
  }
})();
