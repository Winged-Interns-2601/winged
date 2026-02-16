import { NgFor, NgIf, DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, PortfolioUser } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { ProjectsService, Project } from '../services/projects.service';
import { PortfolioService } from '../services/portfolio.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink, DatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  projects: Project[] = [];
  user: PortfolioUser | null = null;
  private subscription: Subscription | null = null;
  portfolioId: number | null = null;  // Track portfolio ID for backend updates
  
  // Skill management properties
  showSkillModal: boolean = false;
  newSkill: string = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private isLoggedService: IsLoggedService,
    private projectsService: ProjectsService,
    private portfolioService: PortfolioService
  ) {}

  ngOnInit() {
    // Re-check login status from localStorage
    this.isLoggedService.checkLoggedInStatus();
    
    // Check if user is logged in
    if (!this.isLoggedService.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const username = this.auth.getCurrentUser();
    const email = this.auth.getCurrentUserEmail();
    
    console.log('Profile: Username:', username);
    console.log('Profile: Email:', email);
    
    // Debug: Check what's in localStorage
    const allUsers = JSON.parse(localStorage.getItem('PORTFOLIO_USERS') || '{}');
    console.log('Profile: All users in localStorage:', allUsers);
    
    let backendUser = this.auth.getLoggedInUser(); // Prefer backend-stored user
    console.log('Raw backendUser:', backendUser);
    
    if (backendUser) {
      // Get localStorage user to preserve skills
      const localStorageUser = email ? this.auth.getUserByEmail(email) : null;
      console.log('Profile: localStorageUser:', localStorageUser);
      console.log('Profile: localStorageUser skills:', localStorageUser?.skills);
      
      // Flatten nested address fields for template compatibility
      this.user = {
        ...backendUser,
        address: backendUser.address?.street || '',
        city: backendUser.address?.city || '',
        state: backendUser.address?.state || '',
        country: backendUser.address?.country || '',
        pinCode: backendUser.address?.pinCode || '',
        panNO: backendUser.panNO || backendUser.panno || '',
        // Preserve skills from localStorage (prioritize localStorage skills over backend)
        skills: localStorageUser?.skills || backendUser.skills || []
      };
      console.log('Profile: Merged user with skills:', this.user);
    } else {
      this.user = backendUser;
    }
    
    if (!this.user) {
      this.user = username ? this.auth.getUserByUsername(username) : null;
      console.log('Profile: User from username:', this.user);
      if (!this.user) {
        this.user = email ? this.auth.getUserByEmail(email) : null;
        console.log('Profile: User from email:', this.user);
      }
    }

    // Ensure skills array exists and is loaded from localStorage
    if (this.user && !this.user.skills) {
      this.user.skills = [];
    }

    console.log('Profile: Final user loaded:', this.user);
    console.log('Profile: Final skills:', this.user?.skills);

    // Test database connection on load
    this.testDatabaseConnection();

    this.subscription = this.projectsService.projects$.subscribe(projects => {
      this.projects = projects;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  editingId: string | number | null = null;
  editProject = { title: '', tech: '', image: '' };

  deleteProject(id: string | number) {
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
        const removedSkill = this.user.skills[index];
        
        // Remove the skill
        this.user.skills.splice(index, 1);
        
        // Save to backend via PortfolioService
        this.saveSkillsToBackend();
      }
    }
  }

  saveSkillsToBackend() {
    if (!this.user) return;

    // Prepare portfolio data for backend
    const portfolioData = {
      skills: this.user.skills,
      designation: this.user.designation || '',
      projects: this.projects || []
    };

    console.log('🔄 Attempting to save skills to backend...');
    console.log('📤 Portfolio data being sent:', JSON.stringify(portfolioData, null, 2));
    console.log('🏢 Backend API:', 'http://localhost:8080/api/portfolio');
    console.log('🌐 Checking if backend is reachable...');

    // First check if backend is reachable
    fetch('http://localhost:8080/api/portfolio')
      .then(response => {
        console.log('✅ Backend is reachable! Status:', response.status);
        this.actualSaveToBackend(portfolioData);
      })
      .catch(error => {
        console.error('❌ Backend is NOT reachable:', error);
        console.log('🔄 Falling back to localStorage...');
        this.fallbackToLocalStorage();
      });
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

  // Test method to verify database connection
  testDatabaseConnection() {
    console.log('🔍 Testing database connection...');
    
    if (this.user) {
      const employeeId = (this.user as any).employeeId || 1;
      console.log('📋 Getting portfolio for employee ID:', employeeId);
      
      this.portfolioService.getPortfolio(employeeId).subscribe({
        next: (portfolios) => {
          console.log('✅ Database connection successful!');
          console.log('📊 Current portfolios from database:', portfolios);
          if (portfolios && portfolios.length > 0) {
            console.log('🎯 Skills in database:', portfolios[0]?.skills || 'No skills found');
          } else {
            console.log('🎯 No portfolios found in database');
          }
        },
        error: (error) => {
          console.error('❌ Database connection failed:', error);
          console.log('💡 Make sure Spring Boot backend is running on http://localhost:8080');
        }
      });
    }
  }
}
