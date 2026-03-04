import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
private API = `${environment.apiUrl}/portfolio`;

  constructor(private http: HttpClient) {}

  addPortfolio(employeeId: number, portfolio: any): Observable<any> {
    console.log('📤 Portfolio service - Adding portfolio:', {
      employeeId,
      portfolio,
      projectsCount: portfolio.projects?.length || 0
    });
    
    return this.http.post(`${this.API}/add/${employeeId}`, portfolio);
  }

  getPortfolio(employeeId: number) {
    return this.http.get(`${this.API}/get-portfolio/${employeeId}`);
}

  deletePortfolio(employeeId: number): Observable<any> {
  return this.http.delete(`${this.API}/delete/${employeeId}`);
}

  updatePortfolio(portfolioId: number, portfolio: any): Observable<any> {
  return this.http.patch(`${this.API}/update/${portfolioId}`, portfolio);
}
}
