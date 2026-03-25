import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { EmployeeService } from '../services/employee.service';
import { ProjectsService } from '../services/projects.service';
import { PortfolioService } from '../services/portfolio.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  currentStep = 1;

  errorMessage = '';
  successMessage = '';

formData = {
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


  newSkill = '';


  constructor(
    private employeeService: EmployeeService,
    private auth: AuthService,
    private router: Router,
    private isLoggedService: IsLoggedService,
    private projectsService: ProjectsService,
    private portfolioService: PortfolioService
  ) {}

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

 
register() {

  this.errorMessage = '';

  const payload = {
    employeeId: Date.now(),
    firstName: this.formData.firstName,
    middleName: this.formData.middleName,
    lastName: this.formData.lastName,

    employeeType: this.formData.employeeType,
    designation: this.formData.designation,

    email: this.formData.email.toLowerCase().trim(),
    password: this.formData.password,

    phone: this.formData.phone,

    address: this.formData.address,

    joiningDate: this.formData.joiningDate,
    exitDate: this.formData.exitDate || null,

    aadharNo: this.formData.aadharNo,
    panNO: this.formData.panNo,
    
    // ⭐ ADD PORTFOLIO DATA (VERY IMPORTANT)
    portfolio: {
      skills: this.formData.portfolio.skills || [],
      projects: [], // Projects created individually after registration
      designation: this.formData.designation,
      summary: this.formData.portfolio.summary || '' // ⭐ ADD SUMMARY
    }
  };

  console.log('📤 Registration payload:', payload);

  this.auth.registerBackend(payload).subscribe({

    next: (response) => {
      console.log('✅ Registration successful:', response);
      this.successMessage = "Registration successful";

      this.auth.loginBackend(payload.email, payload.password)
        .subscribe((res:any) => {

          localStorage.setItem("TOKEN", res.token);
          console.log('🔑 Registration token stored:', res.token);
          console.log('🔑 Registration token verification:', localStorage.getItem("TOKEN"));
          
          // ⭐ SAVE FULL EMPLOYEE DATA (VERY IMPORTANT)
          localStorage.setItem("LOGGED_IN_USER", JSON.stringify(res.employee));

          // ⭐ CREATE PORTFOLIO AFTER REGISTRATION IF PROJECTS/SKILLS EXIST
          if (this.formData.portfolio.projects.length > 0 || this.formData.portfolio.skills.length > 0) {
            const employeeId = res.employee?.employeeId;
            
            console.log('🆔 Employee ID from login:', employeeId);
            
            if (!employeeId) {
              console.error('❌ Employee ID missing in login response');
              console.error('📥 Full login response:', res);
              return;
            }
            
            this.createPortfolioAfterRegistration(employeeId);
          } else {
            this.router.navigate(['/login']);
          }
        });
    },

    error: (err) => {
      console.log("❌ Registration error:", err);
      console.log("DESIGNATION =", this.formData.designation);
  console.log("FULL ERROR:", err);
  console.log("BACKEND MESSAGE:", err.error);
  this.errorMessage = JSON.stringify(err.error);
}
  });
}

  // ⭐ CREATE PORTFOLIO AFTER REGISTRATION
  createPortfolioAfterRegistration(employeeId: number) {
    console.log('🎯 Projects from registration:', this.formData.portfolio.projects);
    
    // NOTE: Portfolio already created in registration payload
    // This method now only handles individual project creation
    console.log('� Skipping portfolio creation (already done in registration)');
    console.log('🔄 Creating only individual projects...');
    
    // Create projects individually (like profile component does)
    this.createProjectsIndividually(employeeId);
  }

  // ⭐ CREATE PROJECTS INDIVIDUALLY (LIKE PROFILE COMPONENT)
  createProjectsIndividually(employeeId: number) {
    console.log('🔥 FINAL employeeId used:', employeeId);
    
    const projects = this.formData.portfolio.projects || [];
    
    if (projects.length === 0) {
      console.log('📝 No projects to create, navigating to login');
      this.router.navigate(['/login']);
      return;
    }

    console.log('🎯 Creating', projects.length, 'projects individually');
    
    // Reset counters
    this.createdProjectsCount = 0;
    this.totalProjectsCount = projects.length;
    
    projects.forEach((project, index) => {
      console.log(`📤 Creating project ${index + 1}/${projects.length}:`, project.projectName);
      
      // Handle image conversion
      if (project.image && project.image.startsWith('data:image')) {
        // Convert base64 to File
        fetch(project.image)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'project-image.jpg', { type: 'image/jpeg' });
            this.callProjectsService(employeeId, project, file);
          })
          .catch(err => {
            console.error('Error converting image:', err);
            this.callProjectsService(employeeId, project);
          });
      } else {
        this.callProjectsService(employeeId, project);
      }
    });
  }

  // ⭐ CALL PROJECTS SERVICE (LIKE PROFILE COMPONENT)
  callProjectsService(employeeId: number, project: any, file?: File) {
    console.log('🎯 Calling ProjectsService.addProject with:', {
      employeeId,
      title: project.projectName,
      tech: project.techStack,
      file: file,
      summary: project.summary
    });
    
    this.projectsService.addProject(
      employeeId,
      project.projectName || '',
      project.techStack || '',
      file,
      project.summary || ''
    ).subscribe({
      next: (response: any) => {
        console.log('✅ Project created successfully:', response);
        console.log('📥 Backend response details:', JSON.stringify(response, null, 2));
        this.checkAllProjectsCreated();
      },
      error: (err: any) => {
        console.error('❌ Failed to create project:', err);
        console.error('📥 Error details:', JSON.stringify(err, null, 2));
        console.error('📥 Error status:', err.status);
        console.error('📥 Error message:', err.error);
        this.checkAllProjectsCreated();
      }
    });
  }

  // ⭐ CHECK IF ALL PROJECTS ARE CREATED
  private createdProjectsCount = 0;
  private totalProjectsCount = 0;

  checkAllProjectsCreated() {
    this.createdProjectsCount++;
    console.log(`📊 Progress: ${this.createdProjectsCount}/${this.totalProjectsCount} projects created`);
    
    if (this.createdProjectsCount >= this.totalProjectsCount) {
      console.log('✅ All projects created, navigating to portfolio');
      console.log('🔄 Waiting 2 seconds before navigation to allow backend processing...');
      
      // Wait a moment for backend to process
      setTimeout(() => {
        console.log('🚀 Navigating to login page...');
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

 
  addSkill() {
    const skill = this.newSkill.trim();
    if (skill && !this.formData.portfolio.skills.includes(skill)) {
      this.formData.portfolio.skills.push(skill);
      this.newSkill = '';
    }
  }

  removeSkill(skill: string) {
    const index = this.formData.portfolio.skills.indexOf(skill);
    if (index > -1) {
      this.formData.portfolio.skills.splice(index, 1);
    }
  }

  // Project management methods for step 4
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
    this.formData.portfolio.projects.push(newProject);
  }

  removeProject(index: number) {
    this.formData.portfolio.projects.splice(index, 1);
  }

  // Handle project file selection
  onProjectFileSelected(event: any, projectIndex: number) {
    const file = event.target.files[0];
    if (file && this.formData.portfolio.projects[projectIndex]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.formData.portfolio.projects[projectIndex].image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    document.body.classList.add('admin-bg');
  }
  
    ngOnDestroy() {
          document.body.classList.remove('admin-bg');
    }
}
