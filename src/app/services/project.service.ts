import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private API = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  addProject(employeeId: number, formData: FormData) {
    console.log('� ProjectService.addProject() called');
    console.log('�� Request URL:', `${this.API}/add/${employeeId}`);
    console.log('📤 FormData being sent:');
    formData.forEach((value, key) => {
      console.log(`  ${key}:`, value);
    });
    
    return this.http.post(`${this.API}/add/${employeeId}`, formData).pipe(
      tap((response: any) => {
        console.log('✅ ProjectService - Backend response:', response);
      }),
      catchError((error: any) => {
        console.error('❌ ProjectService - HTTP Error:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Error:', error.error);
        throw error;
      })
    );
  }


  getProjects(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/${employeeId}`);
  }

  deleteProject(projectId: number): Observable<string> {
    return this.http.delete<string>(`${this.API}/delete/${projectId}`);
  }
  updateProject(projectId: number, project: any, file?: File) {

  console.log('🔧 ProjectService.updateProject() called');
  console.log('📝 Project ID:', projectId);
  console.log('📤 Project data:', project);
  console.log('📁 File:', file ? file.name : 'no file');
  console.log('🌐 Request URL:', `${this.API}/update/${projectId}`);

  const formData = new FormData();

  formData.append("projectName", project.projectName);
  formData.append("description", project.description);
  formData.append("techStack", project.techStack);

  if (file) {
    formData.append("image", file);
  }

  console.log('📤 FormData being sent:');
  formData.forEach((value, key) => {
    console.log(`  ${key}:`, value);
  });

  return this.http.patch(`${this.API}/update/${projectId}`, formData).pipe(
    tap((response: any) => {
      console.log('✅ ProjectService - Backend response:', response);
    }),
    catchError((error: any) => {
      console.error('❌ ProjectService - HTTP Error:', error);
      console.error('❌ Status:', error.status);
      console.error('❌ Error:', error.error);
      throw error;
    })
  );
}
}
