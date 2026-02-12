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

        this.employeeService.getUserCount().subscribe(count => {
            this.userCount = count;
        });
        

        this.employeeService.getAllUsers().subscribe(employees => {
            console.log('Raw employee data:', employees);
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