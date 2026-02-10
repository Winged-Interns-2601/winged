import { Injectable } from '@angular/core';
import { IsLoggedService } from './is-logged.service';

export interface PortfolioUser {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  designation?: string;
  employeeType?: string;
  panNO?: string;
  aadharNo?: string;
  joiningDate?: string;
  exitDate?: string;
  name: string;
  role: string;
  about: string;
  skills: any[];
  projects: any[];
  contact: {
    email: string;
    github: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: string | null = null;
  private STORAGE_KEY = 'PORTFOLIO_USERS';

  constructor(private isLoggedService: IsLoggedService) {}

  login(username: string, email?: string) {
    this.currentUser = username;
    localStorage.setItem('CURRENT_USER', username);
    if (email) {
      localStorage.setItem('CURRENT_USER_EMAIL', email);
    }
    this.isLoggedService.loginSuccess(username);
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('CURRENT_USER');
    localStorage.removeItem('CURRENT_USER_EMAIL');
    localStorage.removeItem('LOGGED_IN_USER');
    this.isLoggedService.logout();
  }

  getCurrentUser() {
    if (!this.currentUser) {
      this.currentUser = localStorage.getItem('CURRENT_USER');
    }
    return this.currentUser;
  }

  getCurrentUserEmail(): string | null {
    return localStorage.getItem('CURRENT_USER_EMAIL');
  }

  getLoggedInUser(): any | null {
    const stored = localStorage.getItem('LOGGED_IN_USER');
    return stored ? JSON.parse(stored) : null;
  }

  isLoggedInStatus(): boolean {
    return this.currentUser !== null;
  }

  // Register a new user in localStorage
  registerUser(email: string, username: string, password: string, extra?: Partial<PortfolioUser>): boolean {
    const users = this.getAllUsers();

    // Check if email or username already exists
    for (let user of Object.values(users)) {
      if ((user as any).email === email || (user as any).username === username) {
        return false; // Already exists
      }
    }

    // Store user in localStorage
    const user: PortfolioUser = {
      username,
      email,
      password,
      firstName: extra?.firstName ?? '',
      middleName: extra?.middleName ?? '',
      lastName: extra?.lastName ?? '',
      phone: extra?.phone ?? '',
      address: extra?.address ?? '',
      city: extra?.city ?? '',
      state: extra?.state ?? '',
      country: extra?.country ?? '',
      pinCode: extra?.pinCode ?? '',
      designation: extra?.designation ?? '',
      employeeType: extra?.employeeType ?? '',
      panNO: extra?.panNO ?? '',
      aadharNo: extra?.aadharNo ?? '',
      joiningDate: extra?.joiningDate ?? '',
      exitDate: extra?.exitDate ?? '',
      name: extra?.name ?? '',
      role: extra?.role ?? '',
      about: extra?.about ?? '',
      skills: extra?.skills ?? [],
      projects: extra?.projects ?? [],
      contact: {
        email,
        github: extra?.contact?.github ?? ''
      }
    };

    users[email] = user;

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    return true; // Success
  }

  // Get all users from localStorage
  private getAllUsers(): Record<string, PortfolioUser> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  // Check if user exists by email
  userExists(email: string): boolean {
    const users = this.getAllUsers();
    return email in users;
  }

  // Get user by email
  getUserByEmail(email: string): PortfolioUser | null {
    const users = this.getAllUsers();
    return users[email] || null;
  }

  // Get user by username
  getUserByUsername(username: string): PortfolioUser | null {
    const users = this.getAllUsers();
    for (let user of Object.values(users)) {
      if ((user as any).username === username) {
        return user;
      }
    }
    return null;
  }
}
