import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private API = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  addProject(employeeId: number, project: any): Observable<any> {
    return this.http.post(`${this.API}/add/${employeeId}`, project);
  }

  getProjects(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/${employeeId}`);
  }

  deleteProject(projectId: number): Observable<string> {
    return this.http.delete<string>(`${this.API}/delete/${projectId}`);
  }

  updateProject(projectId: number, project: any): Observable<any> {
    return this.http.patch(`${this.API}/update/${projectId}`, project);
  }
}
