import { Injectable } from '@angular/core';
import { IsLoggedService } from './is-logged.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: string | null = null;
  private STORAGE_KEY = 'PORTFOLIO_USERS';

  constructor(private isLoggedService: IsLoggedService) {}

  login(username: string) {
    this.currentUser = username;
    localStorage.setItem('CURRENT_USER', username);
    this.isLoggedService.loginSuccess(username);
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('CURRENT_USER');
    this.isLoggedService.logout();
  }

  getCurrentUser() {
    if (!this.currentUser) {
      this.currentUser = localStorage.getItem('CURRENT_USER');
    }
    return this.currentUser;
  }

  isLoggedInStatus(): boolean {
    return this.currentUser !== null;
  }

  // Register a new user in localStorage
  registerUser(email: string, username: string, password: string): boolean {
    const users = this.getAllUsers();

    // Check if email or username already exists
    for (let user of Object.values(users)) {
      if ((user as any).email === email || (user as any).username === username) {
        return false; // Already exists
      }
    }

    // Store user in localStorage
    users[email] = {
      username,
      email,
      password,
      name: '',
      role: '',
      about: '',
      skills: [],
      projects: [],
      contact: {
        email,
        github: ''
      }
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    return true; // Success
  }

  // Get all users from localStorage
  private getAllUsers(): any {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  // Check if user exists by email
  userExists(email: string): boolean {
    const users = this.getAllUsers();
    return email in users;
  }

  // Get user by email
  getUserByEmail(email: string): any {
    const users = this.getAllUsers();
    return users[email] || null;
  }

  // Get user by username
  getUserByUsername(username: string): any {
    const users = this.getAllUsers();
    for (let user of Object.values(users)) {
      if ((user as any).username === username) {
        return user;
      }
    }
    return null;
  }
}
