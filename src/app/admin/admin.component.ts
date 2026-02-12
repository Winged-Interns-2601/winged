import { NgClass, NgFor, NgIf, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';  // ← Add OnInit import
import { EmployeeService } from '../services/employee.service';

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

    constructor(private employeeService: EmployeeService) {}

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
                // Try different possible field names for login time
                const loginA = a.lastLoginTime || a.lastLogin || a.loginTime || a.lastLoginAt;
                const loginB = b.lastLoginTime || b.lastLogin || b.loginTime || b.lastLoginAt;
                
                if (loginA && loginB) {
                    return new Date(loginB).getTime() - new Date(loginA).getTime();
                }
                
                if (loginA) return -1;
                if (loginB) return 1;
                
                // Fallback to joining date
                const dateA = a.joiningDate ? new Date(a.joiningDate) : new Date(0);
                const dateB = b.joiningDate ? new Date(b.joiningDate) : new Date(0);
                return dateB.getTime() - dateA.getTime();
            });
        });
    }
}