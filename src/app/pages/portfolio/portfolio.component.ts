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

  projects: Project[] = [];
  private subscription: Subscription | null = null;

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
  this.portfolioService.getPortfolio(employeeId).subscribe({
    next: (res: any) => {
      const portfolio = Array.isArray(res) ? res[0] : res;
      this.portfolio = portfolio;

      console.log("Portfolio loaded from backend:", portfolio);
    },
    error: (err) => console.error("Portfolio load failed", err)
  });
}



  portfolio: any;

  ngOnInit(){
    // Re-check login status from localStorage
    this.isLoggedService.checkLoggedInStatus();
    
    // Check if user is logged in using IsLoggedService
    if (!this.isLoggedService.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const backendUser = this.auth.getLoggedInUser();
const employeeId = backendUser?.employeeId;

if (employeeId) {
  this.loadPortfolio(employeeId);   // ← add
  this.loadProjects(employeeId);    // existing
}


    
    const user = this.auth.getCurrentUser();
    console.log('Portfolio: Current user:', user);
    
    if (user) {
      // First try to get localStorage user (has skills)
      const email = this.auth.getCurrentUserEmail();
      console.log('Portfolio: Current email:', email);
      
      // Debug: Check what's in localStorage
      const allUsers = JSON.parse(localStorage.getItem('PORTFOLIO_USERS') || '{}');
      console.log('Portfolio: All users in localStorage:', allUsers);
      
      this.portfolio = email ? this.auth.getUserByEmail(email) : null;
      console.log('Portfolio: User from localStorage:', this.portfolio);
      console.log('Portfolio: User skills:', this.portfolio?.skills);
      
      // If not found by email, try by username
      if (!this.portfolio) {
        this.portfolio = this.auth.getUserByUsername(user);
        console.log('Portfolio: User from username:', this.portfolio);
        console.log('Portfolio: User skills from username:', this.portfolio?.skills);
      }
      
      if (!this.portfolio) {
        console.log('Portfolio: User not found, redirecting to login');
        this.router.navigate(['/login']);
      }
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