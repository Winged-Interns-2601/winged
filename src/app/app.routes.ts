import { Routes } from '@angular/router';
import { PortfolioComponent } from './pages/portfolio/portfolio.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AdminComponent } from './admin/admin.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

  // Default route - redirect to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  // USER/Portfolio
  {
    path: 'portfolio',
    component: PortfolioComponent,
    canActivate: [AuthGuard]
  },

  // HR
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: { role: 'HR' }
  },

  // ADMIN
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { role: 'ADMIN' }
  }
];
