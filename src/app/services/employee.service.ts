import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class EmployeeService {

  private API = 'http://localhost:8080/api/employees';

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

  getUserCount() {
    return this.http.get<number>(`${this.API}/count`);
  }
}
