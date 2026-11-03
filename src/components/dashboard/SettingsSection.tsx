'use client';

import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useThemeStore } from '../../store/useThemeStore';
import { useAppStore } from '../../store/useAppStore';
import { INITIAL_MANAGERS } from '../../data/initialData';
import { Sun, Moon, RotateCcw, ShieldCheck, Database, UserCheck, Check, Compass, FolderPlus } from 'lucide-react';

export const SettingsSection: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const currentManager = useAppStore((state) => state.currentManager);
  const setCurrentManager = useAppStore((state) => state.setCurrentManager);
  const resetToSeedData = useAppStore((state) => state.resetToSeedData);
  const setIsGuidedTourOpen = useAppStore((state) => state.setIsGuidedTourOpen);
  const setIsProjectTaskTourOpen = useAppStore((state) => state.setIsProjectTaskTourOpen);
  const projects = useAppStore((state) => state.projects);
  const tasks = useAppStore((state) => state.tasks);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  return (
    <section className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-[var(--text)]">
          Workspace Settings & Preferences
        </h2>
        <p className="text-xs text-[var(--muted)]">
          Manage your visual appearance, active session manager, and cached state.
        </p>
      </div>

      {/* 1. Theme Configuration with Live Visual Previews */}
      <GlassCard className="p-6 border border-[var(--border)] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Appearance & Theme
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Select between cyber-space dark glass and clean frosted light canvas.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[var(--primary-tint)] text-[var(--primary)] uppercase font-semibold">
            Active: {theme}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Dark Mode Card */}
          <div
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 relative overflow-hidden ${
              theme === 'dark'
                ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/40 bg-[#1C1C1F] shadow-lg'
                : 'border-[var(--border)] bg-[#1C1C1F] opacity-70 hover:opacity-100'
            }`}
          >
            {theme === 'dark' && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs">
                <Check className="w-3 h-3" />
              </span>
            )}

            <div className="flex items-center gap-2 text-white">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold">Cyber Dark Space</span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Deep cyber-space canvas with solid surface panels (`#1C1C1F`), crisp borders, and purple glowing accents.
            </p>

            <div className="h-10 rounded-xl bg-black/40 border border-white/10 flex items-center px-3 gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-[11px] text-zinc-300 font-mono">var(--primary): #7F77DD</span>
            </div>
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 relative overflow-hidden ${
              theme === 'light'
                ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/40 bg-white shadow-lg'
                : 'border-[var(--border)] bg-white opacity-70 hover:opacity-100'
            }`}
          >
            {theme === 'light' && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs">
                <Check className="w-3 h-3" />
              </span>
            )}

            <div className="flex items-center gap-2 text-zinc-900">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold">Clean Light Canvas</span>
            </div>

            <p className="text-xs text-zinc-700 leading-relaxed">
              Clean neutral canvas (`#F8F8F6`), solid white panels (`#FFFFFF`), subtle borders (`#E5E4DE`), and refined contrast.
            </p>

            <div className="h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center px-3 gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span className="text-[11px] text-zinc-700 font-mono">var(--primary): #534AB7</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 2. Manager Profile Session Switcher */}
      <GlassCard className="p-6 border border-[var(--border)] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Active Session Manager
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Switch team roles to test avatar displays and assignment workflows.
            </p>
          </div>
          <UserCheck className="w-4 h-4 text-[var(--primary)]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {INITIAL_MANAGERS.map((mgr) => {
            const isSelected = currentManager.id === mgr.id;
            return (
              <div
                key={mgr.id}
                onClick={() => setCurrentManager(mgr)}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[var(--primary)] bg-[var(--primary-tint)]/30 ring-1 ring-[var(--primary)]'
                    : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <img
                  src={mgr.avatarUrl}
                  alt={mgr.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[var(--border)]"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-[var(--text)]">
                    {mgr.name}
                  </span>
                  <span className="text-[10px] text-[var(--muted)]">
                    {mgr.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* 3. State & Storage Management */}
      <GlassCard className="p-6 border border-[var(--border)] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Workspace Persistence & Reset
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              All projects, tasks, and customizations are stored in browser localStorage.
            </p>
          </div>
          <Database className="w-4 h-4 text-[var(--muted)]" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-6 text-xs text-[var(--muted)] font-mono">
            <div>
              <span className="text-[var(--text)] font-bold">{projects.length}</span> Projects Stored
            </div>
            <div>
              <span className="text-[var(--text)] font-bold">{tasks.length}</span> Tasks Stored
            </div>
            <div className="flex items-center gap-1 text-emerald-500 font-sans">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Offline Ready</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => setIsResetConfirmOpen(true)}
          >
            Reset to Seed Data
          </Button>
        </div>
      </GlassCard>

      {/* 4. Interactive Guided Tour & Onboarding */}
      <GlassCard className="p-6 border border-[var(--border)] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Guided Tour & Workspace Walkthrough
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Need assistance or onboarding? Replay the guided tour to learn key features and tips.
            </p>
          </div>
          <Compass className="w-4 h-4 text-[var(--primary)]" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <p className="text-xs text-[var(--muted)] max-w-sm leading-relaxed">
            Walk step-by-step through project management, sprint velocity tracking, task quick-toggles, and team member search.
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Compass className="w-3.5 h-3.5" />}
              title="Launch full workspace overview tour"
              onClick={() => setIsGuidedTourOpen(true)}
            >
              Workspace Tour
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<FolderPlus className="w-3.5 h-3.5" />}
              title="Launch project and task creation product tour"
              onClick={() => setIsProjectTaskTourOpen(true)}
            >
              Projects & Tasks Tour
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Reset Workspace Data?"
        message="This will restore all projects, tasks, and completion metrics back to the original seed data matching the UI mockup."
        confirmText="Confirm Reset"
        isDestructive={false}
        onConfirm={() => {
          resetToSeedData();
          setIsResetConfirmOpen(false);
        }}
      />
    </section>
  );
};

