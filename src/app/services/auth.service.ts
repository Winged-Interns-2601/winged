import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IsLoggedService } from './is-logged.service';
import { environment } from '../../environments/environment';

export interface PortfolioUser {
  username?: string;
  email: string;
  password?: string;

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

  name?: string;
  role?: string;
  about?: string;

  skills?: any[];
  projects?: any[];

  portfolio?: {
    designation?: string;
    skills?: any[];
    projects?: any[];
  };

  contact?: {
    email?: string;
    github?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loginLocal(username: string, email?: string) {

  this.currentUser = username;

  localStorage.setItem("CURRENT_USER", username);

  if (email) {
    localStorage.setItem("CURRENT_USER_EMAIL", email);
  }

  this.isLoggedService.loginSuccess(
    localStorage.getItem("TOKEN") || ""
  );
}

  private API = environment.apiUrl;
  private currentUser: string | null = null;
  private STORAGE_KEY = 'PORTFOLIO_USERS';
  

  constructor(
    private http: HttpClient,
    private isLoggedService: IsLoggedService
  ) {}

  /* ================= BACKEND LOGIN ================= */

  loginBackend(username: string, password: string) {
  return this.http.post(`${this.API}/login`, {
    username,
    password
  });
}

  /* ================= TOKEN ================= */

  getToken(): string | null {
    return localStorage.getItem("TOKEN");
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("CURRENT_USER");
    localStorage.removeItem("CURRENT_USER_EMAIL");
    localStorage.removeItem("LOGGED_IN_USER");
    this.isLoggedService.logout();
  }

  /* ================= USER HELPERS ================= */

  getLoggedInUser(): any | null {
    const stored = localStorage.getItem('LOGGED_IN_USER');
    return stored ? JSON.parse(stored) : null;
  }

  getCurrentUser() {
    return localStorage.getItem('CURRENT_USER');
  }

  getCurrentUserEmail() {
    return localStorage.getItem('CURRENT_USER_EMAIL');
  }

  /* ================= LOCAL STORAGE USERS ================= */

  private getAllUsers(): Record<string, PortfolioUser> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  getUserByEmail(email: string): PortfolioUser | null {
    const users = this.getAllUsers();
    return users[email] || null;
  }

  getUserByUsername(username: string): PortfolioUser | null {
    const users = this.getAllUsers();
    for (let user of Object.values(users)) {
      if ((user as any).username === username) {
        return user;
      }
    }
    return null;
  }

  updateUserSkills(email: string, skills: string[]) {
    const users = this.getAllUsers();
    if (users[email]) {
      users[email].skills = skills;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    }
  }
}