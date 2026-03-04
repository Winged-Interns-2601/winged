import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IsLoggedService {

  showLogin = false;
  showRegister = false;

  // ⭐ ALWAYS READ FROM TOKEN
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('TOKEN');
  }

  loginSuccess(token?: string) {
    if (token) {
      localStorage.setItem('TOKEN', token);
    }
  }

  logout() {
    localStorage.removeItem('TOKEN');
    localStorage.removeItem('CURRENT_USER');
    localStorage.removeItem('CURRENT_USER_EMAIL');
    localStorage.removeItem('LOGGED_IN_USER');
  }

  checkLoggedInStatus() {
    // no need anymore
  }
}
