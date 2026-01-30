import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Project {
  title: string;
  tech: string;
  image: string;
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$: Observable<Project[]> = this.projectsSubject.asObservable();
  private STORAGE_KEY = 'PORTFOLIO_PROJECTS';

  constructor() {
    this.loadProjects();
  }

  private loadProjects() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const projects = JSON.parse(stored);
        this.projectsSubject.next(projects);
      } catch (e) {
        console.error('Error loading projects from localStorage', e);
        this.initializeDefaultProjects();
      }
    } else {
      this.initializeDefaultProjects();
    }
  }

  private initializeDefaultProjects() {
    const defaultProjects: Project[] = [
      { id: '1', title: 'Resume Analyzer', tech: 'HTML • CSS • JS', image: 'assets/img10.jpg' },
      { id: '2', title: 'Daily Expense Tracker', tech: 'Angular • TypeScript', image: 'assets/img9.jpg' },
      { id: '3', title: 'Portfolio Website', tech: 'Angular • Tailwind', image: 'assets/img12.jpg' }
    ];
    this.projectsSubject.next(defaultProjects);
    this.saveProjects(defaultProjects);
  }

  private saveProjects(projects: Project[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    this.projectsSubject.next(projects);
  }

  getProjects(): Project[] {
    return this.projectsSubject.value;
  }

  addProject(title: string, tech: string, image: string): void {
    const projects = this.getProjects();
    const newProject: Project = {
      id: Date.now().toString(),
      title,
      tech,
      image
    };
    projects.push(newProject);
    this.saveProjects(projects);
  }

  updateProject(id: string, title: string, tech: string, image: string): void {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { id, title, tech, image };
      this.saveProjects(projects);
    }
  }

  deleteProject(id: string): void {
    const projects = this.getProjects().filter(p => p.id !== id);
    this.saveProjects(projects);
  }

  clearProjects(): void {
    this.projectsSubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
