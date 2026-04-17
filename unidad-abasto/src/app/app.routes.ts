import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { RegistroComponent } from './registro.component';
import { InicioComponent } from './inicio.component';

export const routes: Routes = [
  { path: '', component: InicioComponent }, // Ruta por defecto (Landing Page)
  { path: 'login', component: HomeComponent }, // Ruta para el login (el componente que ya tenías)
  { path: 'registro', component: RegistroComponent }, // Ruta para registrarse
  { path: '**', redirectTo: '' } // Cualquier otra ruta redirige al inicio
];
