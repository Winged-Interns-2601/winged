import { NgClass, NgFor, NgIf, DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { PortfolioService } from '../services/portfolio.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgIf, NgClass, NgFor, DatePipe, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {  
    activePage: string = 'dashboard'; 

    // Mobile menu properties
    mobileMenuOpen: boolean = false;

    userCount: number = 0;
    employees: any[] = [];
    employeeTypeFilter: string = '';
    designationFilter: string = '';

editingEmployee: any = null;
showEditModal: boolean = false;

editForm: any = {};
  isLoggedService: any;
  router: any;

    constructor(
        private auth: AuthService,
        private employeeService: EmployeeService,
        private portfolioService: PortfolioService,
        private cdr: ChangeDetectorRef
    ) {
        console.log('🚀 AdminComponent initialized!');
    }

    ngOnInit() {  

        document.body.classList.add('admin-bg');

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

        this.employeeService.getAllUsers().subscribe({
            next: (employees) => {
                console.log('Raw employee data:', employees);
                this.employees = employees.sort((a, b) => {
                  const loginA = new Date(a.lastLoginTime || a.lastLogin || 0).getTime();
                  const loginB = new Date(b.lastLoginTime || b.lastLogin || 0).getTime();
                  return loginB - loginA; // latest login first
                });
                
                // Fallback: use actual employee count if API count failed
                if (this.userCount === 0 && employees.length > 0) {
                    this.userCount = employees.length;
                    console.log('Using employee array length as user count:', this.userCount);
                }
                
                if (employees.length > 0) {
                    console.log('First employee structure:', employees[0]);
                    console.log('Available fields:', Object.keys(employees[0]));
                }
            },
            error: (err) => {
                console.error('Failed to load employees:', err);
                console.error('Error status:', err.status);
                console.error('Error message:', err.message);
            }
        });
    }

    deletePortfolio(portfolioId?: number) {
      console.log("Deleting portfolioId:", portfolioId);
      console.log("Type of portfolioId:", typeof portfolioId);

      if (!portfolioId) {
        alert('Portfolio not found');
        return;
      }

      if (!confirm('Delete entire portfolio?')) return;

      this.portfolioService.deletePortfolio(portfolioId).subscribe({
        next: (res) => {
          console.log('Portfolio deleted successfully', res);

          // Clear portfolio reference instead of removing employee entirely
          // This prevents adding projects to deleted portfolios
          this.employees = this.employees.map(emp => 
            emp.portfolio?.id === portfolioId 
              ? { ...emp, portfolio: null } 
              : emp
          );
          
          // Force UI update to disable delete button immediately
          this.cdr.detectChanges();
          
          // Always show success message for successful deletion (2xx status)
          alert('Portfolio deleted successfully');
        },
        error: (err) => {
          console.error('Delete failed', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.error?.message);
          console.error('Full error:', err);
          
          // Check specific error codes for better user feedback
          if (err.status === 404) {
            alert('Portfolio does not exist');
          } else if (err.status === 400) {
            // Check the error message for "not found"
            const errorMessage = err.error?.message || '';
            if (errorMessage.toLowerCase().includes('not found') || 
                errorMessage.toLowerCase().includes('does not exist') ||
                errorMessage.toLowerCase().includes('no portfolio')) {
              alert('Portfolio does not exist');
            } else {
              alert('portfolio already delete ');
            }
          } else if (err.status !== 200 && err.status !== 204) {
            alert('portfolio already delete ');
          }
        }
      });
    }

    ngOnDestroy() {
        document.body.classList.remove('admin-bg');
    }

    get filteredEmployees() {
      return this.employees.filter(emp => {

        const matchEmployeeType =
          !this.employeeTypeFilter ||
          emp.employeeType?.toLowerCase() ===
          this.employeeTypeFilter.toLowerCase();

        const matchDesignation =
          !this.designationFilter ||
          emp.designation?.toLowerCase() ===
          this.designationFilter.toLowerCase();

        return matchEmployeeType && matchDesignation;
      });
    }

    // Mobile menu toggle
    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

     logout() {
    this.auth.logout();
    this.isLoggedService.logout();
    this.router.navigate(['/login']);
  }

    openEditModal(employee: any) {

  this.editingEmployee = employee;
  this.showEditModal = true;
    this.editForm = { ...employee };   // copy employee data


  // deep copy employee
  this.editForm = JSON.parse(JSON.stringify(employee));

}

closeModal(){
  this.showEditModal = false;
  this.editingEmployee = null;
}

saveEmployeeUpdate() {

  if (!this.editingEmployee) return;

  const id = this.editingEmployee.id;  // use DB id
  
  // DEBUG: Log all data before sending
  console.log('=== UPDATE DEBUG START ===');
  console.log('Editing Employee ID:', id);
  console.log('Edit Form Data:', this.editForm);
  
  const token = localStorage.getItem('TOKEN');
  console.log('Token from localStorage:', token ? 'EXISTS' : 'MISSING');
  console.log('Token value (first 20 chars):', token ? token.substring(0, 20) + '...' : 'null');

  const updatedEmployee = {
    firstName: this.editForm.firstName,
    lastName: this.editForm.lastName,
    email: this.editForm.email,
    phone: this.editForm.phone
    
  };
  
  console.log('Updated Employee Object:', updatedEmployee);
  console.log('=== UPDATE DEBUG END ===');

  this.employeeService.updateEmployee(id, updatedEmployee)
    .subscribe({
      next: (response) => {
        console.log(' Update SUCCESS:', response);

        const index = this.employees.findIndex(e => e.id === id);

        if (index !== -1) {
          this.employees[index] = { ...this.employees[index], ...updatedEmployee };
        }

        // alert("Employee updated successfully");

        this.showEditModal = false;
        this.editingEmployee = null;

      },
      error: (err) => {
        console.error(' Update ERROR:', err);
        console.error('Error status:', err.status);
        console.error('Error statusText:', err.statusText);
        console.error('Error URL:', err.url);
        console.error('Error headers:', err.headers);
        console.error('Full error object:', err);
        
        // Specific error messages
        if (err.status === 403) {
          alert('403 Forbidden: You do not have permission to update this employee');
        } else if (err.status === 401) {
          alert('401 Unauthorized: Please login again');
        } else {
          alert(`Update failed: ${err.status} ${err.statusText}`);
        }
      }
    });
}
}