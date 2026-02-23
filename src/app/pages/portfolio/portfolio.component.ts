import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor, NgIf } from "@angular/common"; 
import { AuthService } from '../../services/auth.service';
import { IsLoggedService } from '../../services/is-logged.service';
import { ProjectsService, Project } from '../../services/projects.service';
import { ProjectService } from '../../services/project.service';
import { PortfolioService } from '../../services/portfolio.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit, OnDestroy {

  user: any;
  projects: Project[] = [];
  private subscription: Subscription | null = null;
  loading = true;

  constructor(
    private auth: AuthService,
    private router: Router,
    private isLoggedService: IsLoggedService,
    private projectsService: ProjectsService,
    private projectService: ProjectService,
    private portfolioService: PortfolioService
  ) { }

  loadProjects(employeeId: number) {
  this.projectService.getProjects(employeeId).subscribe({
    next: (projects: any[]) => {
      const normalized = projects.map(p => ({
        id: p.id,
        title: p.title || p.projectName || '',
        tech: p.tech || p.techStack || '',
        description: p.description || '',
        image: p.image || ''
      }));

      this.projectsService.setProjects(normalized);
      console.log('Portfolio projects loaded:', normalized);
    },
    error: (err) => console.error('Project load failed', err)
  });
}

loadPortfolio(employeeId: number) {
  console.log("Calling portfolio API with:", employeeId);

  this.portfolioService.getPortfolio(employeeId).subscribe({
    next: (res: any) => {
      console.log("BACKEND RESPONSE:", res);

      this.portfolio = Array.isArray(res) ? res[0] : res;
      this.loading = false;
    },
    error: (err) => {
      console.log("PORTFOLIO ERROR:", err);
      this.loading = false;
    }
  });
}


  portfolio: any;

ngOnInit() {
  document.body.classList.add('admin-bg');

  // check login status
  this.isLoggedService.checkLoggedInStatus();

  if (!this.isLoggedService.isLoggedIn) {
    this.router.navigate(['/login']);
    return;
  }

  // get backend logged user
  const backendUser = this.auth.getLoggedInUser();
this.user = backendUser;

  if (!backendUser || !backendUser.employeeId) {
    this.router.navigate(['/login']);
    return;
  }

  const employeeId = backendUser.employeeId;

  // load data
  this.loadPortfolio(employeeId);
  this.loadProjects(employeeId);

  // subscribe projects
  this.subscription = this.projectsService.projects$.subscribe(projects => {
    this.projects = projects;
  });
}

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
     
    document.body.classList.remove('admin-bg');
  
  }

  logout() {
    this.auth.logout();
    this.isLoggedService.logout();
    this.router.navigate(['/login']);
  }

  scrollToProject() {
    const projectSection = document.getElementById('project');
    if (projectSection) {
      projectSection.scrollIntoView({ behavior: 'smooth' });
    }
  }


}