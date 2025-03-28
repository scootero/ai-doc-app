import { Project } from '@/data/projects';

// Key for localStorage
const STORAGE_KEY = 'ai-doc-projects';

// Save projects to localStorage
export function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

// Load projects from localStorage (or return fallback if none)
export function loadProjects(fallback: Project[]): Project[] {
  if (typeof window === 'undefined') return fallback;

  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : fallback;
}
