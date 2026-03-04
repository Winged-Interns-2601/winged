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
  summary?: string;
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

addProject(employeeId:number, title: string, tech?: string, file?: File, summary?: string) {

  console.log('🔥 ProjectsService.addProject() called with:');
  console.log('  employeeId:', employeeId);
  console.log('  title:', title);
  console.log('  tech:', tech);
  console.log('  file:', file ? file.name : 'no file');
  console.log('  summary:', summary);

  const formData = new FormData();

  formData.append("projectName", title);
  formData.append("description", summary || "Project description");
  formData.append("techStack", tech || "");
  formData.append("summary", summary || "");

  if (file) {
    formData.append("image", file);
  }

  console.log('📤 FormData being sent:');
  formData.forEach((value, key) => {
    console.log(`  ${key}:`, value);
  });

  const req$ = this.projectApi.addProject(employeeId, formData).pipe(
    tap((created:any) => {

      const project: Project = {
        id: created?.id,
        title: created?.projectName,
        tech: created?.techStack,
        description: created?.description,
        summary: created?.summary,
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

updateProject(id: number, title: string, tech: string, image?: string, summary?: string | undefined) {

  const numericId = Number(id);
  if (!isFinite(numericId)) return;

  console.log('🔧 ProjectsService.updateProject called with:', { id, title, tech, image, summary });

  const payload: any = {
    projectName: title,
    techStack: tech || '',
    description: summary || "Updated project", // ✅ Use summary for description
    image: image || ''
  };

  console.log("📤 UPDATE PAYLOAD =>", payload);

  this.projectApi.updateProject(numericId, payload).subscribe({
    next: () => {
      console.log('✅ Backend update successful');
      
      const currentProjects = this.value;
      console.log('📋 Current projects before update:', currentProjects);
      
      const updated = currentProjects.map(p =>
        Number(p.id) === numericId
          ? { ...p, title, tech, image, summary, description: summary || "Updated project" }  // ✅ Add description field
          : p
      );
      
      console.log('🔄 Updated projects array:', updated);
      this.setProjects(updated);
      console.log('✅ Local state updated, UI should refresh now');
    },
    error: (err) => {
      console.error('❌ Update failed:', err);
      console.warn('Update failed', err);
    }
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
          summary: i.summary || i.role,
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
