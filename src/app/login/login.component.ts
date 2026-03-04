import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private isLoggedService: IsLoggedService,
    private employeeService: EmployeeService
  ) {}



login() {

  this.errorMessage = '';

  if (!this.email.trim() || !this.password.trim()) {
    this.errorMessage = "Enter email & password";
    return;
  }

  const email = this.email.toLowerCase().trim();

  this.auth.loginBackend(email, this.password).subscribe({

    next: (res: any) => {

      console.log("LOGIN SUCCESS", res);

      // ⭐ SAVE TOKEN
      localStorage.setItem("TOKEN", res.token);
      console.log('🔑 Token stored in localStorage:', res.token);
      console.log('🔑 Token verification:', localStorage.getItem("TOKEN"));

      // ⭐ SAVE FULL EMPLOYEE (VERY IMPORTANT)
      // Get preserved summary from localStorage (saved during logout)
      const preservedSummary = localStorage.getItem("PRESERVED_SUMMARY") || '';
      
      const employeeData = {
        ...res.employee,
        summary: preservedSummary // Restore preserved summary
      };
      
      localStorage.setItem(
        "LOGGED_IN_USER",
        JSON.stringify(employeeData)
      );
      
      // Clean up preserved summary after using it
      if (preservedSummary) {
        localStorage.removeItem("PRESERVED_SUMMARY");
      }
      
      console.log('📝 Restored summary during login:', preservedSummary);

      // ❌ NO SECOND localStorage.setItem() - NO OVERWRITE

      this.isLoggedService.loginSuccess(res.token);

      this.router.navigateByUrl('/portfolio');
    },

    error: () => {
      this.errorMessage = "Invalid login";
    }
  });
}

ngOnInit() {
  document.body.classList.add('admin-bg');
}
ngOnDestroy() {
  document.body.classList.remove('admin-bg');
}
}
