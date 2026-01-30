import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { PORTFOLIO_DATA } from '../data/portfolio-data';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private isLoggedService: IsLoggedService
  ) {}

  login() {
    this.errorMessage = '';
    
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    const email = this.email.toLowerCase().trim();
    
    // Check if user exists
    if (!this.auth.userExists(email)) {
      this.errorMessage = `User with email "${this.email}" not found. Please register first!`;
      return;
    }

    // Get user data and verify password
    const userData = this.auth.getUserByEmail(email);
    if (userData && userData.password === this.password) {
      this.auth.login(userData.username);
      this.isLoggedService.loginSuccess(userData.username);
      this.router.navigate(['/portfolio']);
    } else {
      this.errorMessage = 'Invalid password!';
    }
  }
}
