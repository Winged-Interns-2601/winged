import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
  private API_URL = 'http://localhost:3000/api/projects'; // Change to your API URL

  constructor(private http: HttpClient) {
    this.loadProjects();
  }

  private loadProjects() {
    // Try to fetch from API first, fallback to localStorage
    this.http.get<Project[]>(this.API_URL).pipe(
      tap(projects => {
        this.projectsSubject.next(projects);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
      }),
      catchError(error => {
        console.warn('API not available, loading from localStorage', error);
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
        return of([]);
      })
    ).subscribe();
  }

  private initializeDefaultProjects() {
    const defaultProjects: Project[] = [
      { id: '1', title: 'Resume Analyzer', tech: 'HTML • CSS • JS', image: 'assets/img10.jpg' },
      { id: '2', title: 'Daily Expense Tracker', tech: 'Angular • TypeScript', image: 'assets/img9.jpg' },
      { id: '3', title: 'Portfolio Website', tech: 'Angular • Tailwind', image: 'assets/img12.jpg' }
    ];
    this.projectsSubject.next(defaultProjects);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultProjects));
  }

  getProjects(): Project[] {
    return this.projectsSubject.value;
  }

  addProject(title: string, tech: string, image: string): void {
    this.http.post<Project>(this.API_URL, { title, tech, image }).pipe(
      tap(newProject => {
        const projects = this.getProjects();
        projects.push(newProject);
        this.projectsSubject.next(projects);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
      }),
      catchError(error => {
        console.error('Error adding project', error);
        // Fallback: save to localStorage
        const projects = this.getProjects();
        const tempProject: Project = {
          id: Date.now().toString(),
          title,
          tech,
          image
        };
        projects.push(tempProject);
        this.projectsSubject.next(projects);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
        return of(null);
      })
    ).subscribe();
  }

  updateProject(id: string, title: string, tech: string, image: string): void {
    this.http.put<Project>(`${this.API_URL}/${id}`, { title, tech, image }).pipe(
      tap(updatedProject => {
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === id);
        if (index !== -1) {
          projects[index] = updatedProject;
          this.projectsSubject.next(projects);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
        }
      }),
      catchError(error => {
        console.error('Error updating project', error);
        // Fallback: update in localStorage
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === id);
        if (index !== -1) {
          projects[index] = { id, title, tech, image };
          this.projectsSubject.next(projects);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
        }
        return of(null);
      })
    ).subscribe();
  }

  deleteProject(id: string): void {
    this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        const projects = this.getProjects().filter(p => p.id !== id);
        this.projectsSubject.next(projects);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
      }),
      catchError(error => {
        console.error('Error deleting project', error);
        // Fallback: delete from localStorage
        const projects = this.getProjects().filter(p => p.id !== id);
        this.projectsSubject.next(projects);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
        return of(null);
      })
    ).subscribe();
  }

  clearProjects(): void {
    this.projectsSubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
