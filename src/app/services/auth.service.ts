import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { IsLoggedService } from './is-logged.service';
import { environment } from '../../environments/environment';

export interface PortfolioUser {
  employeeId(employeeId: any): unknown;
  username?: string;
  email: string;
  password?: string;

  firstName?: string;
  middleName?: string;
  lastName?: string;

  phone?: string;

  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pinCode?: string;
  };

  designation?: string;
  employeeType?: string;

  panNO?: string;  // Backend field
  panNo?: string;  // Frontend compatibility
  aadharNo?: string;

  joiningDate?: string;
  exitDate?: string;

  name?: string;
  role?: string;
  about?: string;
  summary?: string;  // Portfolio summary

  skills?: any[];
  projects?: any[];

  portfolio?: {
    designation?: string;
    summary?: string;
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
  private checkingAuth = false;

  constructor(private http: HttpClient, private isLoggedService: IsLoggedService) {}

  isCheckingAuth(): boolean {
    return this.checkingAuth;
  }

  setCheckingAuth(status: boolean): void {
    this.checkingAuth = status;
  }

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

  private API = `${environment.apiUrl}/auth`;
  private currentUser: string | null = null;
  private STORAGE_KEY = 'PORTFOLIO_USERS';

  getRole(): string | null {
    const token = localStorage.getItem('TOKEN');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch (error) {
      console.error('Error decoding token for role:', error);
      return null;
    }
  }

  /* ================= BACKEND LOGIN ================= */

  loginBackend(email: string, password: string) {
  return this.http.post(`${this.API}/login`, {
    email: email,
    password: password
  }).pipe(
    tap((response: any) => {
      // Store the token from login response
      if (response && response.token) {
        localStorage.setItem("TOKEN", response.token);
        console.log('✅ Token stored successfully');
      } else {
        console.error('❌ No token in login response:', response);
      }
    })
  );
}

registerBackend(data: any) {
  return this.http.post(`${this.API}/register`, data);
}

  /* ================= TOKEN ================= */

  getToken(): string | null {
    return localStorage.getItem("TOKEN");
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    // Preserve summary before clearing user data
    const currentUser = this.getLoggedInUser();
    if (currentUser?.summary) {
      localStorage.setItem("PRESERVED_SUMMARY", currentUser.summary);
      console.log('📝 Summary preserved before logout:', currentUser.summary);
    }
    
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("ROLE"); // Clean up any remaining ROLE storage
    localStorage.removeItem("CURRENT_USER");
    localStorage.removeItem("CURRENT_USER_EMAIL");
    localStorage.removeItem("LOGGED_IN_USER");
    this.isLoggedService.logout();
  }

  /* ================= USER HELPERS ================= */

  getLoggedInUser() {
  const user = localStorage.getItem("LOGGED_IN_USER");

  if (!user) {
    console.warn("No user found in localStorage");
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (e) {
    console.error("Invalid user data");
    return null;
  }
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