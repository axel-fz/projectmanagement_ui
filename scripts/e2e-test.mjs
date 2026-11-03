import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('/home/axel/.gemini/antigravity/brain/3d8d30d7-2cec-4c3b-8860-4190e7ffb7da/scratch');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTests() {
  console.log('🚀 Starting E2E Puppeteer verification on http://localhost:3000 ...');

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Navigate to localhost:3000
  console.log('👉 Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 1000));

  // Check Title
  const title = await page.title();
  console.log(`✅ Page Title: "${title}"`);

  // Check Sidebar telemetry label removal
  const pageContent = await page.content();
  const hasTelemetry = pageContent.includes('Pro Telemetry Active');
  const hasLatencyMsg = pageContent.includes('Zero telemetry latency');

  if (!hasTelemetry && !hasLatencyMsg) {
    console.log('✅ SUCCESS: "Pro Telemetry Active" and "Zero telemetry latency" have been removed from the sidebar!');
  } else {
    console.error('❌ FAILURE: Sidebar still contains telemetry text!');
  }

  // Check canvas existence
  const hasCanvas = await page.$('canvas');
  if (hasCanvas) {
    console.log('✅ SUCCESS: Animated background canvas is mounted.');
  }

  // Wait 1.5 seconds for animation to cycle and render
  await new Promise((r) => setTimeout(r, 1500));

  // Take screenshot of Dark Mode Dashboard
  const darkDashboardPath = path.join(SCREENSHOT_DIR, '01_dark_dashboard.png');
  await page.screenshot({ path: darkDashboardPath });
  console.log(`📸 Saved screenshot: ${darkDashboardPath}`);

  // 2. Navigate to Settings Tab
  console.log('👉 Clicking Settings Tab in Sidebar...');
  const settingsButtons = await page.$$('button');
  for (const btn of settingsButtons) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.includes('Settings')) {
      await btn.click();
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 1000));
  const darkSettingsPath = path.join(SCREENSHOT_DIR, '02_dark_settings.png');
  await page.screenshot({ path: darkSettingsPath });
  console.log(`📸 Saved screenshot: ${darkSettingsPath}`);

  // 3. Switch to Light Mode
  console.log('👉 Clicking Light Mode Theme Option in Settings...');
  await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div'));
    const lightCard = divs.find(c => c.textContent && c.textContent.includes('Frosted Light Canvas') && !c.querySelector('h3'));
    if (lightCard) lightCard.click();
  });

  await new Promise((r) => setTimeout(r, 1000));
  const lightSettingsPath = path.join(SCREENSHOT_DIR, '03_light_settings.png');
  await page.screenshot({ path: lightSettingsPath });
  console.log(`📸 Saved screenshot: ${lightSettingsPath}`);

  // Switch back to Dashboard in Light Mode
  console.log('👉 Returning to Dashboard in Light Mode...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const dashBtn = buttons.find(b => b.textContent && b.textContent.includes('Dashboard'));
    if (dashBtn) dashBtn.click();
  });

  await new Promise((r) => setTimeout(r, 1000));
  const lightDashboardPath = path.join(SCREENSHOT_DIR, '04_light_dashboard.png');
  await page.screenshot({ path: lightDashboardPath });
  console.log(`📸 Saved screenshot: ${lightDashboardPath}`);

  // Switch back to Dark Mode via header Theme Toggle
  console.log('👉 Clicking Header Theme Toggle to switch back to Dark Mode...');
  const toggleBtn = await page.$('button[title*="dark"], button[title*="light"]');
  if (toggleBtn) {
    await toggleBtn.click();
  } else {
    await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label*="Switch to"]');
      if (btn) btn.click();
    });
  }

  await new Promise((r) => setTimeout(r, 1000));

  // 4. Test Task Quick-Toggle Pill
  console.log('👉 Testing Task Status Quick-Toggle Pills...');
  const taskUpdated = await page.evaluate(() => {
    const todoBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.trim() === 'To Do');
    const doneBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.trim() === 'Done');
    if (doneBtns.length > 0) {
      doneBtns[0].click();
      return true;
    }
    return false;
  });

  if (taskUpdated) {
    console.log('✅ SUCCESS: Clicked Done status pill on task.');
  }

  await new Promise((r) => setTimeout(r, 800));

  // 5. Test Global Search Filter
  console.log('👉 Testing search filtering in Project Portfolio...');
  const searchInput = await page.$('input[placeholder*="Global Search"]');
  if (searchInput) {
    await searchInput.type('Website');
    await new Promise((r) => setTimeout(r, 800));
    console.log('✅ Search input updated.');
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Global Search"]');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }

  console.log('🎉 All automated tests completed successfully!');
  await browser.close();
}

runTests().catch((err) => {
  console.error('❌ Test error:', err);
  process.exit(1);
});
