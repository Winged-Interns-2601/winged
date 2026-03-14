import { NgClass, NgFor, NgIf, DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { PortfolioService } from '../services/portfolio.service';
import { AuthService } from '../services/auth.service';
import { ProjectsService } from '../services/projects.service';
import { IsLoggedService } from '../services/is-logged.service';

@Component({
  selector: 'app-admin',
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

    // Update modal properties
    showUpdateModal: boolean = false;
    selectedEmployee: any = null;
    
    // Edit employee modal properties
    showEditModal: boolean = false;
    editingEmployee: any = null;
    editForm: any = {
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

    openEditModal(employee: any) {
        this.editingEmployee = employee;
        this.showEditModal = true;
        this.editForm = {
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

    closeEditModal() {
        this.showEditModal = false;
        this.editingEmployee = null;
    }

    submitEditForm() {
        if (!this.editingEmployee) return;
        this.employeeService.updateEmployee(this.editingEmployee.id, this.editForm)
            .subscribe({
                next: (updated: any) => {
                    // Update local employee list
                    const idx = this.employees.findIndex(e => e.id === this.editingEmployee.id);
                    if (idx !== -1) this.employees[idx] = updated;
                    this.closeEditModal();
                },
                error: (err) => {
                    alert('Failed to update employee');
                }
            });
    }
    
    updateForm: any = {
        // Basic Employee Info
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
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            pinCode: ''
        },
        // Portfolio Data
        skills: [] as string[],
        projects: [] as any[],
        summary: ''
    };
    newSkill: string = '';
    newProject: any = {
        projectName: '',
        description: '',
        techStack: '',
        summary: ''
    };

    constructor(
        private auth: AuthService,
        private employeeService: EmployeeService,
        private projectsService: ProjectsService,
        private portfolioService: PortfolioService,
        private router: Router,  
        private cdr: ChangeDetectorRef,  
        private isLoggedService: IsLoggedService
    ) {
        console.log('🚀 AdminComponent initialized!');
        console.log('🔧 Available methods:', {
            openEditModal: typeof this.openEditModal,
            closeEditModal: typeof this.closeEditModal,
            saveEditedEmployee: typeof this.saveEditedEmployee
        });
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

  console.log("Deleting employeeId:", employeeId);
  console.log("Type of employeeId:", typeof employeeId);

  if (!confirm('Delete entire portfolio?')) return;

  this.portfolioService.deletePortfolio(employeeId).subscribe({
    next: (res) => {
      console.log('Portfolio deleted successfully', res);

      // Clear portfolio reference instead of removing employee entirely
      // This prevents adding projects to deleted portfolios
      this.employees = this.employees.map(emp => 
        emp.portfolio?.id === employeeId 
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
      // If status is 200 or 204, it's actually a successful deletion
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



    // Modal management methods
    closeUpdateModal() {
        this.showUpdateModal = false;
        this.selectedEmployee = null;
        this.updateForm = {
            // Basic Employee Info
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
            address: {
                street: '',
                city: '',
                state: '',
                country: '',
                pinCode: ''
            },
            // Portfolio Data
            skills: [],
            projects: [],
            summary: ''
        };
    }

    // Skill management
    addSkill() {
        const skill = this.newSkill.trim();
        if (skill && !this.updateForm.skills.includes(skill)) {
            this.updateForm.skills.push(skill);
            this.newSkill = '';
        }
    }

    removeSkill(skill: string) {
        const index = this.updateForm.skills.indexOf(skill);
        if (index > -1) {
            this.updateForm.skills.splice(index, 1);
        }
    }

    // Project management
    addProject() {
        if (this.newProject.projectName || this.newProject.techStack) {
            this.updateForm.projects.push({...this.newProject});
            this.newProject = {
                projectName: '',
                description: '',
                techStack: '',
                summary: ''
            };
        }
    }

    removeProject(index: number) {
        this.updateForm.projects.splice(index, 1);
    }

    // Save updated portfolio
    saveUpdatedPortfolio() {
        if (!this.selectedEmployee) return;

        const portfolioData = {
            skills: this.updateForm.skills,
            designation: this.updateForm.designation,
            summary: this.updateForm.summary,
            projects: this.updateForm.projects
        };

        console.log('Saving portfolio data:', portfolioData);

        // Update employee basic info
        const employeeData = {
            designation: this.updateForm.designation,
            employeeType: this.updateForm.employeeType,
            email: this.updateForm.email,
            phone: this.updateForm.phone
        };

        // Update portfolio
        if (this.selectedEmployee.portfolio?.id) {
            this.portfolioService.updatePortfolio(this.selectedEmployee.portfolio.id, portfolioData).subscribe({
                next: (response) => {
                    console.log('Portfolio updated successfully:', response);
                    
                    // Update local employee data immediately
                    this.updateLocalEmployeeData();
                    
                    alert('Portfolio updated successfully!');
                    this.closeUpdateModal();
                },
                error: (error) => {
                    console.error('Portfolio update failed:', error);
                    alert('Portfolio update failed!');
                }
            });
        } else {
            // Create new portfolio if it doesn't exist
            this.portfolioService.addPortfolio(this.selectedEmployee.employeeId, portfolioData).subscribe({
                next: (response) => {
                    console.log('Portfolio created successfully:', response);
                    
                    // Update local employee data immediately
                    this.updateLocalEmployeeData();
                    
                    alert('Portfolio created successfully!');
                    this.closeUpdateModal();
                },
                error: (error) => {
                    console.error('Portfolio creation failed:', error);
                    alert('Portfolio creation failed!');
                }
            });
        }
    }

    // Update local employee data immediately after save
    updateLocalEmployeeData() {
        if (!this.selectedEmployee) return;

        // Find the employee in the local array and update it
        const employeeIndex = this.employees.findIndex(emp => emp.employeeId === this.selectedEmployee.employeeId);
        
        if (employeeIndex !== -1) {
            // Update employee basic info
            this.employees[employeeIndex] = {
                ...this.employees[employeeIndex],
                designation: this.updateForm.designation,
                employeeType: this.updateForm.employeeType,
                email: this.updateForm.email,
                phone: this.updateForm.phone,
                firstName: this.updateForm.firstName,
                middleName: this.updateForm.middleName,
                lastName: this.updateForm.lastName,
                panNO: this.updateForm.panNO,
                aadharNo: this.updateForm.aadharNo,
                joiningDate: this.updateForm.joiningDate,
                exitDate: this.updateForm.exitDate,
                address: this.updateForm.address,
                panNo: this.updateForm.panNo,
                bankName: this.updateForm.bankName,
                bankAccount: this.updateForm.bankAccount,
                ifscCode: this.updateForm.ifscCode
            };
            
            // Update portfolio data if portfolio exists
            if (this.employees[employeeIndex].portfolio) {
                this.employees[employeeIndex].portfolio = {
                    ...this.employees[employeeIndex].portfolio,
                    skills: this.updateForm.skills,
                    designation: this.updateForm.designation,
                    summary: this.updateForm.summary,
                    projects: this.updateForm.projects
                };
            } else {
                // Create portfolio object if it didn't exist - SET THE ID!
                this.employees[employeeIndex].portfolio = {
                    id: 'portfolio_' + this.selectedEmployee.employeeId, // Temporary ID for UI
                    skills: this.updateForm.skills,
                    designation: this.updateForm.designation,
                    summary: this.updateForm.summary,
                    projects: this.updateForm.projects
                };
            }
            
            console.log(' Local employee data updated:', this.employees[employeeIndex]);
            console.log(' Portfolio ID set:', this.employees[employeeIndex].portfolio?.id);
        }
    }

  // Mobile menu toggle
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

logout() {
this.auth.logout();
}

// Open edit modal for quick employee editing

// Test methods for debugging
testModalVisibility() {
    console.log('🧪 Test: Modal visibility test');
    console.log('Current showEditModal:', this.showEditModal);
    this.showEditModal = !this.showEditModal;
    console.log('✅ Modal toggled to:', this.showEditModal);
    this.cdr.detectChanges();
}

testFormPopulation() {
    console.log('🧪 Test: Form population test');
    console.log('Current editForm:', this.editForm);
    console.log('Current editingEmployee:', this.editingEmployee);
    
    if (this.editingEmployee) {
        this.editForm = {
            firstName: this.editingEmployee.firstName || '',
            middleName: this.editingEmployee.middleName || '',
            lastName: this.editingEmployee.lastName || '',
            employeeType: this.editingEmployee.employeeType || '',
            designation: this.editingEmployee.designation || '',
            email: this.editingEmployee.email || '',
            phone: this.editingEmployee.phone || '',
            panNO: this.editingEmployee.panNO || this.editingEmployee.panNo || '',
            aadharNo: this.editingEmployee.aadharNo || '',
            joiningDate: this.editingEmployee.joiningDate || '',
            exitDate: this.editingEmployee.exitDate || ''
        };
        
        console.log('✅ Form populated with test data');
        this.cdr.detectChanges();
    } else {
        console.error('❌ No editingEmployee to test with!');
    }
}
saveEditedEmployee() {
    if (!this.editingEmployee) return;

    const employeeData = {
        firstName: this.editForm.firstName,
        lastName: this.editForm.lastName,
        employeeType: this.editForm.employeeType,
        designation: this.editForm.designation,
        email: this.editForm.email,
        phone: this.editForm.phone,
        address: this.editForm.address,
        aadharNo: this.editForm.aadharNo,
        panNO: this.editForm.panNO,
        joiningDate: this.editForm.joiningDate,
        exitDate: this.editForm.exitDate,
        employeeId: this.editForm.employeeId
    };

    const employeeId = this.editingEmployee.id || this.editingEmployee.employeeId;
    console.log('Saving edited employee:', employeeId, employeeData);

    this.employeeService.updateEmployee(employeeId, employeeData)
        .subscribe({
            next: (res) => {
                console.log("Employee updated successfully", res);

                // Update local employee data
               const index = this.employees.findIndex(emp => 
  emp.employeeId === employeeId || emp.id === employeeId
);
                if (index !== -1) {
                    this.employees[index] = { ...this.employees[index], ...employeeData };
                }

                alert('Employee updated successfully!');
                this.closeEditModal();
            },
            error: (err) => {
                console.error("Error updating employee", err);
                alert('Failed to update employee!');
            }
        });
}

// Open update modal and populate form with employee data
openUpdateModal(employee: any) {
this.selectedEmployee = employee;
this.updateForm = {
// Basic Employee Info from admin table
firstName: employee.firstName || '',
middleName: employee.middleName || '',
lastName: employee.lastName || '',
employeeType: employee.employeeType || '',
designation: employee.designation || '',
email: employee.email || '',
phone: employee.phone || '',
panNO: employee.panNO || employee.panNo || '',
aadharNo: employee.aadharNo || '',
joiningDate: employee.joiningDate || '',
exitDate: employee.exitDate || '',
address: {
street: employee.address?.street || '',
city: employee.address?.city || '',
state: employee.address?.state || '',
country: employee.address?.country || '',
pinCode: employee.address?.pinCode || ''
},
// Portfolio Data
skills: employee.portfolio?.skills || [],
projects: employee.portfolio?.projects || [],
summary: employee.portfolio?.summary || ''
};
this.showUpdateModal = true;
console.log('Update form populated with employee data:', this.updateForm);
}

// Update employee data
updateEmployeeData() {
if (!this.selectedEmployee) return;

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

console.log('Updating employee:', this.selectedEmployee.id, employeeData);

this.employeeService.updateEmployee(this.selectedEmployee.id, employeeData)
.subscribe({
next: (res) => {
console.log("Employee updated successfully", res);

// Update local employee data
const index = this.employees.findIndex(emp => emp.id === this.selectedEmployee.id);
if (index !== -1) {
this.employees[index] = { ...this.employees[index], ...employeeData };
}

alert('Employee updated successfully!');
this.closeUpdateModal();
},
error: (err) => {
console.error("Error updating employee", err);
alert('Failed to update employee!');
}
});
}


}