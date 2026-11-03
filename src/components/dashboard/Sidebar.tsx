'use client';

import React from 'react';
import { LayoutGrid, FolderKanban, CheckSquare2, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ViewTab } from '../../types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const getActiveProjectsCount = useAppStore((state) => state.getActiveProjectsCount);
  const getOverdueTasksCount = useAppStore((state) => state.getOverdueTasksCount);

  const navItems: { id: ViewTab; label: string; icon: React.ReactNode; badge?: string | number; tooltip: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutGrid className="w-4 h-4" />,
      tooltip: 'Dashboard Overview: velocity metrics, active initiatives, and upcoming tasks',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderKanban className="w-4 h-4" />,
      badge: getActiveProjectsCount(),
      tooltip: 'Project Portfolio: manage initiatives, target deadlines, and progress bars',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare2 className="w-4 h-4" />,
      badge: getOverdueTasksCount() > 0 ? getOverdueTasksCount() : undefined,
      tooltip: 'Team Tasks: 3-state quick-toggles, priorities, and assigned team members',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      tooltip: 'Workspace Settings: theme switcher, manager persona, and seed data reset',
    },
  ];

  const handleNavClick = (tabId: ViewTab) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 glass-panel border-r border-[var(--border)] flex flex-col justify-between p-4 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-3 px-2 py-1.5 cursor-pointer"
            title="NexaFlow - High-performance project management dashboard"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#534AB7] to-[#7F77DD] flex items-center justify-center shadow-lg shadow-indigo-500/25 font-black text-white text-sm tracking-wider select-none">
              NF
            </div>
            <span className="text-lg font-bold tracking-tight text-[var(--text)]">
              NexaFlow
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={item.tooltip}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[var(--primary)] text-white shadow-md shadow-indigo-500/20'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-[var(--muted)]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-black/5 dark:bg-white/10 text-[var(--muted)]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

