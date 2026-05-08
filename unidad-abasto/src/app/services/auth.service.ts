// auth.service.ts - Versión completa y corregida
import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface Usuario {
  id: number;
  username: string;
  password: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/usuarios/login';
  private usuariosUrl = 'http://localhost:8080/api/usuarios';
  private roleSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<Usuario | null>(null);
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      const savedUser = localStorage.getItem('usuario');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          this.userSubject.next(user);
          this.roleSubject.next(user.rol);
        } catch (e) {
          console.error('Error parsing saved user', e);
        }
      }
    }
  }

  login(username: string, password: string): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, { username, password }).pipe(
      tap((usuario: Usuario) => {
        if (this.isBrowser) {
          localStorage.setItem('usuario', JSON.stringify(usuario));
        }
        this.userSubject.next(usuario);
        this.roleSubject.next(usuario.rol);
        console.log('Usuario logueado:', usuario.username, 'Rol:', usuario.rol);
      })
    );
  }

  // GET - Obtener todos los usuarios
  getAllUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.usuariosUrl}/todos`);
  }

  // GET - Obtener usuarios no administradores
  getNonAdminUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.usuariosUrl}/no-admin`);
  }

  // GET - Buscar usuario por username
  findByUsername(username: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.usuariosUrl}/buscar?username=${username}`);
  }

  // PUT - Actualizar rol de usuario
  updateUsuarioRol(id: number, rol: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.usuariosUrl}/${id}/rol`, { rol });
  }

  // DELETE - Eliminar usuario
  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usuariosUrl}/${id}`);
  }

  // GET - Obtener rol del usuario actual como Observable
  getUserRole(): Observable<string | null> {
    return this.roleSubject.asObservable();
  }

  // GET - Obtener rol actual (valor directo)
  getCurrentRole(): string | null {
    return this.roleSubject.value;
  }

  // GET - Obtener usuario actual
  getCurrentUser(): Usuario | null {
    return this.userSubject.value;
  }

  // Verificar si hay sesión activa
  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem('usuario') !== null;
  }

  // Alias de isLoggedIn (para compatibilidad con guards)
  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  // Verificar acceso a módulos basado en roles
  hasModuleAccess(modulePath: string, requiredRoles: string[]): boolean {
    const currentRole = this.getCurrentRole();
    if (!currentRole) return false;
    
    // Mapear roles del backend a roles del frontend
    const roleMapping: Record<string, string[]> = {
      'admin': ['Administrador'],
      'dependencia': ['Dependencia'],
      'personal_apoyo': ['Personal de Apoyo'],
      'jefe_oficina': ['Jefe de Oficina'],
      'director': ['Director Administrativo'],
      'proveedor': ['Proveedor']
    };
    
    const frontendRoles = roleMapping[currentRole.toLowerCase()] || [currentRole];
    const hasRole = requiredRoles.some(required => 
      frontendRoles.some(frontendRole => frontendRole.toLowerCase() === required.toLowerCase())
    );
    
    console.log(`hasModuleAccess(${modulePath}, ${requiredRoles}): ${hasRole} (rol actual: ${currentRole})`);
    return hasRole;
  }

  // Obtener roles del usuario actual (en formato frontend)
  getRoles(): string[] {
    const currentRole = this.getCurrentRole();
    if (!currentRole) return [];
    
    const roleMapping: Record<string, string> = {
      'admin': 'Administrador',
      'dependencia': 'Dependencia',
      'personal_apoyo': 'Personal de Apoyo',
      'jefe_oficina': 'Jefe de Oficina',
      'director': 'Director Administrativo',
      'proveedor': 'Proveedor'
    };
    
    const mappedRole = roleMapping[currentRole.toLowerCase()];
    return mappedRole ? [mappedRole] : [currentRole];
  }

  // Cerrar sesión
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('usuario');
    }
    this.userSubject.next(null);
    this.roleSubject.next(null);
    console.log('Sesión cerrada');
  }
}