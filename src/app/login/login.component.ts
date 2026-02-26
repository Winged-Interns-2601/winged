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

  // login() {
  //   this.errorMessage = '';
    
  //   if (!this.email.trim() || !this.password.trim()) {
  //     this.errorMessage = 'Please enter email and password';
  //     return;
  //   }

  //   const email = this.email.toLowerCase().trim();
    
  //   console.log('=== LOGIN DEBUG ===');
  //   console.log('Attempting login with email:', email);
  //   console.log('Password entered:', this.password ? 'YES' : 'NO');
    
  //   // Use employee service to validate against database
  //   this.employeeService.getByEmail(email).subscribe({
  //     next: (employee: any) => {
  //       console.log('Backend response:', employee);
        
  //       if (employee && employee.email === email) {
  //         console.log('✅ Found employee:', employee);
  //         console.log('✅ Employee password:', employee.password);
  //         console.log('✅ Entered password:', this.password);
          
  //         // Validate password
  //         if (employee.password === this.password) {
  //           console.log('✅ Password validation successful');
  //           localStorage.setItem('LOGGED_IN_USER', JSON.stringify(employee));
  //           const username = employee.firstName || email.split('@')[0];
  //           console.log('✅ Username:', username);
            
  //           // Update auth services
  //           this.auth.loginLocal(username, email);
  //           console.log('✅ Auth service updated');
            
  //           this.isLoggedService.loginSuccess(username);
  //           console.log('✅ IsLoggedService updated, isLoggedIn:', this.isLoggedService.isLoggedIn);
            
  //           console.log('✅ Navigating to portfolio...');
  //           this.router.navigate(['/portfolio']);
  //         } else {
  //           console.log('❌ Password validation failed');
  //           this.errorMessage = 'Invalid password!';
  //         }
  //       } else {
  //         console.log('❌ Employee not found');
  //         this.errorMessage = 'User not found!';
  //       }
  //     },
  //     error: (err: any) => {
  //       console.error('❌ Login failed:', err);
  //       this.errorMessage = 'Login failed. Please try again!';
  //     }
  //   });
  // }

login() {

  if (!this.email || !this.password) return;

  const email = this.email.toLowerCase().trim();

  this.auth.loginBackend(email, this.password).subscribe({

    next: (res: any) => {

      // res is TOKEN string
      localStorage.setItem("TOKEN", res);

      this.isLoggedService.loginSuccess(res);

      this.router.navigate(['/portfolio']);
    },

    error: () => {
      this.errorMessage = "Invalid login";
    }
  });
}
}
