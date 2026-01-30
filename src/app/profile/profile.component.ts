import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { ProjectsService, Project } from '../services/projects.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {

  projects: Project[] = [];
  private subscription: Subscription | null = null;

  constructor(
    private router: Router,
    private auth: AuthService,
    private isLoggedService: IsLoggedService,
    private projectsService: ProjectsService
  ) {}

  ngOnInit() {
    // Re-check login status from localStorage
    this.isLoggedService.checkLoggedInStatus();
    
    // Check if user is logged in
    if (!this.isLoggedService.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

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

  editingId: string | null = null;
  editProject = { title: '', tech: '', image: '' };

  deleteProject(id: string) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectsService.deleteProject(id);
    }
  }

  startEdit(project: Project) {
    this.editingId = project.id || null;
    this.editProject = { ...project };
  }

  cancelEdit() {
    this.editingId = null;
    this.editProject = { title: '', tech: '', image: '' };
  }

  saveEdit() {
    document.getElementById('project')?.scrollIntoView({ behavior: 'smooth' });
    if (!this.editProject.title || !this.editProject.tech) {
      alert('Please fill in title and tech stack');
      return;
    }


    if (this.editingId !== null && this.editingId !== undefined) {
      // Check if this is a new project (ID starts with current timestamp pattern or is temporary)
      const projects = this.projectsService.getProjects();
      const existingProject = projects.find(p => p.id === this.editingId);
      
      if (existingProject) {
        // Update existing project
        this.projectsService.updateProject(
          this.editingId,
          this.editProject.title,
          this.editProject.tech,
          this.editProject.image || existingProject.image
        );
      } else {
        // Add new project
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

  logout() {
    this.auth.logout();
    this.isLoggedService.logout();
    this.router.navigate(['/login']);
  }

  openNewProjectModal() {
    // Create a temporary new project object
    const newProject: Project = {
      id: Date.now().toString(),
      title: 'New Project',
      tech: 'Tech Stack',
      image: 'assets/default-project.jpg'
    };
    
    // Open edit dialog for new project
    this.startEdit(newProject);
    // document.getElementById('project')?.scrollIntoView({ behavior: 'smooth' });
  }


  showMenu = false;

toggleMenu() {
  this.showMenu = !this.showMenu;
}
}