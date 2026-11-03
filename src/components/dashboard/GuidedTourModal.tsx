'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/Button';
import {
  Compass,
  Lightbulb,
  BarChart3,
  FolderKanban,
  CheckSquare2,
  Users,
  Palette,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Layers,
  Search,
} from 'lucide-react';

interface TourStep {
  step: number;
  title: string;
  subtitle: string;
  category: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  description: string;
  features: { label: string; detail: string }[];
  proTip: string;
  recommendedTab?: 'dashboard' | 'projects' | 'tasks' | 'settings';
}

const TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    title: 'Welcome to NexaFlow',
    subtitle: 'High-performance team management dashboard',
    category: 'Getting Started',
    icon: <Compass className="w-6 h-6 text-indigo-400" />,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10 border-indigo-500/30',
    description:
      'NexaFlow provides a streamlined command center for modern teams to plan projects, coordinate deliverables, and track velocity in real-time.',
    features: [
      {
        label: 'Navigation Sidebar',
        detail: 'Seamlessly switch between Dashboard, Project Portfolio, Team Tasks, and Settings.',
      },
      {
        label: 'Local-First Architecture',
        detail: 'All data is simulated locally in browser memory with zero latency and automatic localStorage caching.',
      },
      {
        label: 'Responsive Experience',
        detail: 'Fully adapted for mobile, tablet, and desktop with solid high-contrast light and dark styling.',
      },
    ],
    proTip: 'Use keyboard arrows (← / →) to navigate through this tour or Esc to exit anytime.',
    recommendedTab: 'dashboard',
  },
  {
    step: 2,
    title: 'Metrics & Velocity Analytics',
    subtitle: 'Stay on top of sprint health and milestones',
    category: 'Dashboard & Overview',
    icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/30',
    description:
      'The top metrics cards and activity chart give project leads and executives instant visibility into team capacity and deliverables.',
    features: [
      {
        label: 'Active Projects',
        detail: 'Instant tally of all initiatives currently in progress across your organization.',
      },
      {
        label: 'Completed Tasks Ratio',
        detail: 'Live velocity counter (e.g. 24/30) with a gradient completion progress bar.',
      },
      {
        label: 'Overdue Task Alerts',
        detail: 'High-visibility notification badges that warn the team of deadlines requiring immediate attention.',
      },
      {
        label: 'Team Activity Curve',
        detail: 'Interactive SVG spline chart visualizing weekly task output and velocity trends.',
      },
    ],
    proTip: 'Clicking any overview card will instantly navigate to and focus the corresponding section.',
    recommendedTab: 'dashboard',
  },
  {
    step: 3,
    title: 'Project Portfolio Management',
    subtitle: 'Plan, customize, and drive initiatives forward',
    category: 'Project Management',
    icon: <FolderKanban className="w-6 h-6 text-amber-400" />,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/30',
    description:
      'Manage multiple concurrent initiatives with rich metadata, visual identities, and live status progress bars.',
    features: [
      {
        label: 'New Project Creator',
        detail: 'Click "+ New Project" to launch the creation modal with manager selection, deadlines, and accent colors.',
      },
      {
        label: 'Instant Live Filters',
        detail: 'Filter cards by status (In Progress, Pending, Completed) or search by project title in real-time.',
      },
      {
        label: 'Progress Visualization',
        detail: 'Each card displays an automated progress bar reflecting completed deliverables.',
      },
      {
        label: 'Tasks & Team Deep-Link',
        detail: 'Click "Tasks & Team →" on any card to isolate that project with all team members involved.',
      },
    ],
    proTip: 'Deleting a project will automatically cascade and safely clean up all its associated tasks.',
    recommendedTab: 'projects',
  },
  {
    step: 4,
    title: 'Task Execution & Quick Toggles',
    subtitle: 'One-click deliverable tracking and status pills',
    category: 'Task Management',
    icon: <CheckSquare2 className="w-6 h-6 text-emerald-400" />,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    description:
      'Organize individual deliverables with priorities, deadlines, and quick-toggle status controls.',
    features: [
      {
        label: '3-State Quick Toggles',
        detail: 'Switch tasks between "To Do", "In Progress", and "Done" directly in the table row with zero page reloads.',
      },
      {
        label: 'Automated Progress Sync',
        detail: 'Marking a task "Done" immediately updates the progress percentage of its parent project.',
      },
      {
        label: 'Priority Badges',
        detail: 'Color-coded High, Medium, and Low priority dots keep critical sprint items top-of-mind.',
      },
      {
        label: 'Bulk Selection',
        detail: 'Use checkboxes to select multiple tasks for fast team review and verification.',
      },
    ],
    proTip: 'Completed tasks are formatted with a strike-through for effortless visual scanning.',
    recommendedTab: 'tasks',
  },
  {
    step: 5,
    title: 'Project & Team Search with People Involved',
    subtitle: 'Isolate deliverables alongside the team members responsible',
    category: 'Collaboration & Search',
    icon: <Users className="w-6 h-6 text-violet-400" />,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/30',
    description:
      'Our intelligent search engine connects tasks directly with their associated projects and all team members involved.',
    features: [
      {
        label: 'Multi-Vector Search',
        detail: 'Search by project name, task title, project lead, or assignee in either the task table or top navbar.',
      },
      {
        label: 'Project Team Roster',
        detail: 'Selecting a project displays the Project Lead and all Contributors with their task distribution.',
      },
      {
        label: 'Interactive Person Chips',
        detail: 'Click any team member chip (e.g. Alex, Elena, Marcus, Sarah) to filter down to only their tasks.',
      },
      {
        label: 'Navbar Global Suggestions',
        detail: 'Typing in the top search bar displays grouped instant suggestions for projects, people, and tasks.',
      },
    ],
    proTip: 'Click "View All Projects ✕" or "Reset all filters" to return to the full workspace view in one click.',
    recommendedTab: 'tasks',
  },
  {
    step: 6,
    title: 'Themes, Personas & Preferences',
    subtitle: 'Customize your visual workspace and sessions',
    category: 'Customization',
    icon: <Palette className="w-6 h-6 text-pink-400" />,
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/10 border-pink-500/30',
    description:
      'Tailor NexaFlow to your personal workflow preferences and visual aesthetic.',
    features: [
      {
        label: 'Dark & Light Mode',
        detail: 'Choose between Cyber Dark Space (#121214) and Clean Light Canvas (#F8F8F6) with instant preview.',
      },
      {
        label: 'Active Session Manager',
        detail: 'Switch active user personas (Alex, Sarah, Marcus, Elena) to test assignments and avatar headers.',
      },
      {
        label: 'One-Click Seed Reset',
        detail: 'Reset all projects and tasks back to initial demo seeds anytime from the Settings page.',
      },
    ],
    proTip: 'You can also toggle between dark and light mode instantly using the Sun/Moon icon in the top header.',
    recommendedTab: 'settings',
  },
];

export const GuidedTourModal: React.FC = () => {
  const isGuidedTourOpen = useAppStore((state) => state.isGuidedTourOpen);
  const setIsGuidedTourOpen = useAppStore((state) => state.setIsGuidedTourOpen);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Keyboard navigation: Left/Right arrows and Escape
  useEffect(() => {
    if (!isGuidedTourOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsGuidedTourOpen(false);
      } else if (e.key === 'ArrowRight') {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGuidedTourOpen, currentStepIndex, setIsGuidedTourOpen]);

  if (!isGuidedTourOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const progressPercent = ((currentStepIndex + 1) / TOUR_STEPS.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      setIsGuidedTourOpen(false);
      setCurrentStepIndex(0);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleJumpToTab = (tab?: 'dashboard' | 'projects' | 'tasks' | 'settings') => {
    if (tab) {
      setActiveTab(tab);
    }
    handleNext();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={() => setIsGuidedTourOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-headline"
        className="relative w-full max-w-2xl rounded-2xl glass-panel p-6 sm:p-8 shadow-2xl border border-[var(--border)] z-10 my-8 transition-all animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        {/* Top Header: Category & Step Counter */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--primary-tint)] text-[var(--primary)]">
              {currentStep.category}
            </span>
            <span className="text-xs text-[var(--muted)] font-medium">
              Step {currentStep.step} of {TOUR_STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGuidedTourOpen(false)}
              className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              Skip Tour
            </button>
            <button
              onClick={() => setIsGuidedTourOpen(false)}
              className="p-1.5 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full my-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--primary)] to-indigo-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Body */}
        <div className="flex flex-col gap-6 py-2">
          {/* Title & Icon Header */}
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${currentStep.iconBg}`}
            >
              {currentStep.icon}
            </div>

            <div className="flex flex-col">
              <h2
                id="tour-headline"
                className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]"
              >
                {currentStep.title}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          {/* Main Description */}
          <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
            {currentStep.description}
          </p>

          {/* Key Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentStep.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border)] flex flex-col gap-1 text-left"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                  <span className="text-xs font-semibold text-[var(--text)]">
                    {feat.label}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed pl-5">
                  {feat.detail}
                </p>
              </div>
            ))}
          </div>

          {/* Pro Tip Box */}
          <div className="p-3 rounded-xl bg-[var(--primary-tint)]/60 border border-[var(--primary)]/20 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-[var(--text)]">
              <strong className="text-[var(--primary)] font-semibold">Pro Tip: </strong>
              <span>{currentStep.proTip}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 mt-2 border-t border-[var(--border)]">
          {/* Step Dots Navigation */}
          <div className="flex items-center gap-2">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 h-2 bg-[var(--primary)]'
                    : 'w-2 h-2 bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40'
                }`}
                aria-label={`Jump to step ${idx + 1}`}
                title={s.title}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 justify-end">
            {!isFirstStep && (
              <Button
                variant="secondary"
                size="md"
                onClick={handlePrev}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            )}

            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              icon={
                isLastStep ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )
              }
              className="shadow-lg shadow-indigo-500/20"
            >
              {isLastStep ? 'Get Started' : 'Next Step'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

