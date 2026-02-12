import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private API = 'http://localhost:8080/api/portfolio';

  constructor(private http: HttpClient) {}

  addPortfolio(employeeId: number, portfolio: any): Observable<any> {
    return this.http.post(`${this.API}/add/${employeeId}`, portfolio);
  }

  getPortfolio(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/get-portfolio/${employeeId}`);
  }

  deletePortfolio(employeeId: number): Observable<string> {
    return this.http.delete<string>(`${this.API}/delete/${employeeId}`);
  }

  updatePortfolio(portfolioId: number, portfolio: any): Observable<any> {
    return this.http.patch(`${this.API}/update/${portfolioId}`, portfolio);
  }
}
