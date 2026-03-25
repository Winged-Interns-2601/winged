import { NgFor, NgIf, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, PortfolioUser } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { PortfolioService } from '../services/portfolio.service';
import { ProjectsService } from '../services/projects.service';
import { ProjectService } from '../services/project.service';
import { EmployeeService } from '../services/employee.service';
import type { Project } from '../services/projects.service';
import { Subscription } from 'rxjs';
import { skip, take } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink, DatePipe, NgClass],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  showEmployeeModal = false;
      employeeTypeFilter: string = '';
      employees: any[] = [];        // store employees
designationFilter: string = '';
showEditModal: boolean = false;
editingEmployee: any = null;
  currentStep = 1;
  
  errorMessage = '';


      employeeForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  phone: '',
  employeeType: '',
  designation: '',

  panNo: '',
  aadharNo: '',
  joiningDate: '',
  exitDate: '',
  password: '',

  address: {
    street: '',
    city: '',
    state: '',
    country: '',
    pinCode: ''
  },

  portfolio: {
  designation: '',
  summary: '',
  skills: [] as string[],
  projects: [] as Array<{
    projectName: string;
    description: string;
    techStack: string;
    summary: string;
    startDate?: string;
    endDate?: string;
    image?: string;
  }>
}

};
  cdr: any;

openAddEmployeeModal() {
  this.showEmployeeModal = true;
}

closeModal(){
  this.showEditModal = false;
  this.editingEmployee = null;
}

  addProject() {
    const newProject = {
      projectName: '',
      description: '',
      techStack: '',
      summary: '',
      image: '',
      startDate: '',
      endDate: ''
    };
    this.employeeForm.portfolio.projects.push(newProject);
  }

    onProjectFileSelected(event: any, projectIndex: number) {
    const file = event.target.files[0];
    if (file && this.employeeForm.portfolio.projects[projectIndex]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.employeeForm.portfolio.projects[projectIndex].image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

    removeProject(index: number) {
    this.employeeForm.portfolio.projects.splice(index, 1);
  }


addEmployee() {

  if (!this.employeeForm.email || !this.employeeForm.password) {
    alert("Email & Password required");
    return;
  }

  const payload = {
    employeeId: Date.now(),
    firstName: this.employeeForm.firstName,
    middleName: this.employeeForm.middleName,
    lastName: this.employeeForm.lastName,

    employeeType: this.employeeForm.employeeType,
    designation: this.employeeForm.designation,

    email: this.employeeForm.email.toLowerCase().trim(),
    password: this.employeeForm.password,

    phone: this.employeeForm.phone,

    address: this.employeeForm.address,

    joiningDate: this.employeeForm.joiningDate,
    exitDate: this.employeeForm.exitDate || null,

    aadharNo: this.employeeForm.aadharNo,
    panNO: this.employeeForm.panNo,
    
    // ⭐ ADD PORTFOLIO DATA (VERY IMPORTANT)
    portfolio: {
      skills: this.employeeForm.portfolio.skills || [],
      projects: [], // Projects created individually after registration
      designation: this.employeeForm.designation,
      summary: this.employeeForm.portfolio.summary || '' // ⭐ ADD SUMMARY
    }
  };

  console.log("Payload:", payload);

  this.auth.registerBackend(payload).subscribe({
    next: () => {
      alert("Employee Added ✅");
      this.showEmployeeModal = false;

      // reset properly


    },
    error: (err) => {
      console.error("ERROR:", err.error);
      alert(err.error?.message || "Failed to add employee");
    }
  });
  console.log("PAN:", this.employeeForm.panNo);
  
}
  projects: Project[] = []; // single source of truth for projects (subscribed from ProjectsService)
  private projectsSub: Subscription | null = null;
  user: PortfolioUser | null = null;
  portfolioId: number | null = null;  // Track portfolio ID for backend updates
  
  // Mobile menu properties
  mobileMenuOpen: boolean = false;
  
  // Loading state to prevent actions before portfolio is loaded
  portfolioLoading: boolean = false;
  
  // Skill management properties
  showProjectModal = false;

  showSkillModal: boolean = false;
  newSkill: string = '';

  selectedFile?: File;
  editForm: any = {};


  // Summary modal properties
  showSummaryModal = false;
  newSummary = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private isLoggedService: IsLoggedService,
    private portfolioService: PortfolioService,
    private projectsService: ProjectsService,
    private projectService: ProjectService,
    private employeeService: EmployeeService
  ) {}

  // Add a getter to ensure skills are always available
  get userSkills(): string[] {
    return this.user?.skills || [];
  }

  // Add a setter that preserves skills
  setUserData(newUserData: any) {
    const currentSkills = this.user?.skills || [];
    this.user = {
      ...newUserData,
      skills: currentSkills
    };
    console.log('🛡️ Skills preserved in setUserData:', this.user?.skills);
  }

  loadProjects(employeeId: number) {
  this.projectService.getProjects(employeeId).subscribe({
    next: (projects: any[]) => {
const normalized = projects.map((p: any) => ({
  id: p.id,
  title: p.title || p.projectName || '',
  tech: p.tech || p.techStack || '',
  description: p.description || '',
  summary: p.summary || p.description || p.role || '',
 image: p.image
 ? (p.image.startsWith('data:image')
      ? p.image
      : 'data:image/png;base64,' + p.image)
 : '',
}));
console.log("API RAW:", projects);


      this.projectsService.setProjects(normalized);
      console.log('Projects loaded from ProjectService:', normalized);
    },
    error: (err) => {
      console.error('Error loading projects:', err);
    }
  });
}

    openEditModal(employee: any) {

  this.editingEmployee = employee;
  this.showEditModal = true;
    this.editForm = { ...employee };   // copy employee data


  // deep copy employee
  this.editForm = JSON.parse(JSON.stringify(employee));

}

    deletePortfolio(portfolioId?: number) {
      console.log("Deleting portfolioId:", portfolioId);
      console.log("Type of portfolioId:", typeof portfolioId);

      if (!portfolioId) {
        alert('Portfolio not found');
        return;
      }

      if (!confirm('Delete entire portfolio?')) return;

      this.portfolioService.deletePortfolio(portfolioId).subscribe({
        next: (res) => {
          console.log('Portfolio deleted successfully', res);

          // Clear portfolio reference instead of removing employee entirely
          // This prevents adding projects to deleted portfolios
          this.employees = this.employees.map(emp => 
            emp.portfolio?.id === portfolioId 
              ? { ...emp, portfolio: null } 
              : emp
          );
          
          // Force UI update to disable delete button immediately
          this.cdr.detectChanges();
          
          // Always show success message for successful deletion (2xx status)
          alert('Portfolio deleted successfully');
        },
        error: (err) => {
          console.error('Delete failed', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.error?.message);
          console.error('Full error:', err);
          
          // Check specific error codes for better user feedback
          if (err.status === 404) {
            alert('Portfolio does not exist');
          } else if (err.status === 400) {
            // Check the error message for "not found"
            const errorMessage = err.error?.message || '';
            if (errorMessage.toLowerCase().includes('not found') || 
                errorMessage.toLowerCase().includes('does not exist') ||
                errorMessage.toLowerCase().includes('no portfolio')) {
              alert('Portfolio does not exist');
            } else {
              alert('portfolio already delete ');
            }
          } else if (err.status !== 200 && err.status !== 204) {
            alert('portfolio already delete ');
          }
        }
      });
    }

ngOnInit() {

  document.body.classList.add('admin-bg');

  // ⭐ ONLY backend user
  const backendUser = this.auth.getLoggedInUser();

  this.employeeService.getAllUsers().subscribe({
  next: (res) => {
    this.employees = res;
    console.log("Employees loaded:", res);
  },
  error: (err) => console.error(err)
});

  if (!backendUser?.employeeId) {
    this.router.navigate(['/login']);
    return;
  }

  // Set initial user from localStorage
  this.user = backendUser;
  
  // ensure skills and summary exist initially
  if (this.user && !this.user.skills) {
    this.user.skills = [];
  }
  if (this.user && this.user.summary === undefined) {
    this.user.summary = '';
  }

  // subscribe first
  this.projectsSub = this.projectsService.projects$.subscribe(p => {
    console.log('🔄 ProfileComponent received projects update:', p);
    console.log('📊 Previous projects count:', this.projects.length);
    console.log('📊 New projects count:', p.length);
    this.projects = p;
    console.log('✅ UI should update with new projects');
  });

  const empId = Number(backendUser.employeeId);

  // Load portfolio first, then fetch employee data
  console.log('🔄 Starting portfolio load for employee:', empId);
  this.loadPortfolio(empId).then(() => {
    console.log('✅ Portfolio loaded, now fetching employee data');
    console.log('👤 User skills after portfolio load:', this.user?.skills);
    
    // Fetch complete employee data from backend (but don't overwrite skills from portfolio)
    console.log('Fetching employee data for ID:', backendUser.employeeId);
    this.employeeService.getByEmployeeId(backendUser.employeeId).subscribe({
      next: (completeEmployee: any) => {
        console.log('Complete employee data received:', completeEmployee);
        
        // Preserve existing skills and summary from portfolio, update other fields
        const existingSkills = this.user?.skills || [];
        const existingSummary = this.user?.summary || '';
        console.log('🎯 Preserving skills:', existingSkills);
        console.log('📝 Preserving summary:', existingSummary);
        
        // Merge employee data but NEVER overwrite skills and summary
        this.user = {
          ...completeEmployee,
          skills: existingSkills, // Always keep portfolio skills
          summary: existingSummary   // ⭐ ADD THIS
        };
        
        console.log('👤 Final user after employee data merge:', this.user);
      },
      error: (err) => {
        console.error('Failed to fetch complete employee data:', err);
        // Fallback to localStorage data
        console.log('Falling back to localStorage data:', backendUser);
        
        // Ensure skills and summary are preserved even in error case
        const existingSkills = this.user?.skills || [];
        const existingSummary = this.user?.summary || '';
        this.user = {
          ...backendUser,
          skills: existingSkills,
          summary: existingSummary
        };
        
        if (this.user && !this.user.skills) {
          this.user.skills = [];
        }
      }
    });
  });

  this.loadProjects(empId);
}




  editingId: string | number | null = null;
  editProject: Project = {
    title: '', tech: '', summary: '',
    image: ''
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
  this.editProject = { title: '', tech: '', summary: '', image: '' };
}

saveEmployeeUpdate() {

  if (!this.editingEmployee) return;

  const id = this.editingEmployee.id;  // use DB id
  
  // DEBUG: Log all data before sending
  console.log('=== UPDATE DEBUG START ===');
  console.log('Editing Employee ID:', id);
  console.log('Edit Form Data:', this.editForm);
  
  const token = localStorage.getItem('TOKEN');
  console.log('Token from localStorage:', token ? 'EXISTS' : 'MISSING');
  console.log('Token value (first 20 chars):', token ? token.substring(0, 20) + '...' : 'null');

  const updatedEmployee = {
    firstName: this.editForm.firstName,
    lastName: this.editForm.lastName,
    email: this.editForm.email,
    phone: this.editForm.phone
    
  };
  
  console.log('Updated Employee Object:', updatedEmployee);
  console.log('=== UPDATE DEBUG END ===');

  this.employeeService.updateEmployee(id, updatedEmployee)
    .subscribe({
      next: (response) => {
        console.log(' Update SUCCESS:', response);

        const index = this.employees.findIndex(e => e.id === id);

        if (index !== -1) {
          this.employees[index] = { ...this.employees[index], ...updatedEmployee };
        }

        // alert("Employee updated successfully");

        this.showEditModal = false;
        this.editingEmployee = null;

      },
      error: (err) => {
        console.error(' Update ERROR:', err);
        console.error('Error status:', err.status);
        console.error('Error statusText:', err.statusText);
        console.error('Error URL:', err.url);
        console.error('Error headers:', err.headers);
        console.error('Full error object:', err);
        
        // Specific error messages
        if (err.status === 403) {
          alert('403 Forbidden: You do not have permission to update this employee');
        } else if (err.status === 401) {
          alert('401 Unauthorized: Please login again');
        } else {
          alert(`Update failed: ${err.status} ${err.statusText}`);
        }
      }
    });
}

  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
      this.errorMessage = '';
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
    }
  }


saveEdit() {

  if (!this.editProject.title || !this.editProject.tech) {
    alert('Please fill in title and tech stack');
    return;
  }

  const empId = (this.user as any)?.employeeId;

  if (!empId) {
    alert("Employee ID not found");
    return;
  }

  // ===============================
  // EDIT EXISTING PROJECT
  // ===============================
  if (this.editingId !== null) {

    const id =
      typeof this.editingId === 'string'
        ? parseInt(this.editingId)
        : this.editingId;

    console.log('🔍 === STARTING PROJECT IMAGE UPDATE ===');
    console.log('📝 Updating project:', id);
    
    const payload = {
      projectName: this.editProject.title,
      techStack: this.editProject.tech,
      description: this.editProject.summary || "Updated project",
      image: this.selectedFile ? this.editProject.image : undefined
    };
    
    console.log('📤 Update payload:', payload);
    console.log('📁 Selected file:', this.selectedFile);
    console.log('🖼️ EditProject.image:', this.editProject.image ? 'Base64 present' : 'No base64');
    console.log('🖼️ Image being sent:', this.editProject.image ? 'Base64 image present' : 'No image');

    this.projectService.updateProject(id, payload, this.selectedFile).subscribe({
      next: (response) => {
        console.log('✅ === BACKEND RESPONSE RECEIVED ===');
        console.log('📥 Backend response:', response);
        console.log('📥 Response type:', typeof response);
        console.log('📥 Response keys:', response ? Object.keys(response) : 'No response');
        
        if (response?.image) {
          console.log('🖼️ Backend returned image:', response.image.substring(0, 50) + '...');
          console.log('🖼️ Image starts with data:', response.image.startsWith('data:'));
          console.log('🖼️ Image starts with http:', response.image.startsWith('http'));
        } else {
          console.log('❌ No image in backend response');
        }

        // Only update local array immediately - don't call ProjectsService to avoid conflicts
        const projectIndex = this.projects.findIndex(p => p.id === id);
        console.log('🔍 Project index found:', projectIndex);
        
        if (projectIndex !== -1) {
          console.log('📋 Current project before update:', this.projects[projectIndex]);
          
          let newImage = this.editProject.image || '';
          console.log('🖼️ Initial newImage from editProject:', newImage ? 'Has image' : 'No image');
          
          // If a file was selected, use the base64 image from editProject
          if (this.selectedFile) {
            console.log('🔄 Using selected file image (backend not returning image)');
            newImage = this.editProject.image || '';
            console.log('🖼️ Using editProject image:', newImage ? 'Has image' : 'No image');
          } else if (response?.image) {
            console.log('🔄 Processing backend image response...');
            // Backend might return base64 or image URL
            newImage = response.image.startsWith('data:') 
              ? response.image 
              : response.image.startsWith('http') 
                ? response.image 
                : 'data:image/jpeg;base64,' + response.image;
            console.log('🖼️ Processed newImage:', newImage ? newImage.substring(0, 50) + '...' : 'No image');
          } else {
            console.log('🔄 Using existing image (no file selected and no backend image)');
          }
          
          this.projects[projectIndex] = {
            ...this.projects[projectIndex],
            title: this.editProject.title,
            tech: this.editProject.tech || '',
            image: newImage,
            summary: this.editProject.summary
          };
          
          console.log('🔄 === LOCAL PROJECT UPDATED ===');
          console.log('🔄 Updated project:', this.projects[projectIndex]);
          console.log('🖼️ Final image in project:', this.projects[projectIndex].image ? 'Image present' : 'No image');
          console.log('🖼️ Final image length:', this.projects[projectIndex].image?.length || 0);
        } else {
          console.log('❌ Project not found in local array');
        }

        // Clear selected file after update
        this.selectedFile = undefined;
        console.log('🗑️ Selected file cleared');
        
        // Save portfolio with updated project data (including new image)
        console.log('💾 === SAVING PORTFOLIO ===');
        this.savePortfolioAfterChange();
        
        this.cancelEdit();
        console.log('🔚 === PROJECT UPDATE COMPLETE ===');
      },
      error: (err) => {
        console.error(' Failed to update project:', err);
        console.error(' Error status:', err.status);
        console.error(' Error message:', err.error?.message || err.message);
        console.error(' Full error:', err);
        
        // Show specific error message based on error type
        if (err.status === 413) {
          alert('Image file is too large. Please choose a smaller image.');
        } else if (err.status === 415) {
          alert('Unsupported image format. Please use JPG, PNG, or GIF.');
        } else if (err.error?.message?.includes('image')) {
          alert('Image update failed: ' + err.error.message);
        } else {
          alert('Failed to update project. Please try again.');
        }
      }
    });

  }

  // ===============================
  // ADD NEW PROJECT
  // ===============================
  else {

    console.log('🎯 Adding project with data:', {
      empId,
      title: this.editProject.title,
      tech: this.editProject.tech,
      file: this.selectedFile,
      summary: this.editProject.summary
    });

    const add$ = this.projectsService.addProject(
      empId,
      this.editProject.title,
      this.editProject.tech,
      this.selectedFile ?? undefined,
      this.editProject.summary
    );

    add$.pipe(take(1)).subscribe({
      next: (newProject) => {
        console.log('✅ Project added');
        console.log('📥 New project from backend:', newProject);
        
        // Check for potential duplicates
        const existingProjects = this.projects.filter(p => 
          p.title === this.editProject.title
        );
        console.log('🔍 Existing projects with same title:', existingProjects.length);
        
        // ProjectsService already adds the project to the array, so we don't need to add it again here
        // The ProjectsService.setProjects() call handles the UI update
        console.log('� ProjectsService will handle UI update automatically');
        console.log('� Current projects after backend response:', this.projects.map(p => p.title));
        
        // Save portfolio with updated project data (including new image)
        console.log('💾 Saving portfolio after project add...');
        this.savePortfolioAfterChange();
        
        this.cancelEdit();
      },
      error: (err) => {
        console.error('❌ Failed to add project:', err);
        console.error('🔍 Error details:', err.error?.message || err.message);
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
  // Check if portfolio is loaded before allowing project addition
  if (this.portfolioLoading) {
    console.log('❌ Portfolio still loading for project creation');
    alert('Portfolio is still loading. Please wait...');
    return;
  }
  
  if (!this.portfolioId) {
    console.log('❌ No portfolio exists, creating one first...');
    // Create portfolio automatically if it doesn't exist
    this.createPortfolioForProject();
    return;
  }
  
  this.editingId = null;
  this.editProject = { title: '', tech: '', summary: '', image: '' };
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
      designation: this.user.designation || 'Developer',
      summary: this.user.summary || '', // ⭐ ADD PORTFOLIO SUMMARY
      projects: (this.projects || []).map(p => ({
  projectName: p.title || '',
  description: p.description || '',
  techStack: p.tech || '',   // ⭐ ADD THIS
  summary: p.summary || '',
  image: p.image ? p.image.split(',')[1] : ''
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

  createPortfolioForProject() {
    const employeeId = (this.user as any)?.employeeId;
    
    if (!employeeId) {
      console.error('❌ No employeeId found');
      alert('Employee ID not found. Please refresh the page.');
      return;
    }

    const portfolioData = {
      skills: this.user?.skills || [],
      projects: [],
      designation: this.user?.designation || 'Developer',
      employeeType: this.user?.employeeType || 'Full Time',
      email: this.user?.email,
      phone: this.user?.phone
    };

    console.log('➕ Creating portfolio for project addition:', portfolioData);
    
    this.portfolioService.addPortfolio(employeeId, portfolioData).subscribe({
      next: (response: any) => {
        this.portfolioId = response?.id || null;
        console.log('✅ Portfolio created for projects, ID:', this.portfolioId);
        
        // Now open the project modal
        this.editingId = null;
        this.editProject = { title: '', tech: '', summary: '', image: '' };
        this.showProjectModal = true;
        console.log('🔓 Project modal opened after portfolio creation');
      },
      error: (error) => {
        console.error('❌ Error creating portfolio for projects:', error);
        alert('Failed to create portfolio. Please try again.');
      }
    });
  }

  // Skill management methods
  addSkill() {
    console.log('🎯 addSkill() called');
    console.log('👤 Current user:', this.user);
    console.log('📝 Current skills:', this.user?.skills);
    
    // Check if portfolio is loaded before allowing skill addition
    if (this.portfolioLoading) {
      console.log('❌ Portfolio still loading');
      alert('Portfolio is still loading. Please wait...');
      return;
    }
    
    if (!this.portfolioId) {
      console.log('❌ No portfolio exists, creating one first...');
      // Create portfolio automatically if it doesn't exist
      this.createPortfolioForSkill();
      return;
    }
    
    this.newSkill = '';
    this.showSkillModal = true;
    
    console.log('🔓 Skill modal should now be visible:', this.showSkillModal);
  }

  createPortfolioForSkill() {
    const employeeId = (this.user as any)?.employeeId;
    
    if (!employeeId) {
      console.error('❌ No employeeId found');
      alert('Employee ID not found. Please refresh the page.');
      return;
    }

    const portfolioData = {
      skills: this.user?.skills || [],
      projects: [],
      designation: this.user?.designation || 'Developer',
      employeeType: this.user?.employeeType || 'Full Time',
      email: this.user?.email,
      phone: this.user?.phone
    };

    console.log('➕ Creating portfolio for skill addition:', portfolioData);
    
    this.portfolioService.addPortfolio(employeeId, portfolioData).subscribe({
      next: (response: any) => {
        this.portfolioId = response?.id || null;
        console.log('✅ Portfolio created for skills, ID:', this.portfolioId);
        
        // Now open the skill modal
        this.newSkill = '';
        this.showSkillModal = true;
        console.log('🔓 Skill modal opened after portfolio creation');
        
        // Show success message to user
        alert('Portfolio created successfully! You can now add skills.');
      },
      error: (error) => {
        console.error('❌ Error creating portfolio for skills:', error);
        alert('Failed to create portfolio. Please try again.');
      }
    });
  }

  openSummaryModal() {
    if (this.portfolioLoading) {
      alert('Portfolio is still loading...');
      return;
    }

    // Use same field as register page: user.portfolio.summary
    this.newSummary = this.user?.portfolio?.summary || this.user?.summary || '';
    console.log('📝 Opening summary modal with current value:', this.newSummary);
    this.showSummaryModal = true;
  }

  saveSummary() {
    if (!this.user) return;

    // Use same field as register page: user.portfolio.summary
    if (!this.user.portfolio) {
      this.user.portfolio = {};
    }
    this.user.portfolio.summary = this.newSummary;
    
    // Also update user.summary for compatibility
    this.user.summary = this.newSummary;

    // Save to localStorage for immediate persistence
    const currentUser = this.auth.getLoggedInUser();
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        portfolio: {
          ...currentUser.portfolio,
          summary: this.newSummary
        },
        summary: this.newSummary
      };
      localStorage.setItem('LOGGED_IN_USER', JSON.stringify(updatedUser));
      console.log('📝 Summary saved to localStorage (portfolio.summary):', this.newSummary);
    }

    // Also save to portfolio service for backend sync
    const portfolioData = {
      skills: this.user.skills || [],
      designation: this.user.designation || 'Developer',
      summary: this.newSummary,
      projects: (this.projects || []).map(p => ({
        projectName: p.title || '',
        description: p.description || '',
        techStack: p.tech || '',
        summary: p.summary || '',
        image: p.image?.startsWith('data:')
          ? p.image
          : p.image
            ? 'data:image/png;base64,' + p.image
            : ''
      }))
    };

    // Use same save pipeline as skills
    this.actualSaveToBackend(portfolioData);

    // Update local user data immediately for UI refresh
    this.user.summary = this.newSummary;
    if (this.user.portfolio) {
      this.user.portfolio.summary = this.newSummary;
    }

    this.showSummaryModal = false;
    console.log('✅ Summary saved successfully');
    console.log('📝 Updated local summary:', this.newSummary);
  }

  saveSkill() {
    console.log('🎯 saveSkill() called');
    console.log('📝 newSkill value:', this.newSkill);
    console.log('🆔 Current portfolioId:', this.portfolioId);
    
    const trimmedSkill = this.newSkill.trim();
    
    console.log('🎯 Starting saveSkill process...');
    console.log('📝 New skill:', trimmedSkill);
    console.log('👤 Current user:', this.user);
    console.log('💼 Current skills:', this.user?.skills);
    
    if (!trimmedSkill) {
      console.log('❌ Empty skill, returning');
      alert('Please enter a skill name');
      return;
    }
    
    if (!this.user || !this.user.skills) {
      console.log('❌ No user or skills array found');
      console.log('User object:', this.user);
      console.log('User.skills:', this.user?.skills);
      alert('User data not loaded. Please refresh the page.');
      return;
    }
    
    // Check for duplicates
    if (this.user.skills.includes(trimmedSkill)) {
      console.log('❌ Skill already exists:', trimmedSkill);
      alert('This skill already exists!');
      return;
    }
    
    // Add skill to local array
    this.user.skills.push(trimmedSkill);
    console.log('✅ Skill added to local array. New skills:', this.user.skills);
    
    // Save to backend via PortfolioService
    console.log('🔄 Calling saveSkillsToBackend...');
    this.saveSkillsToBackend();
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

    console.log('🔄 Starting skills save process...');
    console.log('👤 User data:', this.user);
    console.log('💼 Portfolio ID:', this.portfolioId);
    console.log('🎯 Skills to save:', this.user.skills);

    // Prepare portfolio data for backend
    const portfolioData = {
      skills: this.user.skills || [],
      designation: this.user.designation || 'Developer',
      projects: (this.projects || []).map(p => ({
        projectName: p.title || '',
        description: p.description || '',
        techStack: p.tech || '',
        summary: p.summary || '',
        image: p.image?.startsWith('data:')
  ? p.image
  : p.image
    ? 'data:image/png;base64,' + p.image
    : '',
      }))
    };

    console.log('📤 Portfolio data being sent:', JSON.stringify(portfolioData, null, 2));
    console.log('🖼️ Project images in portfolio data:');
    portfolioData.projects.forEach((project, index) => {
      console.log(`  Project ${index}: ${project.projectName} - Image length: ${project.image ? project.image.length : 0}`);
    });

    // Call backend directly
    this.actualSaveToBackend(portfolioData);
  }

  actualSaveToBackend(portfolioData: any) {
    const employeeId = (this.user as any)?.employeeId;
    
    if (!employeeId) {
      console.error('❌ No employeeId found');
      alert('Employee ID not found. Please refresh the page.');
      return;
    }

    console.log('🔍 actualSaveToBackend called with:');
    console.log('  - employeeId:', employeeId);
    console.log('  - portfolioId:', this.portfolioId);
    console.log('  - portfolioData:', portfolioData);

    if (this.portfolioId) {
      // Update existing portfolio
      console.log('📝 Updating existing portfolio ID:', this.portfolioId);
      console.log('📤 Sending update request with data:', JSON.stringify(portfolioData, null, 2));
      
      this.portfolioService.updatePortfolio(this.portfolioId, portfolioData).subscribe({
        next: (response) => {
          console.log('✅ Skills saved to backend successfully!');
          console.log('📥 Backend response:', response);
          this.cancelAddSkill();
        },
        error: (error) => {
          console.error('❌ Error updating portfolio:', error);
          console.log('❌ Error details:', error.error || error.message);
          console.log('🔄 Falling back to localStorage...');
          this.fallbackToLocalStorage();
        }
      });
    } else {
      // Check if employee exists but portfolio was deleted - reload portfolio first
      console.log('🔄 No portfolio ID found, reloading portfolio for employee:', employeeId);
      this.loadPortfolio(employeeId).then(() => {
        // Try again after loading
        if (this.portfolioId) {
          console.log('✅ Portfolio loaded, retrying save operation');
          this.actualSaveToBackend(portfolioData);
        } else {
          // Create new portfolio only if absolutely necessary
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
              console.log('❌ Error details:', error.error || error.message);
              console.log('🔄 Falling back to localStorage...');
              this.fallbackToLocalStorage();
            }
          });
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
    console.log('❌ cancelAddSkill() called');
    this.showSkillModal = false;
    this.newSkill = '';
    console.log('🔒 Skill modal hidden');
  }

  // Single portfolio loader — DB is the source of truth for projects/skills
loadPortfolio(employeeId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    this.portfolioLoading = true; // Set loading state
    this.portfolioId = null; // reset first

    this.portfolioService.getPortfolio(employeeId).subscribe({

      next: (res: any) => {

        console.log('Portfolio response:', res);
        
        if (!res || (Array.isArray(res) && res.length === 0)) {
          console.log('No portfolio exists for employee:', employeeId);
          this.portfolioId = null;
          
          // Clear summary and skills when portfolio is deleted
          if (this.user) {
            this.user.skills = [];
            this.user.summary = '';
            
            // Also update localStorage
            const currentUser = this.auth.getLoggedInUser();
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                skills: [],
                summary: ''
              };
              localStorage.setItem('LOGGED_IN_USER', JSON.stringify(updatedUser));
              console.log('🗑️ Cleared summary and skills from localStorage');
            }
          }
          
          this.portfolioLoading = false; // Set loading to false
          resolve();
          return;
        }

        const portfolio = Array.isArray(res) ? res[0] : res;
        console.log('Portfolio object:', portfolio);

        this.portfolioId = portfolio?.id ?? null;

        if (this.user) {
          console.log('Current user before skills update:', this.user);
          console.log('Portfolio data:', portfolio);

  // Load skills from different possible locations
  const newSkills = portfolio?.skills || 
                   portfolio?.portfolio?.skills || 
                   [];
  
  // Load summary from different possible locations (localStorage first for latest value)
  const currentUser = this.auth.getLoggedInUser();
  const newSummary = currentUser?.portfolio?.summary ||               // localStorage portfolio.summary (latest)
                    currentUser?.summary ||                           // localStorage summary (fallback)
                    portfolio?.summary || 
                    portfolio?.portfolio?.summary || 
                    '';
  
  console.log('🔍 Summary loading debug:');
  console.log('  - localStorage portfolio.summary:', currentUser?.portfolio?.summary);
  console.log('  - localStorage summary:', currentUser?.summary);
  console.log('  - portfolio summary:', portfolio?.summary);
  console.log('  - portfolio.portfolio summary:', portfolio?.portfolio?.summary);
  console.log('  - final summary:', newSummary);
  
  console.log('Final skills to load:', newSkills);
  console.log('Final summary to load:', newSummary);
  
  this.user = {
    ...this.user,
    skills: newSkills,
    summary: newSummary
  };

  console.log('User after skills update:', this.user);
}

        this.portfolioLoading = false; // Set loading to false
        resolve();
      },

      error: (err) => {
        console.log('No portfolio found (normal case)', employeeId);
        this.portfolioId = null;
        
        // Clear summary and skills when portfolio is deleted (error case)
        if (this.user) {
          this.user.skills = [];
          this.user.summary = '';
          
          // Also update localStorage
          const currentUser = this.auth.getLoggedInUser();
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              skills: [],
              summary: ''
            };
            localStorage.setItem('LOGGED_IN_USER', JSON.stringify(updatedUser));
            console.log('🗑️ Cleared summary and skills from localStorage (error case)');
          }
        }
        
        this.portfolioLoading = false; // Set loading to false
        resolve();
      }
    });
  });
}

  ngOnDestroy() {
    if (this.projectsSub) {
      this.projectsSub.unsubscribe();
      this.projectsSub = null;
    }
    document.body.classList.remove('admin-bg');
  }

  onEditProjectImageSelected(event: any) {
  const file = event.target.files[0];

  if (file) {

    // 1️⃣ store file for backend upload
    this.selectedFile = file;

    // 2️⃣ show preview immediately
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.editProject.image = e.target.result;
    };

    reader.readAsDataURL(file);
  }
}

// Mobile menu toggle
toggleMobileMenu() {
  this.mobileMenuOpen = !this.mobileMenuOpen;
}

get filteredEmployees() {
  return this.employees.filter(emp => {

    const matchEmployeeType =
      !this.employeeTypeFilter ||
      emp.employeeType?.toLowerCase() === this.employeeTypeFilter.toLowerCase();

    const matchDesignation =
      !this.designationFilter ||
      emp.designation?.toLowerCase() === this.designationFilter.toLowerCase();

    return matchEmployeeType && matchDesignation;
  });
}

}
