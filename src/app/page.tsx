'use client';

import React, { useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { StatsCards } from '../components/dashboard/StatsCards';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { ProjectList } from '../components/dashboard/ProjectList';
import { TaskTable } from '../components/dashboard/TaskTable';
import { SettingsSection } from '../components/dashboard/SettingsSection';
import { ProjectFormModal } from '../components/dashboard/ProjectFormModal';
import { GuidedTourModal } from '../components/dashboard/GuidedTourModal';
import { ProjectTaskTourModal } from '../components/dashboard/ProjectTaskTourModal';
import { ToastContainer } from '../components/ui/ToastContainer';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../store/useAppStore';
import { Plus } from 'lucide-react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHeroCreateOpen, setIsHeroCreateOpen] = useState(false);

  const activeTab = useAppStore((state) => state.activeTab);
  const addProject = useAppStore((state) => state.addProject);

  return (
    <div className="relative min-h-screen flex w-full">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Main Sidebar */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Workspace Area (offset by sidebar on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Sticky Header */}
        <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Dynamic Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-8 max-w-7xl w-full mx-auto z-10">
          {activeTab === 'dashboard' && (
            <>
              {/* Hero / Welcome Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
                    Good morning, team!
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--muted)]">
                    Welcome to a project management dashboard!
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setIsHeroCreateOpen(true)}
                    className="shadow-lg shadow-indigo-500/20"
                  >
                    New Project
                  </Button>
                </div>
              </div>

              {/* Overview Section */}
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-bold tracking-tight text-[var(--text)]">
                  Overview
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left: 3 Stats Cards */}
                  <div className="lg:col-span-7">
                    <StatsCards />
                  </div>

                  {/* Right: Team Activity Chart */}
                  <div className="lg:col-span-5">
                    <ActivityChart />
                  </div>
                </div>
              </div>

              {/* Project Portfolio Section */}
              <ProjectList />

              {/* Team Tasks Section */}
              <TaskTable />
            </>
          )}

          {activeTab === 'projects' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
                    Project Portfolio
                  </h1>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Manage active enterprise initiatives, timelines, and milestones.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsHeroCreateOpen(true)}
                >
                  New Project
                </Button>
              </div>
              <ProjectList />
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
                  Task Management
                </h1>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Track individual sprint deliverables, assignment queues, and deadlines.
                </p>
              </div>
              <TaskTable />
            </div>
          )}

          {activeTab === 'settings' && <SettingsSection />}
        </main>
      </div>

      {/* Hero New Project Modal */}
      <ProjectFormModal
        isOpen={isHeroCreateOpen}
        onClose={() => setIsHeroCreateOpen(false)}
        onSubmit={(data) => addProject(data)}
      />

      {/* Interactive Guided Tour Walkthrough */}
      <GuidedTourModal />

      {/* Interactive Project & Task Creation Product Tour */}
      <ProjectTaskTourModal
        onOpenProjectCreate={() => setIsHeroCreateOpen(true)}
      />
    </div>
  );
}
