import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { ProjectService } from './project.service';
import { AuthService } from './auth.service';

export interface Project {
image: any;
  id?: string | number;
  title: string;
  tech?: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {

  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$ = this.projectsSubject.asObservable();

  constructor(private projectApi: ProjectService, private auth: AuthService) {}

  private get value(): Project[] {
    return this.projectsSubject.getValue();
  }

  setProjects(projects: Project[]) {
    this.projectsSubject.next(projects);
  }

  /* ---------------- ADD PROJECT ---------------- */

addProject(title: string, tech?: string) {
  // Backend requires a non-null `image` field; use a sensible default when none provided
  const payload = {
  projectName: title,
  description: "Project description",
  techStack: tech || ''
};


  const employeeId = this.auth.getLoggedInUser()?.employeeId;
  const req$ = this.projectApi.addProject(employeeId, payload).pipe(
    tap((created: any) => {
      const project: Project = {
        id: created?.id ?? undefined,
        title: created?.title ?? title,
        tech: created?.tech ?? tech ?? '',
        description: created?.description ?? '',
        image: undefined
      };
      // update in-memory list when backend returns
      this.setProjects([...this.value, project]);
    }),
    // share the same response for callers that also subscribe (prevents duplicate HTTP posts)
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Keep backward compatibility (trigger the request now) and also return observable
  req$.subscribe({
    next: (created: any) => console.log('ProjectsService.addProject: backend response ->', created),
    error: (err) => console.error('Add project failed', err)
  });

  return req$; // callers may subscribe to react to success/failure
}



  /* ---------------- UPDATE PROJECT ---------------- */

  updateProject(id: string | number, title: string, tech?: string) {
    const numericId = Number(id);
    if (!isFinite(numericId)) {
      console.warn('ProjectsService.updateProject: invalid id', id);
      return;
    }

    const payload: any = { title };
    if (tech !== undefined) { payload.tech = tech; payload.techStack = tech; }

    this.projectApi.updateProject(numericId, payload).subscribe({
      next: () => {
        const updated = this.value.map(p =>
          Number(p.id) === numericId ? { ...p, title, tech } : p
        );
        this.setProjects(updated);
      },
      error: (err) => console.warn('Update failed', err)
    });
  }

  /* ---------------- DELETE PROJECT ---------------- */

  deleteProject(id: string | number) {
    const numericId = Number(id);
    if (!isFinite(numericId)) {
      console.warn('ProjectsService.deleteProject: invalid id', id);
      return;
    }

    this.projectApi.deleteProject(numericId).subscribe({
      next: () => {
        this.setProjects(this.value.filter(p => Number(p.id) !== numericId));
      },
      error: (err) => console.warn('Delete failed', err)
    });
  }

  /* ---------------- LOAD FROM SERVER ---------------- */

  loadFromServerForEmployee(employeeId: number) {
    this.projectApi.getProjects(employeeId).subscribe({
      next: (items: any[]) => {
        const normalized: Project[] = (items || []).map(i => ({
          id: i.id,
          title: i.title || i.projectName,
          tech: i.tech || i.techStack,
          description: i.description,
          image: i.image || 'assets/img12.jpg'
        }));

        this.setProjects(normalized);
      },
      error: (err) => console.warn('Failed to load projects', err)
    });
  }

  clear() {
    this.setProjects([]);
  }
}
