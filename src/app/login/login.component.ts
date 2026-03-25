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
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private isLoggedService: IsLoggedService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    // 🔥 Auto-redirect if user is already logged in
    const token = localStorage.getItem('TOKEN');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // ⛔ Check expiry
        if (payload.exp * 1000 < Date.now()) {
          console.log('Token expired, clearing storage');
          localStorage.clear();
          return;
        }
        
        const role = payload.role;
        
        console.log('User already logged in, redirecting to:', role);
        
        if (role === 'ADMIN') {
          this.router.navigateByUrl('/admin', { replaceUrl: true });
        } 
        else if (role === 'HR') {
          this.router.navigateByUrl('/profile', { replaceUrl: true });
        } 
        else {
          this.router.navigateByUrl('/portfolio', { replaceUrl: true });
        }

      } catch (error) {
        console.error('Invalid token, clearing storage:', error);
        localStorage.clear();
      }
    }
    
    // Set background styling
    document.body.classList.add('admin-bg');
  }

  login() {
    if (this.isLoading) return; // 🚫 prevent duplicate calls

    this.isLoading = true;
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = "Enter email & password";
      this.isLoading = false;
      return;
    }

    const email = this.email.toLowerCase().trim();

    this.auth.loginBackend(email, this.password).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        localStorage.setItem("TOKEN", res.token);
        localStorage.setItem("LOGGED_IN_USER", JSON.stringify(res.employee));

        this.isLoggedService.loginSuccess(res.token);

        const role = res.role;

        if (role === 'ADMIN') {
          this.router.navigateByUrl('/admin', { replaceUrl: true });
        } 
        else if (role === 'HR') {
          this.router.navigateByUrl('/profile', { replaceUrl: true });
        } 
        else {
          this.router.navigateByUrl('/portfolio', { replaceUrl: true });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Invalid login";
      }
    });
  }

  ngOnDestroy() {
    document.body.classList.remove('admin-bg');
  }
}
