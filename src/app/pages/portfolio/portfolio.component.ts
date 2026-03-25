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

  // Add getter for summary to handle nested data
  get portfolioSummary(): string {
    return this.user?.summary ||                           // Check user object first (from profile component)
           this.portfolio?.summary || 
           this.portfolio?.portfolio?.summary || 
           this.portfolio?.data?.summary || 
           '';
  }

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
          summary: p.summary || '',
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
        console.log('Portfolio data:', this.portfolio);
        console.log('Portfolio summary:', this.portfolio?.summary);
        console.log('Portfolio portfolio.summary:', this.portfolio?.portfolio?.summary);
        
        // Check all possible summary locations
        const possibleSummary = this.portfolio?.summary || 
                               this.portfolio?.portfolio?.summary ||
                               this.portfolio?.data?.summary ||
                               '';
        
        console.log('Final summary found:', possibleSummary);
        
        // If summary is nested, flatten it
        if (this.portfolio?.portfolio?.summary && !this.portfolio.summary) {
          this.portfolio.summary = this.portfolio.portfolio.summary;
          console.log('Flattened summary to portfolio.summary:', this.portfolio.summary);
        }
        
        console.log('Portfolio skills:', this.portfolio?.skills);
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

  const backendUser = this.auth.getLoggedInUser();

  if (!backendUser) {
    this.router.navigate(['/login']);
    return;
  }

  this.user = backendUser;

  const employeeId = Number(backendUser.employeeId);

  // ⭐ handle missing employeeId (IMPORTANT)
  if (!employeeId || isNaN(employeeId)) {
    console.warn('Invalid employeeId:', employeeId);
    return; // stop API calls safely
  }

  // subscribe FIRST
  this.subscription = this.projectsService.projects$.subscribe(p => {
    this.projects = p;
  });

  // load backend data
  this.loadPortfolio(employeeId);
  this.loadProjects(employeeId);

  console.log("Logged user:", backendUser);
console.log("EmployeeId:", backendUser?.employeeId);
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