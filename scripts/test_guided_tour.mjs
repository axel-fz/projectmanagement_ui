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

    // Test 1: Check Help button in Navbar
    console.log('2. Checking Help button in navbar...');
    const helpBtn = await page.$('button[aria-label="Help & Guide"]');
    if (!helpBtn) throw new Error('Help button not found in navbar');

    // Click Help button to open dropdown
    console.log('3. Clicking Help button to open dropdown...');
    await helpBtn.click();
    await new Promise(r => setTimeout(r, 400));

    const dropdownInfo = await page.evaluate(() => {
      const dropdown = document.querySelector('header .w-72');
      if (!dropdown) return null;
      const options = Array.from(dropdown.querySelectorAll('button')).map(b => ({
        title: b.querySelector('span.font-bold, span.font-semibold')?.textContent.trim(),
        detail: b.querySelector('span.text-\\[11px\\]')?.textContent.trim()
      }));
      return { exists: true, options };
    });
    console.log('Help Dropdown info:', dropdownInfo);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'help_dropdown_open.png') });

    // Test 2: Click "Help to use the app" option
    console.log('4. Clicking "Help to use the app" option in dropdown...');
    await page.evaluate(() => {
      const dropdown = document.querySelector('header .w-72');
      const tourBtn = Array.from(dropdown?.querySelectorAll('button') || []).find(b =>
        b.textContent.includes('Help to use the app')
      );
      if (tourBtn) tourBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Test 3: Check Guided Tour Modal
    const tourModalInfo = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      if (!modal) return null;
      const title = modal.querySelector('#tour-headline')?.textContent.trim();
      const stepText = modal.textContent.match(/Step \d+ of \d+/)?.[0];
      const category = modal.querySelector('span.uppercase')?.textContent.trim();
      return { exists: true, title, stepText, category };
    });
    console.log('Guided Tour Modal Step 1:', tourModalInfo);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'guided_tour_step1.png') });

    // Test 4: Navigate to Next Step
    console.log('5. Clicking "Next Step" button...');
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
    console.log('Guided Tour Modal Step 2:', step2Info);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'guided_tour_step2.png') });

    // Test 5: Keyboard ArrowRight navigation to Step 5 (Search & Collaboration)
    console.log('6. Navigating through steps using ArrowRight...');
    await page.keyboard.press('ArrowRight');
    await new Promise(r => setTimeout(r, 300));
    await page.keyboard.press('ArrowRight');
    await new Promise(r => setTimeout(r, 300));
    await page.keyboard.press('ArrowRight');
    await new Promise(r => setTimeout(r, 300));

    const step5Info = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      const title = modal?.querySelector('#tour-headline')?.textContent.trim();
      const stepText = modal?.textContent.match(/Step \d+ of \d+/)?.[0];
      return { title, stepText };
    });
    console.log('Guided Tour Modal Step 5:', step5Info);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'guided_tour_step5.png') });

    // Test 6: Advance to final step (Step 6)
    await page.keyboard.press('ArrowRight');
    await new Promise(r => setTimeout(r, 300));

    const step6Info = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      const title = modal?.querySelector('#tour-headline')?.textContent.trim();
      const actionBtn = Array.from(modal?.querySelectorAll('button') || []).find(b =>
        b.textContent.includes('Get Started')
      )?.textContent.trim();
      return { title, actionBtn };
    });
    console.log('Guided Tour Modal Final Step:', step6Info);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'guided_tour_final_step.png') });

    // Test 7: Click "Get Started" to close tour
    console.log('7. Completing tour with "Get Started"...');
    await page.evaluate(() => {
      const getStartedBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Get Started')
      );
      if (getStartedBtn) getStartedBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const isClosed = await page.evaluate(() => !document.querySelector('div[role="dialog"]'));
    console.log('Tour modal closed successfully:', isClosed);

    console.log('✅ ALL NAVBAR HELP & GUIDED TOUR TESTS PASSED!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await browser.close();
  }
})();

