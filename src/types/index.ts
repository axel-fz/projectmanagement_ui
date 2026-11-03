export enum ProjectStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Manager {
  id: string;
  name: string;
  avatarUrl: string;
  role?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  manager: Manager;
  deadline: string; // ISO format: YYYY-MM-DD
  status: ProjectStatus;
  progress: number; // 0 - 100
  color: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: TaskStatus;
  deadline: string; // ISO format: YYYY-MM-DD
  projectId: string;
  assignee?: Manager;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export type ViewTab = 'dashboard' | 'projects' | 'tasks' | 'settings';

export interface ProjectFiltersState {
  searchQuery: string;
  status: 'ALL' | ProjectStatus;
  sortBy: 'deadline' | 'progress' | 'name';
}

export interface TaskFiltersState {
  searchQuery: string;
  projectId: 'ALL' | string;
  status: 'ALL' | TaskStatus;
  priority: 'ALL' | Priority;
}

