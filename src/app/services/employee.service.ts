import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {

  private API = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  createUser(data: any) {
    return this.http.post(`${this.API}/create-user`, data);
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

  updateEmployee(id: number, employee: any) {
    return this.http.patch(`${this.API}/update-user/${id}`, employee);
  }
}
