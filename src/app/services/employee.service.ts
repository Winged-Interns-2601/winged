import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {

  private API = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  createUser(data: any) {
    return this.http.post(`${this.API}/create-user`, data);
  }

  createEmployeeWithImage(employeeData: any, image: File, headers?: any) {
    const formData = new FormData();
    
    // Add employee data as JSON
    formData.append('employee', new Blob([JSON.stringify(employeeData)], {
      type: 'application/json'
    }));
    
    // Add image file
    formData.append('image', image);
    
    // 🔥 DEBUG: Use provided headers or default
    const options = headers ? { headers } : {};
    
    console.log('🔍 DEBUG - FormData created:', formData);
    console.log('🔍 DEBUG - Request options:', options);
    
    return this.http.post(`${this.API}/create-user`, formData, options);
  }

  getAllUsers() {
    return this.http.get<any[]>(`${this.API}/all-users`);
  }

  getById(id: number) {
    return this.http.get(`${this.API}/user-by-id/${id}`);
  }

  deleteById(id: number) {
    return this.http.delete(`${this.API}/delete-by-id/${id}`, { responseType: 'text' });
  }

  getByEmail(email: string) {
    return this.http.get(`${this.API}/user-by-email/${email}`);
  }

  getByDesignation(designation: string) {
    return this.http.get(`${this.API}/user-by-designation/${designation}`);
  }

  getByEmployeeId(employeeId: number) {
    return this.http.get(
      `${this.API}/user-by-empId/${employeeId}` 
    );
  }

  getUserCount() {
    return this.http.get<number>(`${this.API}/count`);
  }

 updateEmployee(id: number, data: any) {
  return this.http.patch(
    `http://localhost:8080/api/employees/update-user/${id}`,
    data
  );
}
}
