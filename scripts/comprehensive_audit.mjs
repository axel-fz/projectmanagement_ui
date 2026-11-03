import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const results = {
    objective: {},
    mainDashboard: {},
    projectManagement: {},
    taskManagement: {},
    createProject: {},
    userExperience: {}
  };

  try {
    // 1. Load application
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    // Clear localStorage to test fresh seed state
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    // --- 1. MAIN DASHBOARD ---
    // Sidebar
    const hasSidebar = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      const links = Array.from(aside?.querySelectorAll('button') || []).map(b => b.textContent.trim());
      const hasNF = aside?.textContent.includes('NF');
      return { exists: !!aside, hasNF, links };
    });
    results.mainDashboard.sidebar = hasSidebar;

    // Header
    const hasHeader = await page.evaluate(() => {
      const header = document.querySelector('header');
      const avatar = header?.querySelector('img');
      const notifBell = header?.querySelector('button[aria-label="Notifications"]');
      const search = header?.querySelector('input[placeholder*="Search"]');
      return { exists: !!header, hasAvatar: !!avatar, hasNotif: !!notifBell, hasSearch: !!search };
    });
    results.mainDashboard.header = hasHeader;

    // Welcome message
    const welcomeMsg = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent.trim() : null;
    });
    results.mainDashboard.welcomeMessage = welcomeMsg;

    // Statistics consistency
    const stats = await page.evaluate(() => {
      const cards = document.querySelectorAll('.glass-panel');
      let activeProjects = null;
      let completedTasks = null;
      let overdueTasks = null;
      cards.forEach(c => {
        const text = c.textContent;
        if (text.includes('Active Projects')) {
          const match = text.match(/Active Projects\s*(\d+)/);
          if (match) activeProjects = parseInt(match[1]);
        }
        if (text.includes('Completed Tasks')) {
          const match = text.match(/Completed Tasks\s*(\d+)\s*\/\s*(\d+)/);
          if (match) completedTasks = `${match[1]}/${match[2]}`;
        }
        if (text.includes('Overdue Tasks')) {
          const match = text.match(/Overdue Tasks\s*(\d+)/);
          if (match) overdueTasks = parseInt(match[1]);
        }
      });
      return { activeProjects, completedTasks, overdueTasks };
    });
    results.mainDashboard.statistics = stats;

    // Visual representation of progress
    const visualProgress = await page.evaluate(() => {
      const svgChart = !!document.querySelector('svg');
      const progressBars = document.querySelectorAll('[style*="width:"]').length;
      return { hasSvgChart: svgChart, progressBarsCount: progressBars };
    });
    results.mainDashboard.visualProgress = visualProgress;

    // --- 2. PROJECT MANAGEMENT ---
    // Attributes verification
    const projectAttributes = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('section')).find(s => s.textContent.includes('Project Portfolio'));
      if (!cards) return null;
      const projectCard = cards.querySelector('.glass-panel');
      if (!projectCard) return null;

      const hasName = !!projectCard.querySelector('h3');
      const hasDesc = !!projectCard.querySelector('p');
      const hasManager = projectCard.textContent.includes('Manager') && !!projectCard.querySelector('img');
      const hasDeadline = projectCard.textContent.includes('Deadline');
      const hasStatus = projectCard.textContent.includes('In Progress') || projectCard.textContent.includes('Pending') || projectCard.textContent.includes('Completed');
      const hasProgress = projectCard.textContent.includes('%');
      const hasColor = !!projectCard.querySelector('[style*="background-color"]');

      return { hasName, hasDesc, hasManager, hasDeadline, hasStatus, hasProgress, hasColor };
    });
    results.projectManagement.attributes = projectAttributes;

    // Search filter test
    const searchFilterTest = await page.evaluate(async () => {
      const searchInputs = document.querySelectorAll('input[placeholder="Search..."]');
      const projectSearch = searchInputs[0];
      if (!projectSearch) return { error: 'Project search input not found' };

      const initialCount = document.querySelectorAll('section:nth-of-type(1) h3').length;
      
      // Simulate input event
      projectSearch.value = 'Quantum';
      projectSearch.dispatchEvent(new Event('input', { bubbles: true }));
      projectSearch.dispatchEvent(new Event('change', { bubbles: true }));

      return { initialCount, typed: 'Quantum' };
    });
    await new Promise(r => setTimeout(r, 300));

    const postSearchCount = await page.evaluate(() => {
      const names = Array.from(document.querySelectorAll('section:nth-of-type(1) h3')).map(h => h.textContent.trim());
      return { count: names.length, names };
    });
    results.projectManagement.searchFilter = { ...searchFilterTest, ...postSearchCount };

    // Reset search
    await page.evaluate(() => {
      const searchInputs = document.querySelectorAll('input[placeholder="Search..."]');
      if (searchInputs[0]) {
        searchInputs[0].value = '';
        searchInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 200));

    // Status filter test
    const statusFilterTest = await page.evaluate(async () => {
      const selects = document.querySelectorAll('select');
      const statusSelect = selects[0]; // first select is status
      statusSelect.value = 'COMPLETED';
      statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 200));

    const postStatusFilter = await page.evaluate(() => {
      const badges = Array.from(document.querySelectorAll('section:nth-of-type(1) .glass-panel')).map(c => {
        return c.textContent.includes('Completed');
      });
      return { count: badges.length, allAreCompleted: badges.every(b => b === true) };
    });
    results.projectManagement.statusFilter = postStatusFilter;

    // Reset status filter
    await page.evaluate(() => {
      const selects = document.querySelectorAll('select');
      if (selects[0]) {
        selects[0].value = 'ALL';
        selects[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 200));

    // --- 3. TASK MANAGEMENT ---
    const taskAttributes = await page.evaluate(() => {
      const table = document.querySelector('table');
      if (!table) return null;
      const firstRow = table.querySelector('tbody tr');
      if (!firstRow) return null;

      const title = firstRow.querySelector('td:nth-child(2)')?.textContent.trim();
      const priority = firstRow.querySelector('td:nth-child(3)')?.textContent.trim();
      const statusButtons = Array.from(firstRow.querySelectorAll('td:nth-child(4) button')).map(b => b.textContent.trim());
      const deadline = firstRow.querySelector('td:nth-child(5)')?.textContent.trim();
      const assignee = firstRow.querySelector('td:nth-child(6)')?.textContent.trim();

      return { title, priority, statusButtons, deadline, assignee };
    });
    results.taskManagement.attributes = taskAttributes;

    // Task status update test
    const taskStatusUpdate = await page.evaluate(() => {
      const firstRow = document.querySelector('tbody tr');
      const doneButton = Array.from(firstRow.querySelectorAll('button')).find(b => b.textContent.trim() === 'Done');
      if (doneButton) {
        doneButton.click();
        return { clickedDone: true };
      }
      return { clickedDone: false };
    });
    await new Promise(r => setTimeout(r, 300));

    const postTaskStatus = await page.evaluate(() => {
      const firstRow = document.querySelector('tbody tr');
      const titleSpan = firstRow?.querySelector('td:nth-child(2) span');
      const isStrikethrough = titleSpan?.classList.contains('line-through');
      return { isStrikethrough };
    });
    results.taskManagement.statusUpdate = { ...taskStatusUpdate, ...postTaskStatus };

    // --- 4. CREATE A PROJECT ---
    // Open project modal
    const openModal = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const newProjBtn = buttons.find(b => b.textContent.includes('New Project'));
      if (newProjBtn) {
        newProjBtn.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 500));

    // Check modal form fields & no asterisks
    const formAudit = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      if (!modal) return null;

      const labels = Array.from(modal.querySelectorAll('label')).map(l => l.textContent.trim());
      const hasAsterisks = labels.some(l => l.includes('*'));

      const inputs = Array.from(modal.querySelectorAll('input, textarea, select')).map(i => i.name || i.id);

      return {
        isOpen: true,
        title: modal.querySelector('#modal-headline')?.textContent.trim(),
        labels,
        hasAsterisks,
        hasRequiredFields: {
          name: labels.some(l => l.toLowerCase().includes('name')),
          description: labels.some(l => l.toLowerCase().includes('description')),
          manager: labels.some(l => l.toLowerCase().includes('manager')),
          deadline: labels.some(l => l.toLowerCase().includes('deadline')),
          status: labels.some(l => l.toLowerCase().includes('status'))
        }
      };
    });
    results.createProject.formAudit = formAudit;

    // Test form validation: submit empty form
    await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      const submitBtn = Array.from(modal?.querySelectorAll('button') || []).find(b => b.textContent.includes('Create Project') || b.type === 'submit');
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    const validationErrors = await page.evaluate(() => {
      const errors = Array.from(document.querySelectorAll('.text-rose-500')).map(e => e.textContent.trim());
      return errors;
    });
    results.createProject.validation = { triggersErrors: validationErrors.length > 0, errors: validationErrors };

    // Fill valid form and submit
    await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      const nameInput = modal.querySelector('input[placeholder*="Design System"], input[type="text"]');
      const descInput = modal.querySelector('textarea');
      const deadlineInput = modal.querySelector('input[type="date"]');

      if (nameInput) {
        nameInput.value = 'Alpha Test Project Automated';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (descInput) {
        descInput.value = 'A verified test project created to audit full functionality';
        descInput.dispatchEvent(new Event('input', { bubbles: true }));
        descInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (deadlineInput) {
        deadlineInput.value = '2026-12-31';
        deadlineInput.dispatchEvent(new Event('input', { bubbles: true }));
        deadlineInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const submitBtn = Array.from(modal.querySelectorAll('button')).find(b => b.type === 'submit');
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Verify feedback toast and DOM update without reload
    const creationResult = await page.evaluate(() => {
      const toast = document.querySelector('.bg-emerald-500\\/10, [class*="text-emerald"], [class*="border-emerald"]');
      const projectCard = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Alpha Test Project Automated'));
      return {
        hasToast: !!toast || document.body.textContent.includes('created successfully'),
        projectAddedInDOM: !!projectCard
      };
    });
    results.createProject.creationResult = creationResult;

    // --- 5. USER EXPERIENCE ---
    // Close button & escape interaction
    // Open modal again to test Esc and Close button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const newProjBtn = buttons.find(b => b.textContent.includes('New Project'));
      if (newProjBtn) newProjBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const modalOpenBeforeEsc = await page.evaluate(() => !!document.querySelector('div[role="dialog"]'));
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));
    const modalClosedAfterEsc = await page.evaluate(() => !document.querySelector('div[role="dialog"]'));

    results.userExperience.keyboardClose = { modalOpenBeforeEsc, modalClosedAfterEsc };

    // Navigation test: switch tabs
    await page.evaluate(() => {
      const aside = document.querySelector('aside');
      const buttons = Array.from(aside?.querySelectorAll('button') || []);
      const tasksTab = buttons.find(b => b.textContent.includes('Tasks'));
      if (tasksTab) tasksTab.click();
    });
    await new Promise(r => setTimeout(r, 300));

    const navigationResult = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.textContent.trim();
      return { activePageTitle: h1 };
    });
    results.userExperience.navigation = navigationResult;

    // Small screen responsiveness test
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(r => setTimeout(r, 300));
    const mobileLayout = await page.evaluate(() => {
      const hamburger = !!document.querySelector('button[aria-label="Toggle navigation menu"]');
      const aside = document.querySelector('aside');
      const asideHidden = aside?.classList.contains('-translate-x-full');
      return { hasHamburger: hamburger, sidebarOffscreen: asideHidden };
    });
    results.userExperience.mobileResponsiveness = mobileLayout;

    console.log(JSON.stringify(results, null, 2));

  } catch (err) {
    console.error('Audit failed with error:', err);
  } finally {
    await browser.close();
  }
})();
