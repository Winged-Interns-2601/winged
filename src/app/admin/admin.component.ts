import { NgClass, NgFor, NgIf, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';  // ← Add OnInit import
import { EmployeeService } from '../services/employee.service';
import { PortfolioService } from '../services/portfolio.service';
import { AuthService } from '../services/auth.service';
import { ProjectsService } from '../services/projects.service';


@Component({
  selector: 'app-admin',
  imports: [NgIf, NgClass, NgFor, DatePipe],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {  
    activePage: string = 'dashboard'; 

    userCount: number = 0;
    employees: any[] = [];

    constructor(
        private auth: AuthService,
        private employeeService: EmployeeService,
        private projectsService: ProjectsService,

         private portfolioService: PortfolioService) {}

    ngOnInit() {  
        console.log('Admin component initialized');
        console.log('API endpoint:', 'http://localhost:8080/api/employees/count');

        this.employeeService.getUserCount().subscribe({
            next: (count) => {
                console.log('User count API response:', count);
                console.log('Type of count:', typeof count);
                this.userCount = count;
                console.log('User count loaded:', count);
            },
            error: (err) => {
                console.error('Failed to load user count:', err);
                console.error('Error status:', err.status);
                console.error('Error message:', err.message);
                this.userCount = 0;
            }
        });

        this.employeeService.getAllUsers().subscribe(employees => {
            console.log('Raw employee data:', employees);
            this.employees = employees;
            
            // Fallback: use actual employee count if API count failed
            if (this.userCount === 0 && employees.length > 0) {
                this.userCount = employees.length;
                console.log('Using employee array length as user count:', this.userCount);
            }
            
            if (employees.length > 0) {
                console.log('First employee structure:', employees[0]);
                console.log('Available fields:', Object.keys(employees[0]));
            }
            
this.employees = employees.sort((a, b) => {
  const loginA = a.lastLoginTime || a.lastLogin || a.loginTime || a.lastLoginAt;
  const loginB = b.lastLoginTime || b.lastLogin || b.loginTime || b.lastLoginAt;

  if (loginA && loginB) {
    return new Date(loginA).getTime() - new Date(loginB).getTime();
  }

  if (loginA) return 1;
  if (loginB) return -1;

  return 0;
});

        });
    }


deletePortfolio(employeeId: number) {

  if (!confirm('Delete entire portfolio?')) return;

  this.portfolioService.deletePortfolio(employeeId).subscribe({
    next: (res) => {
      console.log('Portfolio deleted', res);

      // instantly update UI
      this.projectsService.clear();

      alert('Portfolio deleted successfully');
    },
    error: (err) => {
      console.error('Delete failed', err);
      alert('Delete failed');
    }
  });
}


}