import { Routes } from '@angular/router';
import { PortfolioComponent } from './pages/portfolio/portfolio.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AdminComponent } from './admin/admin.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [


  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },


  {
    path: 'portfolio',
    component: PortfolioComponent,
    canActivate: [AuthGuard]
  },


  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: { role: 'HR' }
  },


  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { role: 'ADMIN' }
  }
];
