import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { PORTFOLIO_DATA } from '../data/portfolio-data';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  formData = {
    username: '',
    email: '',
    password: ''
  };

  constructor(private auth: AuthService, private router: Router, private isLoggedService: IsLoggedService) {}

  ngOnInit() {
    // Check if username is provided in query params to pre-fill
    // This allows pre-filling default user data
  }

  prefillDefaultUser(username: string) {
    // Method removed - no longer auto-filling default users
  }

  register() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.formData.username || !this.formData.email || !this.formData.password) {
      this.errorMessage = 'Username, Email, and Password are required!';
      return;
    }

    const username = this.formData.username.toLowerCase().trim();
    const email = this.formData.email.toLowerCase().trim();

    // Try to register user in memory
    const success = this.auth.registerUser(email, username, this.formData.password);
    
    if (!success) {
      this.errorMessage = 'Username or Email already exists. Please choose different ones.';
      return;
    }

    this.successMessage = 'Registration successful! Logging in...';

    // Auto-login
    setTimeout(() => {
      this.auth.login(username);
      this.isLoggedService.loginSuccess(username);
      this.router.navigate(['/portfolio']);
    }, 1500);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}