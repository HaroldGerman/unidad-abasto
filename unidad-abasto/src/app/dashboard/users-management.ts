// users-management.ts - Versión corregida
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import type { ModulePermission } from '../services/access-overrides.service';
import { AccessOverridesService, type UserAccessRow } from '../services/access-overrides.service';
import { DASHBOARD_OPTIONS } from './dashboard-menu';
import { AuthService, type Usuario } from '../services/auth.service';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './users-management.html',
  styleUrl: './users-management.css',
})
export class UsersManagementComponent implements OnInit {
  readonly menu = DASHBOARD_OPTIONS;
  readonly linkForm;

  rows: UserAccessRow[] = [];
  message = '';
  loading = false;
  
  // Usuarios del backend (no administradores)
  backendUsers: Usuario[] = [];
  showBackendUsers = true;
  
  // Usuario seleccionado para configuración de permisos
  usuarioSeleccionado: string | null = null;

  // Mapeo de roles para mostrar en el select
  rolesDisponibles = [
    { value: 'dependencia', label: 'Dependencia' },
    { value: 'personal_apoyo', label: 'Personal de Apoyo' },
    { value: 'jefe_oficina', label: 'Jefe de Oficina' },
    { value: 'director', label: 'Director Administrativo' },
    { value: 'proveedor', label: 'Proveedor' },
    { value: 'user', label: 'Usuario Normal' }  // Añadido para compatibilidad
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly overrides: AccessOverridesService,
    private readonly authService: AuthService,
    private readonly http: HttpClient
  ) {
    this.linkForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
    });
    this.rows = this.overrides.loadRows();
  }

  ngOnInit(): void {
    this.cargarUsuariosBackend();
  }

  cargarUsuariosBackend(): void {
    this.loading = true;
    this.message = '';
    
    this.http.get<Usuario[]>('http://localhost:8080/api/usuarios/no-admin').subscribe({
      next: (usuarios) => {
        console.log('Usuarios cargados:', usuarios);
        this.backendUsers = usuarios || [];
        this.sincronizarConOverrides();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.message = 'Error al cargar usuarios del servidor. Asegúrate de que el backend esté ejecutándose.';
        this.loading = false;
        
        // DATOS MOCK para pruebas mientras se arregla el backend
        this.backendUsers = [
          { id: 1, username: 'juanperez', password: '', rol: 'dependencia' },
          { id: 2, username: 'mariagonzalez', password: '', rol: 'jefe_oficina' },
          { id: 3, username: 'carloslopez', password: '', rol: 'personal_apoyo' }
        ];
        this.sincronizarConOverrides();
      }
    });
  }

  sincronizarConOverrides(): void {
    for (const user of this.backendUsers) {
      const exists = this.rows.some(r => r.username.toLowerCase() === user.username.toLowerCase());
      // Excluir admin y asegurar que el usuario tenga un rol válido
      if (!exists && user.rol !== 'admin') {
        this.rows.push({
          username: user.username,
          suspended: false,
          modules: {},
        });
      }
    }
    this.rows.sort((a, b) => a.username.localeCompare(b.username, 'es'));
    this.persist();
  }

  estaSuspendido(username: string): boolean {
    const row = this.rows.find(r => r.username.toLowerCase() === username.toLowerCase());
    return row?.suspended || false;
  }

  getPermisoUsuario(username: string, path: string): ModulePermission {
    const row = this.rows.find(r => r.username.toLowerCase() === username.toLowerCase());
    return row?.modules[path] ?? 'inherit';
  }

  // Obtener el nombre mostrable del rol
  getRolLabel(rol: string): string {
    const rolMap: Record<string, string> = {
      'admin': 'Administrador',
      'dependencia': 'Dependencia',
      'personal_apoyo': 'Personal de Apoyo',
      'jefe_oficina': 'Jefe de Oficina',
      'director': 'Director Administrativo',
      'proveedor': 'Proveedor',
      'user': 'Usuario Normal'
    };
    return rolMap[rol] || rol;
  }

  cambiarRol(user: Usuario, nuevoRol: string): void {
    this.http.put(`http://localhost:8080/api/usuarios/${user.id}/rol`, { rol: nuevoRol }).subscribe({
      next: () => {
        user.rol = nuevoRol;
        this.message = `Rol de ${user.username} actualizado a ${this.getRolLabel(nuevoRol)}`;
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        console.error('Error actualizando rol:', err);
        this.message = 'Error al actualizar el rol del usuario';
      }
    });
  }

  toggleSuspension(username: string): void {
    const row = this.rows.find(r => r.username.toLowerCase() === username.toLowerCase());
    if (row) {
      row.suspended = !row.suspended;
      this.persist();
      this.message = row.suspended 
        ? `${username}: acceso suspendido.` 
        : `${username}: acceso reactivado.`;
      setTimeout(() => this.message = '', 3000);
    }
  }

  abrirPermisos(username: string): void {
    this.usuarioSeleccionado = username;
  }

  cerrarPermisos(): void {
    this.usuarioSeleccionado = null;
  }

  setModulePermForUser(username: string, path: string, value: string): void {
    let row = this.rows.find(r => r.username.toLowerCase() === username.toLowerCase());
    
    if (!row) {
      row = {
        username: username,
        suspended: false,
        modules: {}
      };
      this.rows.push(row);
    }
    
    const v = value as ModulePermission;
    if (v === 'inherit') {
      delete row.modules[path];
    } else {
      row.modules[path] = v;
    }
    this.persist();
    this.message = `Permiso actualizado para ${username} (${path}).`;
    setTimeout(() => this.message = '', 3000);
  }

  addForPermissionManagement(): void {
    if (this.linkForm.invalid) {
      this.linkForm.markAllAsTouched();
      return;
    }

    const username = (this.linkForm.value.username ?? '').trim();
    const key = username.toLowerCase();
    
    if (this.rows.some((r) => r.username.toLowerCase() === key)) {
      this.message = 'Esa cuenta ya está en la tabla de permisos.';
      return;
    }

    // Intentar buscar el usuario en el backend
    this.http.get<Usuario>(`http://localhost:8080/api/usuarios/buscar?username=${username}`).subscribe({
      next: (usuario) => {
        this.rows = [
          ...this.rows,
          { username, suspended: false, modules: {} },
        ].sort((a, b) => a.username.localeCompare(b.username, 'es'));
        this.persist();
        this.linkForm.reset();
        this.message = 'Usuario agregado. Puedes configurar sus permisos.';
        
        if (!this.backendUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
          this.backendUsers.push(usuario);
        }
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        console.error('Error buscando usuario:', err);
        // Si el endpoint /buscar no existe, mostrar mensaje
        this.message = 'El usuario no existe en el sistema o el endpoint /buscar no está disponible.';
      }
    });
  }

  removeFromList(row: UserAccessRow): void {
    this.rows = this.rows.filter(
      (r) => r.username.toLowerCase() !== row.username.toLowerCase(),
    );
    this.persist();
    this.message = `Usuario removido de la lista de gestión.`;
    setTimeout(() => this.message = '', 3000);
  }

  setSuspended(row: UserAccessRow, suspended: boolean): void {
    row.suspended = suspended;
    this.persist();
    this.message = suspended ? `${row.username}: acceso suspendido.` : `${row.username}: acceso reactivado.`;
    setTimeout(() => this.message = '', 3000);
  }

  modulePerm(row: UserAccessRow, path: string): ModulePermission {
    return row.modules[path] ?? 'inherit';
  }

  setModulePerm(row: UserAccessRow, path: string, value: string): void {
    const v = value as ModulePermission;
    if (v === 'inherit') {
      delete row.modules[path];
    } else {
      row.modules[path] = v;
    }
    this.persist();
    this.message = `Permiso actualizado para ${row.username} (${path}).`;
    setTimeout(() => this.message = '', 3000);
  }

  trackByUser(_: number, row: UserAccessRow): string {
    return row.username;
  }

  private persist(): void {
    this.overrides.saveRows(this.rows);
  }
}