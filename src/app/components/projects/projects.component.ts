import { NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectsService, Project } from '../../services/projects.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit, OnDestroy {

  @Input() projects: Project[] = [];
  @Input() role!: string;
  selectedProjectId: string | null = null;
  private subscription: Subscription | null = null;
  editingId: string | null = null;
  editProject = { title: '', tech: '', image: '' };

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService
  ) {}

  ngOnInit() {
    // Get project ID from route params if available
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.selectedProjectId = params['id'];
      }
    });

    // Subscribe to projects from service
    this.subscription = this.projectsService.projects$.subscribe(projects => {
      this.projects = projects;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  addProject(title: string, tech: string, image: string) {
    this.projectsService.addProject(title, tech, image);
  }

  deleteProject(id: string | number) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectsService.deleteProject(id);
    }
  }

  startEdit(project: Project) {
    this.editingId = project.id?.toString() || null;
    this.editProject = { ...project };
  }

  cancelEdit() {
    this.editingId = null;
    this.editProject = { title: '', tech: '', image: '' };
  }

  saveEdit() {
    if (!this.editProject.title || !this.editProject.tech) {
      alert('Please fill in title and tech stack');
      return;
    }

    if (this.editingId !== null && this.editingId !== undefined) {
      const projectExists = this.projects.find(p => p.id === this.editingId);
      
      if (projectExists) {
        this.projectsService.updateProject(
          this.editingId,
          this.editProject.title,
          this.editProject.tech,
          this.editProject.image || projectExists.image
        );
      } else {
        this.projectsService.addProject(
          this.editProject.title,
          this.editProject.tech,
          this.editProject.image || 'assets/default-project.jpg'
        );
      }
      
      this.editingId = null;
      this.editProject = { title: '', tech: '', image: '' };
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editProject.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}