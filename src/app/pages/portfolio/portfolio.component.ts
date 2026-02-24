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
  portfolio: any;
  projects: Project[] = [];
  loading = true;

  private subscription: Subscription | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private isLoggedService: IsLoggedService,
    private projectsService: ProjectsService,
    private projectService: ProjectService,
    private portfolioService: PortfolioService
  ) {}

  /* ---------------- LOAD PROJECTS ---------------- */

  loadProjects(employeeId: number) {
    this.projectService.getProjects(employeeId).subscribe({
      next: (projects: any[]) => {

        const normalized: Project[] = projects.map((p: any) => ({
          id: p.id,
          title: p.title || p.projectName || '',
          tech: p.tech || p.techStack || '',
          description: p.description || '',
          image: p.image
  ? (p.image.startsWith('data:image')
      ? p.image
      : 'data:image/png;base64,' + p.image)
  : ''
        }));

        this.projectsService.setProjects(normalized);
        console.log('Portfolio projects loaded:', normalized);
      },
      error: (err) => {
        console.error('Project load failed', err);
      }
    });
  }

  /* ---------------- LOAD PORTFOLIO ---------------- */

  loadPortfolio(employeeId: number) {
    console.log('Calling portfolio API with:', employeeId);

    this.portfolioService.getPortfolio(employeeId).subscribe({
      next: (res: any) => {
        console.log('BACKEND RESPONSE:', res);

        this.portfolio = Array.isArray(res) ? res[0] : res;
        this.loading = false;
      },
      error: (err) => {
        console.error('PORTFOLIO ERROR:', err);
        this.loading = false;
      }
    });
  }

  /* ---------------- INIT ---------------- */

  ngOnInit() {

    document.body.classList.add('admin-bg');

    this.isLoggedService.checkLoggedInStatus();

    if (!this.isLoggedService.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const backendUser = this.auth.getLoggedInUser();

    if (!backendUser?.employeeId) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = backendUser;
    const employeeId = Number(backendUser.employeeId);

    // ⭐ subscribe FIRST (best practice)
    this.subscription = this.projectsService.projects$.subscribe(p => {
      this.projects = p;
    });

    // load backend data
    this.loadPortfolio(employeeId);
    this.loadProjects(employeeId);
  }

  /* ---------------- DESTROY ---------------- */

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    document.body.classList.remove('admin-bg');
  }

  /* ---------------- ACTIONS ---------------- */

  logout() {
    this.auth.logout();
    this.isLoggedService.logout();
    this.router.navigate(['/login']);
  }

  scrollToProject() {
    const projectSection = document.getElementById('project');
    projectSection?.scrollIntoView({ behavior: 'smooth' });
  }
}