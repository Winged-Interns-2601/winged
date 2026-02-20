import { NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import type { Project } from '../../services/projects.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit, OnDestroy {
onFileSelected($event: Event) {
throw new Error('Method not implemented.');
}

  @Input() projects: Project[] = [];
  @Input() role!: string;

  selectedProjectId: string | null = null;
  private subscription: Subscription | null = null;

  editingId: number | null = null;
  editProject: Project = {
    title: '', tech: '',
    image: undefined
  };

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.selectedProjectId = params['id'];
      }
    });

    this.subscription = this.projectsService.projects$.subscribe(projects => {
      this.projects = projects;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  /* ---------------- ADD ---------------- */

  addProject(title: string, tech: string) {
    this.projectsService.addProject(title, tech);
  }

  /* ---------------- DELETE ---------------- */

  deleteProject(id: string | number) {
    if (confirm('Delete this project?')) {
      this.projectsService.deleteProject(id);
    }
  }

  /* ---------------- EDIT ---------------- */

  startEdit(project: Project) {
    this.editingId = typeof project.id === 'number' ? project.id : null;
    this.editProject = { ...project };
  }

  cancelEdit() {
    this.editingId = null;
    this.editProject = { title: '', tech: '', image: undefined };
  }

  saveEdit() {
    if (!this.editProject.title || !this.editProject.tech) {
      alert('Please fill title and tech');
      return;
    }

    if (this.editingId !== null) {
      this.projectsService.updateProject(
        this.editingId,
        this.editProject.title,
        this.editProject.tech
      );
    } else {
      this.projectsService.addProject(
        this.editProject.title,
        this.editProject.tech
      );
    }

    this.cancelEdit();
  }
}
