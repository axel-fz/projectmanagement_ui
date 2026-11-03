'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/Button';
import {
  FolderPlus,
  CheckSquare,
  PlusCircle,
  Layers,
  Users,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Lightbulb,
  Calendar,
  AlertTriangle,
  FolderKanban,
  CheckSquare2,
} from 'lucide-react';

interface TourStep {
  step: number;
  title: string;
  subtitle: string;
  category: string;
  icon: React.ReactNode;
  iconBg: string;
  description: string;
  features: { label: string; detail: string }[];
  proTip: string;
  actionText?: string;
  actionType?: 'create-project' | 'create-task';
}

const TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    title: 'How to Create a Project',
    subtitle: 'Initialize strategic initiatives with milestones and leads',
    category: 'Project Workflow',
    icon: <FolderPlus className="w-6 h-6 text-indigo-400" />,
    iconBg: 'bg-indigo-500/10 border-indigo-500/30',
    description:
      'Starting an initiative in NexaFlow is fast and local-first. You can launch a project from the top hero banner or from the Project Portfolio section.',
    features: [
      {
        label: '+ New Project Button',
        detail: 'Click "+ New Project" located in the header or in the Project Portfolio toolbar to open the creation modal.',
      },
      {
        label: 'Zero Page Reloads',
        detail: 'New initiatives are added directly to the portfolio grid without page reloads or network latency.',
      },
      {
        label: 'Automatic State Persistence',
        detail: 'Your new project is immediately stored in browser localStorage and ready for task assignments.',
      },
    ],
    proTip: 'You can create projects anytime from both the Dashboard overview and the dedicated Projects view.',
    actionText: 'Practice: Open Project Form',
    actionType: 'create-project',
  },
  {
    step: 2,
    title: 'Filling Required Project Details',
    subtitle: 'Scope, manager assignment, target timeline, and color identity',
    category: 'Project Configuration',
    icon: <CheckSquare className="w-6 h-6 text-cyan-400" />,
    iconBg: 'bg-cyan-500/10 border-cyan-500/30',
    description:
      'Every project in NexaFlow includes rich structured metadata for clear team accountability.',
    features: [
      {
        label: 'Name & Scope Description',
        detail: 'Enter a concise project title and summary of goals for the team.',
      },
      {
        label: 'Assigned Project Lead',
        detail: 'Select an owner (Alex, Sarah, Marcus, or Elena) who oversees delivery and milestones.',
      },
      {
        label: 'Target Deadline & Status',
        detail: 'Set the target completion date and initial lifecycle status (In Progress, Pending, or Completed).',
      },
      {
        label: 'Accent Color Badge',
        detail: 'Pick a distinct brand accent color that displays as a glowing stripe atop the project card.',
      },
    ],
    proTip: 'Required fields display helpful inline error messages if submitted while empty.',
  },
  {
    step: 3,
    title: 'How to Create a Task',
    subtitle: 'Break down milestones into actionable deliverables',
    category: 'Task Workflow',
    icon: <PlusCircle className="w-6 h-6 text-emerald-400" />,
    iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    description:
      'Tasks represent the individual sprint items that power your project velocity and completion rates.',
    features: [
      {
        label: 'New Task Button',
        detail: 'Click "New Task" in the Team Tasks toolbar to open the deliverable modal.',
      },
      {
        label: 'Parent Project Association',
        detail: 'Link the task to its parent project so completed deliverables update the project’s progress bar.',
      },
      {
        label: 'Priority Urgency Markers',
        detail: 'Classify deliverables as High, Medium, or Low priority with color-coded badges.',
      },
      {
        label: 'Team Member Assignee',
        detail: 'Assign deliverables directly to team members with profile avatars.',
      },
    ],
    proTip: 'If you have a project already selected in the filter, new tasks will default to that project.',
    actionText: 'Practice: Open Task Form',
    actionType: 'create-task',
  },
  {
    step: 4,
    title: 'Status Quick-Toggles & Automated Progress',
    subtitle: 'One-click status updates and live velocity recalculation',
    category: 'Task Lifecycle',
    icon: <Layers className="w-6 h-6 text-amber-400" />,
    iconBg: 'bg-amber-500/10 border-amber-500/30',
    description:
      'Updating task status is completely friction-free with one-click quick-toggle pills.',
    features: [
      {
        label: '3-State Quick Toggles',
        detail: 'Directly click "To Do", "In Progress", or "Done" on any table row to change its status instantly.',
      },
      {
        label: 'Automated Project Recalculation',
        detail: 'Marking a task "Done" immediately recalculates the completion percentage of its parent project.',
      },
      {
        label: 'Strike-Through Visual Feedback',
        detail: 'Completed items receive an automatic strike-through styling to make sprint scanning effortless.',
      },
      {
        label: 'Overdue Deadline Warning',
        detail: 'Tasks with past deadlines that are not marked "Done" display an alert triangle in red.',
      },
    ],
    proTip: 'You can also check the checkbox on any row to select multiple deliverables for team review.',
  },
  {
    step: 5,
    title: 'Filter Tasks by Project & People Involved',
    subtitle: 'Find all deliverables for a project and see who is working on them',
    category: 'Search & Collaboration',
    icon: <Users className="w-6 h-6 text-violet-400" />,
    iconBg: 'bg-violet-500/10 border-violet-500/30',
    description:
      'Quickly inspect who is working on each project and filter deliverables down to individual contributors.',
    features: [
      {
        label: 'Project Filter Dropdown',
        detail: 'Select any project from the dropdown to see all its tasks and the "Project Focused" banner.',
      },
      {
        label: 'People Involved Roster',
        detail: 'View the Project Lead badge alongside all team members who have deliverables assigned in this project.',
      },
      {
        label: 'Interactive Contributor Chips',
        detail: 'Click any team member chip (e.g. Alex, Elena, Marcus, Sarah) to isolate only their tasks in that project.',
      },
      {
        label: 'Project Card Deep Link',
        detail: 'Click "Tasks & Team →" on any project card to jump directly to its tasks and team roster.',
      },
    ],
    proTip: 'Use "View All Projects ✕" or "Reset all filters" to return to the full workspace view in one click.',
  },
];

interface ProjectTaskTourModalProps {
  onOpenProjectCreate?: () => void;
}

export const ProjectTaskTourModal: React.FC<ProjectTaskTourModalProps> = ({
  onOpenProjectCreate,
}) => {
  const isProjectTaskTourOpen = useAppStore(
    (state) => state.isProjectTaskTourOpen
  );
  const setIsProjectTaskTourOpen = useAppStore(
    (state) => state.setIsProjectTaskTourOpen
  );
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Keyboard navigation: Left/Right arrows and Escape
  useEffect(() => {
    if (!isProjectTaskTourOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProjectTaskTourOpen(false);
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
  }, [isProjectTaskTourOpen, currentStepIndex, setIsProjectTaskTourOpen]);

  if (!isProjectTaskTourOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const progressPercent = ((currentStepIndex + 1) / TOUR_STEPS.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      setIsProjectTaskTourOpen(false);
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

  const handleActionClick = (actionType?: 'create-project' | 'create-task') => {
    setIsProjectTaskTourOpen(false);
    if (actionType === 'create-project') {
      if (onOpenProjectCreate) {
        onOpenProjectCreate();
      }
    } else if (actionType === 'create-task') {
      setActiveTab('tasks');
      const addBtn = document.querySelector('button[icon*="Plus"], button:has(svg.lucide-plus)');
      // Focus tasks section
      const section = document.getElementById('team-tasks-section');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={() => setIsProjectTaskTourOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
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
              onClick={() => setIsProjectTaskTourOpen(false)}
              className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              Skip Tour
            </button>
            <button
              onClick={() => setIsProjectTaskTourOpen(false)}
              className="p-1.5 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close product tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full my-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--primary)] to-cyan-400 transition-all duration-300 rounded-full"
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

          {/* Optional Action Button */}
          {currentStep.actionText && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border)]">
              <span className="text-xs text-[var(--muted)]">
                Ready to try it out on your workspace?
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick(currentStep.actionType)}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                {currentStep.actionText}
              </Button>
            </div>
          )}
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
              {isLastStep ? 'Complete Tour' : 'Next Step'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

