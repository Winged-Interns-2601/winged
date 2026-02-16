import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { EmployeeService } from '../services/employee.service';

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
  password: ''
};

skills: string[] = [];
newSkill = '';


  constructor(
    private employeeService: EmployeeService,
    private auth: AuthService,
    private router: Router,
    private isLoggedService: IsLoggedService
  ) {
    // Load any previously saved skills
    this.loadSkillsFromStorage();
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
  skills: this.skills,
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
        role: this.formData.designation
      });

      this.auth.login(username, email);
      
      // Save skills to main storage for profile component
      localStorage.setItem('skills', JSON.stringify(this.skills));
      
      setTimeout(() => this.router.navigate(['/portfolio']), 1200);
    },
    error: (err) => {
      this.errorMessage = 'Registration failed: ' + (err.error?.message || err.message || 'Unknown error');
    }
  });
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

addSkill() {
  const skill = this.newSkill.trim();

  if (skill && !this.skills.includes(skill)) {
    this.skills.push(skill);
    this.saveSkillsToStorage();
  }

  this.newSkill = '';
}

removeSkill(skill: string) {
  this.skills = this.skills.filter(s => s !== skill);
  this.saveSkillsToStorage();
}

saveSkillsToStorage() {
  localStorage.setItem('registration_skills', JSON.stringify(this.skills));
}

loadSkillsFromStorage() {
  const storedSkills = localStorage.getItem('registration_skills');
  if (storedSkills) {
    this.skills = JSON.parse(storedSkills);
  }
}

}
