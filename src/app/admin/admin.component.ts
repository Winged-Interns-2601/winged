import { NgClass, NgFor, NgIf, DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';  // ← Add Router import
import { EmployeeService } from '../services/employee.service';
import { PortfolioService } from '../services/portfolio.service';
import { AuthService } from '../services/auth.service';
import { ProjectsService } from '../services/projects.service';


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
        private router: Router,  // ← Add Router
        private cdr: ChangeDetectorRef  // ← Add ChangeDetectorRef
    ) {}

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

updatePortfolioData(employeeId: number, employeeData: any) {
        // Check if this is the logged-in user
        const loggedInUser = this.auth.getLoggedInUser();
        const isLoggedInUser = loggedInUser && loggedInUser.employeeId === employeeId;
        
        console.log('Updating employee:', employeeId, 'Logged-in user:', loggedInUser?.employeeId, 'Is same user:', isLoggedInUser);
        
        if (isLoggedInUser) {
            // If updating logged-in user, redirect to profile page
            console.log('Redirecting to profile page for logged-in user update');
            this.router.navigate(['/profile']);
            return;
        }
        
        // If updating other user, show confirmation dialog
        const confirmUpdate = confirm('You are trying to update another user\'s data. Do you want to login first?\n\nClick "OK" to go to login page\nClick "Cancel" to stay here');
        
        if (confirmUpdate) {
            // User confirmed - redirect to login
            console.log('User confirmed - Redirecting to login page for other user update');
            this.router.navigate(['/login']);
        } else {
            // User cancelled - stay on admin page
            console.log('User cancelled - Staying on admin page');
        }
        
        return;
        
        // Original code (commented out - not needed anymore)
        /*
        this.portfolioService.getPortfolio(employeeId).subscribe({
            next: (portfolioData: any) => {
                console.log('Portfolio data for update:', portfolioData);
                
                // Set selected employee and populate form with ALL data
                this.selectedEmployee = employeeData;
                this.updateForm = {
                    // Basic Employee Info
                    firstName: employeeData.firstName || '',
                    middleName: employeeData.middleName || '',
                    lastName: employeeData.lastName || '',
                    employeeType: employeeData.employeeType || '',
                    designation: employeeData.designation || '',
                    email: employeeData.email || '',
                    phone: employeeData.phone || '',
                    panNO: employeeData.panNO || employeeData.panNo || '',
                    aadharNo: employeeData.aadharNo || '',
                    joiningDate: employeeData.joiningDate || '',
                    exitDate: employeeData.exitDate || '',
                    address: {
                        street: employeeData.address?.street || '',
                        city: employeeData.address?.city || '',
                        state: employeeData.address?.state || '',
                        country: employeeData.address?.country || '',
                        pinCode: employeeData.address?.pinCode || ''
                    },
                    // Portfolio Data
                    skills: portfolioData?.skills || [],
                    projects: portfolioData?.projects || [],
                    summary: portfolioData?.summary || ''
                };
                
                this.showUpdateModal = true;
                console.log('Update form populated:', this.updateForm);
            },
            error: (err) => {
                console.error('Failed to load portfolio data:', err);
                // Still show modal with basic employee data
                this.selectedEmployee = employeeData;
                this.updateForm = {
                    // Basic Employee Info
                    firstName: employeeData.firstName || '',
                    middleName: employeeData.middleName || '',
                    lastName: employeeData.lastName || '',
                    employeeType: employeeData.employeeType || '',
                    designation: employeeData.designation || '',
                    email: employeeData.email || '',
                    phone: employeeData.phone || '',
                    panNO: employeeData.panNO || employeeData.panNo || '',
                    aadharNo: employeeData.aadharNo || '',
                    joiningDate: employeeData.joiningDate || '',
                    exitDate: employeeData.exitDate || '',
                    address: {
                        street: employeeData.address?.street || '',
                        city: employeeData.address?.city || '',
                        state: employeeData.address?.state || '',
                        country: employeeData.address?.country || '',
                        pinCode: employeeData.address?.pinCode || ''
                    },
                    // Portfolio Data (empty if no portfolio)
                    skills: [],
                    projects: [],
                    summary: ''
                };
                this.showUpdateModal = true;
            }
        });
        */
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


}