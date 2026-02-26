import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { EmployeeService } from '../services/employee.service';
import { ProjectService } from '../services/project.service';


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
    private projectService: ProjectService
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

// register() {
//   this.errorMessage = '';
//   this.successMessage = '';

//   if (!this.formData.email || !this.formData.password) {
//     this.errorMessage = 'Email and Password are required!';
//     return;
//   }

//   const email = this.formData.email.toLowerCase().trim();
//   // const username = this.formData.username.toLowerCase().trim();
//   const password = this.formData.password;

//   // Map form data to match Spring Boot entity structure
//  const payload = {
//   skills: this.formData.portfolio.skills,
//   employeeId: Math.floor(Date.now()),
//   firstName: this.formData.firstName,
//   middleName: this.formData.middleName || '',
//   lastName: this.formData.lastName,
//   email,
//   password: password, // CRITICAL: Add password field
//   phone: this.formData.phone,
//   designation: this.formData.designation,
//   employeeType: this.formData.employeeType,
//   joiningDate: new Date(this.formData.joiningDate),
//   exitDate: this.formData.exitDate ? new Date(this.formData.exitDate) : null,
//   aadharNo: this.formData.aadharNo,
//   panNO: this.formData.panNo,
//   address: {
//   id: null,
//   street: this.formData.address || '',
//   city: this.formData.address || '',
//   state: this.formData.address || '',
//   country: this.formData.address || '',
//   pinCode: this.formData.address || ''
// }
// };

//   this.employeeService.createUser(payload).subscribe({
//     next: (response: any) => {
//       this.successMessage = 'Registration successful!';

//       // Store the created user from backend response (if returned)
//       if (response) {
//         localStorage.setItem('LOGGED_IN_USER', JSON.stringify(response));
//       }

//       this.auth.registerUser(email, username, password, {
//         firstName: this.formData.firstName,
//         middleName: this.formData.middleName,
//         lastName: this.formData.lastName,
//         phone: this.formData.phone,
//         address: {
//   street: this.formData.address.street,
//   city: this.formData.address.city,
//   state: this.formData.address.state,
//   country: this.formData.address.country,
//   pinCode: this.formData.address.pinCode
// }
// ,
//         designation: this.formData.designation,
//         employeeType: this.formData.employeeType,
//         panNO: this.formData.panNo,
//         aadharNo: this.formData.aadharNo,
//         joiningDate: this.formData.joiningDate,
//         exitDate: this.formData.exitDate,
//         name: `${this.formData.firstName} ${this.formData.lastName}`.trim(),
//         role: this.formData.designation,
//         skills: this.formData.portfolio.skills,  // Add skills
//         projects: [],                  // Initialize empty projects array
//         contact: {
//           email: email,
//           github: ''
//         }
//       });

//       this.auth.login(username, email);
//       setTimeout(() => this.router.navigate(['/portfolio']), 1200);
//     },
//     error: (err) => {
//       this.errorMessage = 'Registration failed: ' + (err.error?.message || err.message || 'Unknown error');
//     }
//   });
// }

  // Skill management methods for step 4
 
 register() {
  this.errorMessage = '';
  this.successMessage = '';

  if (!this.formData.email || !this.formData.password) {
    this.errorMessage = 'Email and Password are required!';
    return;
  }

  const email = this.formData.email.toLowerCase().trim();
  const password = this.formData.password;

  const payload = {
    employeeId: Math.floor(Date.now()),
    firstName: this.formData.firstName,
    middleName: this.formData.middleName,
    lastName: this.formData.lastName,
    email,
    password,
    phone: this.formData.phone,
    designation: this.formData.portfolio.designation,
    employeeType: this.formData.employeeType,
    joiningDate: new Date(this.formData.joiningDate),
    exitDate: this.formData.exitDate
      ? new Date(this.formData.exitDate)
      : null,
    aadharNo: this.formData.aadharNo,
    panNO: this.formData.panNo,

    address: {
      street: this.formData.address.street,
      city: this.formData.address.city,
      state: this.formData.address.state,
      country: this.formData.address.country,
      pinCode: this.formData.address.pinCode
    },

    portfolio: {
    designation: this.formData.portfolio.designation,
    skills: this.formData.portfolio.skills,
    summary: this.formData.portfolio.summary,
    projects: this.formData.portfolio.projects.map(p => ({
    projectName: p.projectName,
    description: p.description,
    image: p.image
  ? p.image.split(',')[1]
  : null,
    techStack: p.techStack,
    summary: p.summary,
    startDate: p.startDate ? new Date(p.startDate) : null,
    endDate: p.endDate ? new Date(p.endDate) : null
  }))
}

  };

  this.employeeService.createUser(payload).subscribe({
    next: (response: any) => {

  const employeeId = response.employeeId;

  // ADD PROJECTS ONE BY ONE
//   this.formData.portfolio.projects.forEach(p => {

//     const fd = new FormData();

//     fd.append("projectName", p.projectName);
//     fd.append("description", p.description || "");
//     fd.append("techStack", p.techStack || "");
//     fd.append("summary", p.summary || "");

//     // convert base64 → file (IMPORTANT)
//     if (p.image) {
//       const file = this.base64ToFile(p.image, "project.png");
//       fd.append("image", file);
//     }

//    this.projectService.addProject(employeeId, fd).subscribe({
//   next: (res) => {
//     console.log("PROJECT SAVED:", res);
//   },
//   error: (err) => {
//     console.error("PROJECT ERROR:", err);
//   }
// });
//   });

  this.router.navigate(['/portfolio']);
},
    error: (err) => {

  console.log("BACKEND ERROR:", err);

  this.errorMessage =
    err?.error?.message ||
    "Registration failed. Check backend validation.";
}

  });
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
}
