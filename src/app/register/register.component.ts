import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { EmployeeService } from '../services/employee.service';
import { ProjectsService } from '../services/projects.service';

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
  address: '',      // street
  city: '',         // NEW
  state: '',        // NEW
  country: '',      // NEW
  pinCode: '',      // NEW
  designation: '',
  employeeType: '',
  panNo: '',
  aadharNo: '',
  joiningDate: '',
  exitDate: '',
  username: '',
  password: '',
  skills: [] as string[],  // Step 4: Skills
  projects: [] as Array<{title: string, tech: string, image: string}>  // Step 4: Projects
};

  constructor(
    private employeeService: EmployeeService,
    private auth: AuthService,
    private router: Router,
    private isLoggedService: IsLoggedService,
    private projectsService: ProjectsService
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
  this.successMessage = '';

  if (!this.formData.email || !this.formData.password) {
    this.errorMessage = 'Email and Password are required!';
    return;
  }

  const email = this.formData.email.toLowerCase().trim();
  const username = this.formData.username.toLowerCase().trim();
  const password = this.formData.password;

  // Map form data to match Spring Boot entity structure
 const payload = {
  employeeId: Math.floor(Date.now()),
  firstName: this.formData.firstName,
  middleName: this.formData.middleName || '',
  lastName: this.formData.lastName,
  email,
  password: password, // CRITICAL: Add password field
  phone: this.formData.phone,
  designation: this.formData.designation,
  employeeType: this.formData.employeeType,
  joiningDate: new Date(this.formData.joiningDate),
  exitDate: this.formData.exitDate ? new Date(this.formData.exitDate) : null,
  aadharNo: this.formData.aadharNo,
  panNO: this.formData.panNo,
  address: {
  id: null,
  street: this.formData.address || '',
  city: this.formData.city || '',
  state: this.formData.state || '',
  country: this.formData.country || '',
  pinCode: this.formData.pinCode || ''
}
};

  this.employeeService.createUser(payload).subscribe({
    next: (response: any) => {
      this.successMessage = 'Registration successful!';

      // Store the created user from backend response (if returned)
      if (response) {
        localStorage.setItem('LOGGED_IN_USER', JSON.stringify(response));
      }

      this.auth.registerUser(email, username, password, {
        firstName: this.formData.firstName,
        middleName: this.formData.middleName,
        lastName: this.formData.lastName,
        phone: this.formData.phone,
        address: this.formData.address,
        city: this.formData.city,
        state: this.formData.state,
        country: this.formData.country,
        pinCode: this.formData.pinCode,
        designation: this.formData.designation,
        employeeType: this.formData.employeeType,
        panNO: this.formData.panNo,
        aadharNo: this.formData.aadharNo,
        joiningDate: this.formData.joiningDate,
        exitDate: this.formData.exitDate,
        name: `${this.formData.firstName} ${this.formData.lastName}`.trim(),
        role: this.formData.designation,
        skills: this.formData.skills,  // Add skills
        projects: [],                  // Initialize empty projects array
        contact: {
          email: email,
          github: ''
        }
      });

      this.auth.login(username, email);
      
      // Save projects to ProjectsService
      if (this.formData.projects.length > 0) {
        this.formData.projects.forEach(project => {
          if (project.title && project.tech) {
            this.projectsService.addProject(
              project.title,
              project.tech,
              project.image || 'assets/default-project.jpg'
            );
          }
        });
        console.log('Registration: Projects saved to ProjectsService:', this.formData.projects);
      }
      
      setTimeout(() => this.router.navigate(['/portfolio']), 1200);
    },
    error: (err) => {
      this.errorMessage = 'Registration failed: ' + (err.error?.message || err.message || 'Unknown error');
    }
  });
}

  // Skill management methods for step 4
  newSkill: string = '';

  addSkill() {
    if (this.newSkill.trim() && !this.formData.skills.includes(this.newSkill.trim())) {
      this.formData.skills.push(this.newSkill.trim());
      this.newSkill = '';
    }
  }

  removeSkill(skill: string) {
    const index = this.formData.skills.indexOf(skill);
    if (index > -1) {
      this.formData.skills.splice(index, 1);
    }
  }

  // Project management methods for step 4
  addProject() {
    const newProject = {
      title: '',
      tech: '',
      image: ''
    };
    this.formData.projects.push(newProject);
  }

  removeProject(index: number) {
    this.formData.projects.splice(index, 1);
  }

  // Handle project file selection
  onProjectFileSelected(event: any, projectIndex: number) {
    const file = event.target.files[0];
    if (file && this.formData.projects[projectIndex]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.formData.projects[projectIndex].image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  register1() {
  this.employeeService.createUser(this.formData).subscribe({
    next: () => {
      this.successMessage = 'Employee registered successfully';
    },
    error: () => {
      this.errorMessage = 'Registration failed';
    }
  });
}

}
