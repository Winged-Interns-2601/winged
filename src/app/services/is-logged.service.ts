import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IsLoggedService {

  isLoggedIn = false;
  showLogin = false;
  showRegister = false;

  constructor() {
    // Check localStorage on service initialization
    this.checkLoggedInStatus();
  }

  openLogin() {
    this.showLogin = true;
    this.showRegister = false;
    this.isLoggedIn = false;
  }
  
  loginSuccess(token?: any) {
  this.isLoggedIn = true;
  if (token) {
    localStorage.setItem('TOKEN', token);
  }
}

  openRegister() {
    this.showLogin = false;
    this.showRegister = true;
  }

  logout() {
    this.isLoggedIn = false;
    this.showLogin = true;
    this.showRegister = false;
    // Remove token from localStorage
    localStorage.removeItem('TOKEN');
  }

checkLoggedInStatus() {
  const token = localStorage.getItem('TOKEN');
    if (token) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
  }
}
