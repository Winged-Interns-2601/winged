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
      this.errorMessage = 'Please enter email and password';
      return;
    }

    const email = this.email.toLowerCase().trim();
    
    console.log('Attempting login with email:', email);
    
    // Use employee service to validate against database
    this.employeeService.getByEmail(email).subscribe({
      next: (employee: any) => {
        console.log('Found employee in database:', employee);
        
        // For now, accept any password since we don't have password validation in backend
        // In production, you should add password field to employee entity and validate here
        if (employee) {
          localStorage.setItem('LOGGED_IN_USER', JSON.stringify(employee));
          const username = employee.firstName || email.split('@')[0];
          this.auth.loginLocal(username, email);
          this.isLoggedService.loginSuccess(username);
          this.router.navigate(['/portfolio']);
        } else {
          this.errorMessage = 'User not found!';
        }
      },
      error: (err: any) => {
        console.error('Login failed:', err);
        this.errorMessage = 'User not found. Please register first!';
      }
    });
  }
}
