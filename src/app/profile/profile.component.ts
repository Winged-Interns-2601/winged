import { NgFor, NgIf, DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, PortfolioUser } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { PortfolioService } from '../services/portfolio.service';
import { ProjectsService } from '../services/projects.service';
import { ProjectService } from '../services/project.service';
import type { Project } from '../services/projects.service';
import { Subscription } from 'rxjs';
import { skip, take } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink, DatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  projects: Project[] = []; // single source of truth for projects (subscribed from ProjectsService)
  private projectsSub: Subscription | null = null;
  user: PortfolioUser | null = null;
  portfolioId: number | null = null;  // Track portfolio ID for backend updates
  
  // Skill management properties
  showProjectModal = false;

  showSkillModal: boolean = false;
  newSkill: string = '';
formData: any;

  constructor(
    private router: Router,
    private auth: AuthService,
    private isLoggedService: IsLoggedService,
    private portfolioService: PortfolioService,
    private projectsService: ProjectsService,
    private projectService: ProjectService
  ) {}

  loadProjects(employeeId: number) {
  this.projectService.getProjects(employeeId).subscribe({
    next: (projects: any[]) => {
const normalized = projects.map((p: any) => ({
  id: p.id,
  title: p.title || p.projectName || '',
  tech: p.tech || p.techStack || '',
  description: p.description || '',
  image: p.image || null
}));


      this.projectsService.setProjects(normalized);
      console.log('Projects loaded from ProjectService:', normalized);
    },
    error: (err) => {
      console.error('Error loading projects:', err);
    }
  });
}


ngOnInit() {
  this.isLoggedService.checkLoggedInStatus();

  if (!this.isLoggedService.isLoggedIn) {
    this.router.navigate(['/login']);
    return;
  }

  const username = this.auth.getCurrentUser();
  const email = this.auth.getCurrentUserEmail();
  const backendUser = this.auth.getLoggedInUser();

  if (backendUser) {
    const localStorageUser = email ? this.auth.getUserByEmail(email) : null;

    this.user = {
      ...backendUser,
      address: backendUser.address?.street || '',
      city: backendUser.address?.city || '',
      state: backendUser.address?.state || '',
      country: backendUser.address?.country || '',
      pinCode: backendUser.address?.pinCode || '',
      panNO: backendUser.panNO || backendUser.panno || '',
      skills: localStorageUser?.skills || backendUser.skills || []
    };
  }

  if (!this.user) {
    this.user = username ? this.auth.getUserByUsername(username) : null;
    if (!this.user) {
      this.user = email ? this.auth.getUserByEmail(email) : null;
    }
  }

  if (this.user && !this.user.skills) {
    this.user.skills = [];
  }

  // IMPORTANT — subscribe BEFORE loading
  this.projectsSub = this.projectsService.projects$.subscribe(p => {
    this.projects = p;
  });

  // Load data after subscription
  if ((this.user as any)?.employeeId) {
    const empId = (this.user as any).employeeId;

    this.loadPortfolio(empId);
    this.loadProjects(empId);
  } else {
    this.projectsService.setProjects([]);
  }

  this.testDatabaseConnection();
}




  editingId: string | number | null = null;
  editProject: Project = {
    title: '', tech: '',
    image: undefined
  };

  deleteProject(id: string | number) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    // Use ProjectsService (single source of truth)
    this.projectsService.deleteProject(id);
    this.savePortfolioAfterChange();
  }

startEdit(project: Project) {
  // normalize numeric-string ids to numbers so saveEdit/updateProject behave correctly
  const rawId = project.id ?? null;
  const numericId = rawId !== null && !isNaN(Number(rawId)) ? Number(rawId) : rawId;
  this.editingId = numericId;
  this.editProject = { ...project };
  this.showProjectModal = true;
}


cancelEdit() {
  this.showProjectModal = false;
  this.editingId = null;
  this.editProject = { title: '', tech: '', image: undefined };
}


saveEdit() {
  if (!this.editProject.title || !this.editProject.tech) {
    alert('Please fill in title and tech stack');
    return;
  }

  const id = this.editingId !== null && this.editingId !== undefined && !isNaN(Number(this.editingId))
    ? Number(this.editingId)
    : null;

  if (id !== null) {
    // update -> existing behavior (ProjectsService updates in-memory list after backend success)
    this.projectsService.updateProject(id, this.editProject.title, this.editProject.tech);

    // wait for the ProjectsService to emit the updated list, then persist
    this.projectsService.projects$.pipe(skip(1), take(1)).subscribe(() => {
      this.savePortfolioAfterChange();
      this.cancelEdit();
    });
  } else {
    // add -> use the Observable returned by ProjectsService.addProject so we act after backend success
    const add$ = this.projectsService.addProject(this.editProject.title, this.editProject.tech);
    add$.pipe(take(1)).subscribe({
      next: () => {
        this.savePortfolioAfterChange();
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Failed to add project:', err);
        alert('Failed to add project. Please try again.');
      }
    });
  }
}






  // onFileSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       this.editProject.image = e.target.result;
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  logout() {
    this.auth.logout();
    this.isLoggedService.logout();
    this.router.navigate(['/login']);
  }

openNewProjectModal() {
  this.editingId = null;
  this.editProject = { title: '', tech: '', image: undefined };
  this.showProjectModal = true;
}



  // Persist the updated portfolio (called after project/skill changes)
  private savePortfolioAfterChange() {
    if (!this.user) {
      console.warn('No user available to save portfolio changes');
      return;
    }

    const portfolioData = {
      skills: this.user.skills || [],
      designation: this.user.designation || '',
      projects: (this.projects || []).map(p => ({
        projectName: p.title || '',
        description: p.description || '',

      }))
    };

    if (this.portfolioId) {
      this.portfolioService.updatePortfolio(this.portfolioId, portfolioData).subscribe({
        next: (res) => {
          console.log('Portfolio updated successfully:', res);
        },
        error: (err) => {
          console.error('Error updating portfolio:', err);
          // fallback: update localStorage user if available
          if (this.user?.email) {
            this.auth.updateUserSkills(this.user.email, this.user.skills || []);
          }
        }
      });
    } else {
      const employeeId = (this.user as any).employeeId || 1;
      this.portfolioService.addPortfolio(employeeId, portfolioData).subscribe({
        next: (res: any) => {
          this.portfolioId = res?.id || this.portfolioId;
          console.log('Portfolio created for employee:', res);
        },
        error: (err) => {
          console.error('Error creating portfolio:', err);
        }
      });
    }
  }

  showMenu = false;

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  // Skill management methods
  addSkill() {
    this.newSkill = '';
    this.showSkillModal = true;
  }

  saveSkill() {
    const trimmedSkill = this.newSkill.trim();
    
    if (!trimmedSkill) {
      alert('Please enter a valid skill name');
      return;
    }
    
    if (this.user) {
      if (!this.user.skills) {
        this.user.skills = [];
      }
      
      // Check if skill already exists
      if (this.user.skills.includes(trimmedSkill)) {
        alert('This skill already exists!');
        return;
      }
      
      // Check skill length (backend allows max 20 skills, each reasonable length)
      if (this.user.skills.length >= 20) {
        alert('Maximum 20 skills allowed!');
        return;
      }
      
      // Add the skill
      this.user.skills.push(trimmedSkill);
      
      // Save to backend via PortfolioService
      this.saveSkillsToBackend();
    }
  }

  removeSkill(skill: string) {
    if (this.user && this.user.skills) {
      const index = this.user.skills.indexOf(skill);
      if (index > -1) {
        // Remove the skill
        this.user.skills.splice(index, 1);
        
        // Save to backend via PortfolioService
        this.saveSkillsToBackend();
      }
    }
  }

  saveSkillsToBackend() {
    if (!this.user) {
      console.error('No user found. Cannot save skills.');
      alert('User not found. Please refresh the page and try again.');
      return;
    }

    // Prepare portfolio data for backend
    const portfolioData = {
      skills: this.user.skills || [],
      designation: this.user.designation || '',
      projects: (this.projects || []).map(p => ({
        projectName: p.title || '',
        description: p.description || '',
        tech: p.tech || ''
      }))
    };

    console.log('🔄 Attempting to save skills to backend...');
    console.log('📤 Portfolio data being sent:', JSON.stringify(portfolioData, null, 2));

    // Verify backend URL
    const backendUrl = 'http://localhost:8080/api/portfolio';
    console.log(`🌐 Backend URL: ${backendUrl}`);

    // Call backend directly
    this.actualSaveToBackend(portfolioData);
  }

  actualSaveToBackend(portfolioData: any) {
    if (this.portfolioId) {
      // Update existing portfolio
      console.log('📝 Updating existing portfolio ID:', this.portfolioId);
      this.portfolioService.updatePortfolio(this.portfolioId, portfolioData).subscribe({
        next: (response) => {
          console.log('✅ Skills saved to backend successfully!');
          console.log('📥 Backend response:', response);
          this.cancelAddSkill();
        },
        error: (error) => {
          console.error('❌ Error saving skills to backend:', error);
          console.log('📄 Full error details:', JSON.stringify(error, null, 2));
          console.log('🔄 Falling back to localStorage...');
          this.fallbackToLocalStorage();
        }
      });
    } else {
      // Create new portfolio first
      const employeeId = (this.user as any).employeeId || 1;
      console.log('➕ Creating new portfolio for employee ID:', employeeId);
      this.portfolioService.addPortfolio(employeeId, portfolioData).subscribe({
        next: (response: any) => {
          this.portfolioId = response?.id || null;
          console.log('✅ Portfolio created and skills saved to backend!');
          console.log('📥 Backend response:', response);
          console.log('🆔 New portfolio ID:', this.portfolioId);
          this.cancelAddSkill();
        },
        error: (error) => {
          console.error('❌ Error creating portfolio:', error);
          console.log('📄 Full error details:', JSON.stringify(error, null, 2));
          console.log('🔄 Falling back to localStorage...');
          this.fallbackToLocalStorage();
        }
      });
    }
  }

  fallbackToLocalStorage() {
    if (this.user && this.user.email) {
      this.auth.updateUserSkills(this.user.email, this.user.skills || []);
      console.log('💾 Skills saved to localStorage as fallback');
    }
    this.cancelAddSkill();
  }

  cancelAddSkill() {
    this.showSkillModal = false;
    this.newSkill = '';
  }

  // Single portfolio loader — DB is the source of truth for projects/skills
loadPortfolio(employeeId: number) {

  this.portfolioId = null; // reset first

  this.portfolioService.getPortfolio(employeeId).subscribe({

    next: (res: any) => {

      if (!res || (Array.isArray(res) && res.length === 0)) {
        console.log('No portfolio exists for employee:', employeeId);
        this.portfolioId = null;
        return;
      }

      const portfolio = Array.isArray(res) ? res[0] : res;

      this.portfolioId = portfolio?.id ?? null;

      const localStorageUser =
        this.user?.email ? this.auth.getUserByEmail(this.user.email) : null;

      if (this.user) {
        this.user.skills =
          (localStorageUser?.skills?.length ?? 0) > 0
            ? localStorageUser!.skills
            : (portfolio?.skills ?? []);
      }

      console.log('Portfolio loaded:', portfolio);
    },

    error: (err) => {
      console.log('No portfolio found (normal case)', employeeId);
      this.portfolioId = null;
    }
  });
}


  // Merge localStorage projects into portfolio (one-time migration)


  // Test method to verify database connection (does not re-load portfolio)
  testDatabaseConnection() {
    console.log('🔍 Testing database connection...');

    if (!this.user) {
      console.log('⚠️ No user available to fetch portfolio for.');
      return;
    }

    // Avoid duplicate portfolio API calls — use already-loaded portfolio data if present
    if (this.portfolioId || (this.projects && this.projects.length > 0)) {
      console.log('✅ Portfolio already loaded; database connection appears healthy.');
      return;
    }

    console.log('⚠️ Portfolio not loaded yet — call `loadPortfolio(employeeId)` from ngOnInit instead of re-fetching here.');
  }

  ngOnDestroy() {
    if (this.projectsSub) {
      this.projectsSub.unsubscribe();
      this.projectsSub = null;
    }
  }
}
