'use client';

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { useAppStore } from '../../store/useAppStore';
import { FolderKanban, CheckCircle, AlertOctagon, Share2 } from 'lucide-react';

export const StatsCards: React.FC = () => {
  const getActiveProjectsCount = useAppStore((state) => state.getActiveProjectsCount);
  const getCompletedTasksRatio = useAppStore((state) => state.getCompletedTasksRatio);
  const getOverdueTasksCount = useAppStore((state) => state.getOverdueTasksCount);
  const tasks = useAppStore((state) => state.tasks);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  const activeProjectsCount = getActiveProjectsCount();
  const completedRatio = getCompletedTasksRatio();
  const overdueCount = getOverdueTasksCount();

  const [completedCount, totalCount] = completedRatio.split('/').map(Number);
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Active Projects Card */}
      <GlassCard
        interactive
        onClick={() => setActiveTab('projects')}
        title="Active Projects: Ongoing initiatives currently in execution. Click to view all projects."
        className="p-5 relative overflow-hidden group hover:border-cyan-500/40 border border-[var(--border)] cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-[var(--muted)] tracking-wide">
              Active Projects
            </span>
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text)]">
              {activeProjectsCount}
            </span>
          </div>

          {/* Decorative network circuit node */}
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/10">
            <Share2 className="w-4 h-4" />
          </div>
        </div>

        {/* Subtle decorative bottom glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </GlassCard>

      {/* 2. Completed Tasks Card */}
      <GlassCard
        interactive
        onClick={() => setActiveTab('tasks')}
        title="Task Velocity: Completed deliverables vs total team tasks. Click to inspect deliverables."
        className="p-5 relative overflow-hidden group hover:border-emerald-500/40 border border-[var(--border)] cursor-pointer"
      >
        <div className="flex flex-col justify-between h-full gap-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-[var(--muted)] tracking-wide">
                Completed Tasks
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-emerald-500 dark:text-[#C0DD97]">
                  {completedCount}
                </span>
                <span className="text-xl font-medium text-[var(--muted)]">
                  /{totalCount}
                </span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>

          {/* Sleek Mini Progress Bar */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-[var(--muted)]">
              <span>Velocity</span>
              <span>{completionPercent}% completed</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </GlassCard>

      {/* 3. Overdue Tasks Card */}
      <GlassCard
        interactive
        onClick={() => setActiveTab('tasks')}
        title="Overdue Tasks: Deliverables that have passed their deadline and require immediate action. Click to prioritize."
        className="p-5 relative overflow-hidden group hover:border-rose-500/40 border border-[var(--border)] cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-[var(--muted)] tracking-wide">
              Overdue Tasks
            </span>
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-rose-500 dark:text-[#F09595]">
              {overdueCount}
            </span>
          </div>

          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform shadow-lg shadow-rose-500/10">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 text-[11px] text-[var(--muted)] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          <span>Requires team attention</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </GlassCard>
    </div>
  );
};

