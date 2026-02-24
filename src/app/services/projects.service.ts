import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { ProjectService } from './project.service';
import { AuthService } from './auth.service';

export interface Project {
image?: string;
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

addProject(employeeId:number, title: string, tech?: string, file?: File) {

  const formData = new FormData();

  formData.append("projectName", title);
  formData.append("description", "Project description");
  formData.append("techStack", tech || "");

  if (file) {
    formData.append("image", file);
  }

  const req$ = this.projectApi.addProject(employeeId, formData).pipe(
    tap((created:any) => {

      const project: Project = {
        id: created?.id,
        title: created?.projectName,
        tech: created?.techStack,
        description: created?.description,
        image: created?.image
  ? (created.image.startsWith('data:image')
      ? created.image
      : 'data:image/png;base64,' + created.image)
  : ('')
      };

      this.setProjects([...this.value, project]);
    }),
    shareReplay({ bufferSize:1, refCount:true })
  );

  req$.subscribe();
  return req$;
}


  /* ---------------- UPDATE PROJECT ---------------- */

updateProject(id: number, title: string, tech: string, image?: string) {

  const numericId = Number(id);
  if (!isFinite(numericId)) return;

  const payload: any = {
    projectName: title,
    techStack: tech || '',
    description: "Updated project", // ⭐ REQUIRED FIELD
    image: image || ''
  };

  console.log("UPDATE PAYLOAD =>", payload);

  this.projectApi.updateProject(numericId, payload).subscribe({
    next: () => {
      const updated = this.value.map(p =>
        Number(p.id) === numericId
          ? { ...p, title, tech, image }
          : p
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
