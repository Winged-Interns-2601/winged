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
    
    // Call Spring Boot API to get user by email
    this.employeeService.getByEmail(email).subscribe({
      next: (employee: any) => {
        // Store the backend user object as the logged-in user
        localStorage.setItem('LOGGED_IN_USER', JSON.stringify(employee));
        const userData = this.auth.getUserByEmail(email);
        if (userData && userData.password === this.password) {
          this.auth.login(userData.username, userData.email);
          this.isLoggedService.loginSuccess(userData.username);
          this.router.navigate(['/portfolio']);
        } else {
          this.errorMessage = 'Invalid password!';
        }
      },
      error: (err) => {
        this.errorMessage = 'User not found. Please register first!';
      }
    });
  }
}
