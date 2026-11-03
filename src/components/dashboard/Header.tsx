'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Bell,
  Menu,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Settings as SettingsIcon,
  FolderKanban,
  Users,
  CheckSquare2,
  HelpCircle,
  Compass,
  BookOpen,
  ChevronDown,
  FolderPlus,
} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAppStore } from '../../store/useAppStore';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const currentManager = useAppStore((state) => state.currentManager);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const projects = useAppStore((state) => state.projects);
  const tasks = useAppStore((state) => state.tasks);
  const setSelectedProjectId = useAppStore((state) => state.setSelectedProjectId);
  const setIsGuidedTourOpen = useAppStore((state) => state.setIsGuidedTourOpen);
  const setIsProjectTaskTourOpen = useAppStore((state) => state.setIsProjectTaskTourOpen);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [todayStr, setTodayStr] = useState('2026-11-03');
  const notifRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  // Close notifications, help dropdown, or search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setShowHelpDropdown(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const overdueTasks = tasks.filter(
    (t) => t.status !== 'DONE' && t.deadline < todayStr
  );

  // Quick matches for dropdown preview
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return { matchedProjects: [], matchedPeople: [], matchedTasks: [] };

    const matchedProjects = projects
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.manager.name.toLowerCase().includes(q)
      )
      .slice(0, 3);

    // Collect all people matching
    const peopleMap = new Map<string, any>();
    projects.forEach((p) => {
      if (
        p.manager.name.toLowerCase().includes(q) ||
        p.manager.role?.toLowerCase().includes(q)
      ) {
        peopleMap.set(p.manager.id, p.manager);
      }
    });
    tasks.forEach((t) => {
      if (
        t.assignee &&
        (t.assignee.name.toLowerCase().includes(q) ||
          t.assignee.role?.toLowerCase().includes(q))
      ) {
        peopleMap.set(t.assignee.id, t.assignee);
      }
    });
    const matchedPeople = Array.from(peopleMap.values()).slice(0, 3);

    const matchedTasks = tasks
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 3);

    return { matchedProjects, matchedPeople, matchedTasks };
  }, [searchQuery, projects, tasks]);

  const hasAnyResults =
    searchResults.matchedProjects.length > 0 ||
    searchResults.matchedPeople.length > 0 ||
    searchResults.matchedTasks.length > 0;

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-[var(--border)] px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/10 lg:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Input with Auto-Suggestions */}
          <div className="relative w-64 sm:w-80 md:w-96" ref={searchContainerRef}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks, projects, people..."
              value={searchQuery}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              className="w-full rounded-full py-1.5 pl-10 pr-9 text-xs sm:text-sm glass-input placeholder:text-[var(--muted)]/70 transition-all focus:ring-1 focus:ring-[var(--primary)]"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                ✕
              </button>
            )}

            {/* Smart Search Suggestions Dropdown */}
            {showSearchDropdown && searchQuery.trim().length > 0 && (
              <div
                className="absolute left-0 right-0 mt-2 rounded-2xl glass-panel p-3 shadow-2xl border border-[var(--border)] z-50 flex flex-col gap-2.5 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                {!hasAnyResults ? (
                  <div className="py-4 text-center text-xs text-[var(--muted)]">
                    No matching projects, tasks, or team members found.
                  </div>
                ) : (
                  <>
                    {/* Projects Section */}
                    {searchResults.matchedProjects.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider px-2">
                          Projects
                        </span>
                        {searchResults.matchedProjects.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedProjectId(p.id);
                              setShowSearchDropdown(false);
                              const section = document.getElementById('team-tasks-section');
                              if (section) section.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: p.color || 'var(--primary)' }}
                              />
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--primary)]">
                                  {p.name}
                                </span>
                                <span className="text-[10px] text-[var(--muted)]">
                                  Lead: {p.manager.name} • {p.progress}% done
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] text-[var(--primary)] font-medium">
                              Focus tasks →
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* People Section */}
                    {searchResults.matchedPeople.length > 0 && (
                      <div className="flex flex-col gap-1 pt-1 border-t border-[var(--border)]">
                        <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider px-2">
                          People Involved
                        </span>
                        {searchResults.matchedPeople.map((person) => (
                          <button
                            key={person.id}
                            type="button"
                            onClick={() => {
                              setShowSearchDropdown(false);
                              const section = document.getElementById('team-tasks-section');
                              if (section) section.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={person.avatarUrl}
                                alt={person.name}
                                className="w-5 h-5 rounded-full object-cover ring-1 ring-[var(--border)]"
                              />
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--primary)]">
                                  {person.name}
                                </span>
                                <span className="text-[10px] text-[var(--muted)]">
                                  {person.role || 'Team Member'}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] text-[var(--primary)] font-medium">
                              Filter tasks →
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Tasks Section */}
                    {searchResults.matchedTasks.length > 0 && (
                      <div className="flex flex-col gap-1 pt-1 border-t border-[var(--border)]">
                        <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider px-2">
                          Tasks
                        </span>
                        {searchResults.matchedTasks.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setSelectedProjectId(t.projectId);
                              setShowSearchDropdown(false);
                              const section = document.getElementById('team-tasks-section');
                              if (section) section.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <CheckSquare2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                              <span className="text-xs text-[var(--text)] group-hover:text-[var(--primary)] line-clamp-1">
                                {t.title}
                              </span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--primary-tint)] text-[var(--primary)] shrink-0">
                              {t.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Help Button with Dropdown */}
          <div className="relative" ref={helpRef}>
            <button
              onClick={() => setShowHelpDropdown(!showHelpDropdown)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                showHelpDropdown
                  ? 'bg-[var(--primary-tint)] text-[var(--primary)] border-[var(--primary)]/40 shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/10 border-transparent hover:border-[var(--border)]'
              }`}
              aria-label="Help & Guide"
              title="Help & Tour: Guided walkthrough, keyboard shortcuts, and app assistance"
            >
              <HelpCircle className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-xs font-semibold hidden md:inline">Help</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Help Dropdown Popover */}
            {showHelpDropdown && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel p-2 shadow-2xl border border-[var(--border)] z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text)]">Help & Learning Center</span>
                  <span className="text-[10px] text-[var(--primary)] font-semibold uppercase tracking-wider">Guides</span>
                </div>

                {/* Option 1: Help to use the app (General Guided Tour) */}
                <button
                  type="button"
                  onClick={() => {
                    setShowHelpDropdown(false);
                    setIsGuidedTourOpen(true);
                  }}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--primary-tint)] text-left group transition-all cursor-pointer"
                  title="Launch workspace overview tour"
                >
                  <div className="p-2 rounded-xl bg-[var(--primary-tint)] text-[var(--primary)] group-hover:scale-105 transition-transform shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--primary)]">
                      Help to use the app
                    </span>
                    <span className="text-[11px] text-[var(--muted)] leading-tight mt-0.5">
                      Overview guided tour with step-by-step walkthrough of the workspace
                    </span>
                  </div>
                </button>

                {/* Option 2: How to create projects and tasks (Product Tour) */}
                <button
                  type="button"
                  onClick={() => {
                    setShowHelpDropdown(false);
                    setIsProjectTaskTourOpen(true);
                  }}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--primary-tint)] text-left group transition-all cursor-pointer"
                  title="Launch project and task creation product tour"
                >
                  <div className="p-2 rounded-xl bg-[var(--primary-tint)] text-[var(--primary)] group-hover:scale-105 transition-transform shrink-0">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--primary)]">
                      How to create projects & tasks
                    </span>
                    <span className="text-[11px] text-[var(--muted)] leading-tight mt-0.5">
                      Product tour: Learn how to create initiatives, manage deliverables, and track velocity
                    </span>
                  </div>
                </button>

                {/* Option 3: Keyboard Shortcuts */}
                <button
                  type="button"
                  onClick={() => {
                    setShowHelpDropdown(false);
                    useAppStore.getState().addToast({
                      message: 'Keyboard: [Esc] Close Modals • [Tab] Navigate Inputs • [← / →] Tour Navigation',
                      type: 'info',
                      duration: 6000,
                    });
                  }}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-left group transition-colors cursor-pointer"
                  title="View available keyboard hotkeys"
                >
                  <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-[var(--muted)] shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[var(--text)]">
                      Keyboard Shortcuts
                    </span>
                    <span className="text-[11px] text-[var(--muted)] leading-tight mt-0.5">
                      Hotkeys for rapid navigation and controls
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Quick Settings Icon */}
          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/10 border border-transparent hover:border-[var(--border)] transition-all cursor-pointer"
            aria-label="Open Settings"
            title="Workspace Settings: Manage theme, active persona, and storage reset"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Theme Toggle Switch */}
          <ThemeToggle variant="icon" />

          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/10 border border-transparent hover:border-[var(--border)] transition-all cursor-pointer"
              aria-label="Notifications"
              title={
                overdueTasks.length > 0
                  ? `${overdueTasks.length} overdue deliverables require attention`
                  : 'Notifications: All deliverables up to date'
              }
            >
              <Bell className="w-4 h-4" />
              {overdueTasks.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel p-4 shadow-2xl border border-[var(--border)] z-50 animate-in fade-in slide-in-from-top-2"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                    Notifications
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary-tint)] text-[var(--primary)] font-medium">
                    {overdueTasks.length} Alerts
                  </span>
                </div>

                <div className="py-2 flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {overdueTasks.length > 0 ? (
                    overdueTasks.slice(0, 4).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-2.5 p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveTab('tasks');
                          setShowNotifications(false);
                        }}
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-medium text-[var(--text)] line-clamp-1">
                            {task.title}
                          </span>
                          <span className="text-[10px] text-rose-400">
                            Overdue since {task.deadline}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-[var(--muted)]">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
                      <span className="text-xs">All clear! No overdue tasks.</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[var(--border)] text-center">
                  <button
                    onClick={() => {
                      setActiveTab('tasks');
                      setShowNotifications(false);
                    }}
                    className="text-xs text-[var(--primary)] hover:underline font-medium"
                  >
                    View all task alerts →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div
            className="flex items-center gap-2 pl-2 border-l border-[var(--border)] cursor-pointer"
            onClick={() => setActiveTab('settings')}
            title={`Active session: ${currentManager.name} (${currentManager.role || 'Project Lead'}). Click to switch personas in Settings`}
          >
            <div className="relative group">
              <img
                src={currentManager.avatarUrl}
                alt={currentManager.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[var(--primary)]/50 transition-all hover:ring-[var(--primary)]"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--surface)]" />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-[var(--text)] leading-none">
                {currentManager.name}
              </span>
              <span className="text-[10px] text-[var(--muted)]">
                {currentManager.role || 'Project Lead'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
