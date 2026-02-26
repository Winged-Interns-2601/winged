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
  
  // loginSuccess(token?: any) {
  //   this.isLoggedIn = true;
  //   this.showLogin = false;
  //   this.showRegister = false;
  //   // Save token to localStorage so user stays logged in
  //   if (token) {
  //     localStorage.setItem('authToken', JSON.stringify(token));
  //   } else {
  //     localStorage.setItem('authToken', 'true');
  //   }
  //   console.log('✅ Token saved to localStorage');
  // }

  loginSuccess(token: string) {
  this.isLoggedIn = true;
  localStorage.setItem('TOKEN', token);
}

  openRegister() {
    this.showLogin = false;
    this.showRegister = true;
  }

  // logout() {
  //   this.isLoggedIn = false;
  //   this.showLogin = true;
  //   this.showRegister = false;
  //   // Remove token from localStorage
  //   localStorage.removeItem('authToken');
  // }

  logout() {
  this.isLoggedIn = false;
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
