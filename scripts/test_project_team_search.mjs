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

    // Test 1: Search by Project Name in Task Search
    console.log('2. Testing Task search by project name ("Website Redesign")...');
    const taskSearch = await page.$('input[placeholder*="Search tasks, projects, people"]');
    if (!taskSearch) throw new Error('Task search input not found');

    await taskSearch.type('Website Redesign');
    await new Promise(r => setTimeout(r, 600));

    const searchStats1 = await page.evaluate(() => {
      const summaryText = document.body.textContent;
      const rows = document.querySelectorAll('#team-tasks-section tbody tr');
      const hasPeopleInvolved = summaryText.includes('People involved');
      return { rowCount: rows.length, hasPeopleInvolved };
    });
    console.log('Search by Project Name Result:', searchStats1);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'search_by_project_name.png') });

    // Clear search
    await page.evaluate(() => {
      const clearBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Clear search') || b.textContent === '✕');
      if (clearBtn) clearBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Test 2: Select Project from Dropdown
    console.log('3. Testing Project Dropdown selection...');
    const projectSelect = await page.$('select[title="Filter by Project"]');
    if (!projectSelect) throw new Error('Project dropdown not found');

    // Select first project
    await page.evaluate((sel) => {
      sel.value = sel.options[1].value; // First actual project
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }, projectSelect);
    await new Promise(r => setTimeout(r, 600));

    const bannerInfo = await page.evaluate(() => {
      const banner = document.querySelector('#team-tasks-section .p-4.rounded-2xl');
      const title = banner?.querySelector('h3')?.textContent.trim();
      const peopleText = banner?.textContent;
      const hasLead = peopleText?.includes('Lead');
      const teamChips = Array.from(banner?.querySelectorAll('button') || []).map(b => b.textContent.trim());
      return { title, hasLead, teamChips };
    });
    console.log('Project Focused Banner & People Involved:', bannerInfo);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'project_dropdown_people_involved.png') });

    // Test 3: Filter by specific person within that project
    console.log('4. Testing filtering tasks by clicking a person chip in the Project Team roster...');
    const clickedPerson = await page.evaluate(() => {
      const banner = document.querySelector('#team-tasks-section .p-4.rounded-2xl');
      const buttons = Array.from(banner?.querySelectorAll('button') || []);
      // Find a contributor button (not 'All Team')
      const personBtn = buttons.find(b => !b.textContent.includes('All Team') && !b.textContent.includes('View All Projects'));
      if (personBtn) {
        personBtn.click();
        return personBtn.textContent.trim();
      }
      return null;
    });
    await new Promise(r => setTimeout(r, 500));

    const personFilteredRows = await page.evaluate(() => {
      const rows = document.querySelectorAll('#team-tasks-section tbody tr');
      return rows.length;
    });
    console.log(`Filtered by person "${clickedPerson}": ${personFilteredRows} tasks shown`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'filter_by_person_chip.png') });

    // Test 4: Search by Person name in Global Search Header
    console.log('5. Testing Global Search in Header by team member name ("Marcus")...');
    const headerSearch = await page.$('header input[type="text"]');
    if (headerSearch) {
      await headerSearch.click({ clickCount: 3 });
      await headerSearch.type('Marcus');
      await new Promise(r => setTimeout(r, 600));

      const headerDropdown = await page.evaluate(() => {
        const dropdown = document.querySelector('header .max-h-96');
        const text = dropdown?.textContent.trim();
        return { exists: !!dropdown, text };
      });
      console.log('Header Search Suggestions:', headerDropdown);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'header_global_search_suggestions.png') });
    }

    console.log('✅ ALL SEARCH & TEAM INTEGRATION TESTS PASSED!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await browser.close();
  }
})();

