// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { RegistroComponent } from './registro.component';
import { InicioComponent } from './inicio.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'login', component: HomeComponent },
  { path: 'registro', component: RegistroComponent },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/dashboard-home').then(m => m.DashboardHomeComponent)
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] },
        loadComponent: () => import('./dashboard/users-management').then(m => m.UsersManagementComponent)
      },
      {
        path: 'solicitudes',
        loadComponent: () => import('./dashboard/feature-placeholder').then(m => m.FeaturePlaceholderComponent),
        data: { title: 'Solicitudes de abasto' }
      },
      {
        path: 'aprobaciones',
        loadComponent: () => import('./dashboard/feature-placeholder').then(m => m.FeaturePlaceholderComponent),
        data: { title: 'Aprobaciones' }
      },
      {
        path: 'almacen',
        loadComponent: () => import('./dashboard/feature-placeholder').then(m => m.FeaturePlaceholderComponent),
        data: { title: 'Almacén y entregas' }
      },
      {
        path: 'reportes',
        loadComponent: () => import('./dashboard/feature-placeholder').then(m => m.FeaturePlaceholderComponent),
        data: { title: 'Reportes' }
      },
      {
        path: 'ofertas-proveedor',
        loadComponent: () => import('./dashboard/feature-placeholder').then(m => m.FeaturePlaceholderComponent),
        data: { title: 'Mis ofertas' }
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
