import { NgClass, NgFor, NgIf, DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
export class AdminComponent implements OnInit, OnDestroy {
  activePage: string = 'dashboard';
  mobileMenuOpen: boolean = false;

  userCount: number = 0;
  employees: any[] = [];
  filteredEmployees: any[] = [];

  employeeTypeFilter: string = '';
  designationFilter: string = '';

  showEditModal: boolean = false;
  editingEmployee: any = null;

  updateForm: any = {
    firstName: '',
    middleName: '',
    lastName: '',
    employeeType: '',
    designation: '',
    email: '',
    phone: '',
    panNO: '',
    aadharNo: '',
    joiningDate: '',
    exitDate: '',
    employeeId: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      pinCode: ''
    }
  };

  constructor(
    private employeeService: EmployeeService,
    private portfolioService: PortfolioService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    this.employeeService.getAllUsers().subscribe({
      next: (data) => {
        this.employees = data;
        this.filteredEmployees = data;   
        this.userCount = data.length;
      },
      error: (err) => {
        console.error(err);
      }
    });

  }

  ngOnDestroy() {}

  // Test Methods (for debugging)
  testModalVisibility() {
    console.log("Modal state:", this.showEditModal);
  }

  testFormPopulation() {
    console.log("Form Data:", this.updateForm);
  }

  // Filter Methods
  applyFilters() {
    this.filteredEmployees = this.employees.filter(emp => {
      const typeMatch = !this.employeeTypeFilter || emp.employeeType === this.employeeTypeFilter;
      const desMatch = !this.designationFilter || emp.designation === this.designationFilter;
      return typeMatch && desMatch;
    });
  }

  // Open Edit Modal
  openEditModal(employee: any) {

    this.editingEmployee = employee;
    this.showEditModal = true;

    this.updateForm = {
      firstName: employee.firstName || '',
      middleName: employee.middleName || '',
      lastName: employee.lastName || '',
      employeeType: employee.employeeType || '',
      designation: employee.designation || '',
      email: employee.email || '',
      phone: employee.phone || '',
      panNO: employee.panNO || '',
      aadharNo: employee.aadharNo || '',
      joiningDate: employee.joiningDate || '',
      exitDate: employee.exitDate || '',
      employeeId: employee.employeeId || '',
      address: {
        street: employee.address?.street || '',
        city: employee.address?.city || '',
        state: employee.address?.state || '',
        country: employee.address?.country || '',
        pinCode: employee.address?.pinCode || ''
      }
    };

  }

  // ✅ Close Modal
  closeEditModal() {
    this.showEditModal = false;
    this.editingEmployee = null;
  }

  // ✅ Update Employee
  saveEditedEmployee() {

    if (!this.editingEmployee) return;

    const employeeData = {
      firstName: this.updateForm.firstName,
      middleName: this.updateForm.middleName,
      lastName: this.updateForm.lastName,
      employeeType: this.updateForm.employeeType,
      designation: this.updateForm.designation,
      email: this.updateForm.email,
      phone: this.updateForm.phone,
      panNO: this.updateForm.panNO,
      aadharNo: this.updateForm.aadharNo,
      joiningDate: this.updateForm.joiningDate,
      exitDate: this.updateForm.exitDate,
      address: this.updateForm.address
    };

    const id = this.editingEmployee.id;

    this.employeeService.updateEmployee(id, employeeData)
      .subscribe({

        next: (res) => {

          const index = this.employees.findIndex(e => e.id === id);

          if (index !== -1) {
            this.employees[index] = { ...this.employees[index], ...employeeData };
          }

          alert("Employee updated successfully");

          this.closeEditModal();

        },

        error: (err) => {
          console.error(err);
          alert("Update failed");
        }

      });

  }

  logout() {
    this.auth.logout();
  }

  // Toggle Mobile Menu
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  // Delete Portfolio
  deletePortfolio(id: number) {
    if (!confirm("Delete portfolio?")) return;

    this.portfolioService.deletePortfolio(id).subscribe({
      next: () => {
        alert("Portfolio deleted");

        this.employees = this.employees.map(emp =>
          emp.portfolio?.id === id
            ? { ...emp, portfolio: null }
            : emp
        );
      },
      error: (err) => {
        console.error(err);
        alert("Delete failed");
      }
    });
  }

}