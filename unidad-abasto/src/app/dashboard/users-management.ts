// users-management.ts - Versión corregida
import { CommonModule } from '@angular/common';
import { Component, NgZone, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import type { ModulePermission } from '../services/access-overrides.service';
import { AccessOverridesService, type UserAccessRow } from '../services/access-overrides.service';
import { DASHBOARD_OPTIONS } from './dashboard-menu';
import { AuthService, type Usuario } from '../services/auth.service';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './users-management.html',
  styleUrl: './users-management.css',
})
export class UsersManagementComponent implements OnInit {
  private readonly BACKEND_CACHE_KEY = 'backendUsersCache_v1';
  readonly menu = DASHBOARD_OPTIONS;
  readonly linkForm;

  rows: UserAccessRow[] = [];
  message = '';
  loading = false;
  
  // Usuarios del backend (no administradores)
  backendUsers: Usuario[] = [];
  showBackendUsers = true;
  roleSelection: Record<string, string> = {};
  updatingSuspension: Record<string, boolean> = {};
  
  // Usuario seleccionado para configuración de permisos
  usuarioSeleccionado: string | null = null;

  // Mapeo de roles para mostrar en el select
  rolesDisponibles = [
    { value: 'admin', label: 'Administrador' },
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
    private readonly http: HttpClient,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.linkForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
    });
    this.rows = this.overrides.loadRows();
  }

  ngOnInit(): void {
    this.loadCachedBackendUsers();
    this.cargarUsuariosBackend();
  }

  cargarUsuariosBackend(): void {
    // Only show global loading if we don't already have cached users to display
    if (!this.backendUsers || this.backendUsers.length === 0) {
      this.loading = true;
    }
    this.message = '';
    
    this.http.get<Usuario[]>('http://localhost:8080/api/usuarios/no-admin').subscribe({
      next: (usuarios) => {
        this.ngZone.run(() => {
          console.log('Usuarios cargados:', usuarios);
          this.backendUsers = usuarios || [];
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(this.BACKEND_CACHE_KEY, JSON.stringify(this.backendUsers));
            }
          } catch (e) {
            // ignore storage errors
          }
          this.syncRoleSelection();
          this.sincronizarConOverrides();
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error cargando usuarios:', err);
          this.message = 'Error al cargar usuarios del servidor. Mostrando datos cache/local.';
          // If we already have cache it will remain; otherwise fallback to mock data
          if (!this.backendUsers || this.backendUsers.length === 0) {
            this.backendUsers = [
              { id: 1, username: 'juanperez', password: '', rol: 'dependencia' },
              { id: 2, username: 'mariagonzalez', password: '', rol: 'jefe_oficina' },
              { id: 3, username: 'carloslopez', password: '', rol: 'personal_apoyo' }
            ];
            try {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.BACKEND_CACHE_KEY, JSON.stringify(this.backendUsers));
              }
            } catch (e) {
              // ignore
            }
            this.syncRoleSelection();
            this.sincronizarConOverrides();
          }
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  private loadCachedBackendUsers(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(this.BACKEND_CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Usuario[];
      if (Array.isArray(parsed) && parsed.length) {
        this.backendUsers = parsed;
        this.syncRoleSelection();
        this.sincronizarConOverrides();
        this.loading = false;
        this.cdr.detectChanges();
      }
    } catch (e) {
      // ignore cache parse errors
    }
  }

  private isBackendUserSuspended(user: Usuario): boolean {
    return user.activo === false;
  }

  sincronizarConOverrides(): void {
    const existingUsernames = new Set(this.rows.map((r) => r.username.toLowerCase()));
    for (const user of this.backendUsers) {
      const username = user.username.toLowerCase();
      if (existingUsernames.has(username) || user.rol === 'admin') {
        continue;
      }
      existingUsernames.add(username);
      this.rows.push({
        username: user.username,
        suspended: this.isBackendUserSuspended(user),
        modules: {},
      });
    }
    this.rows.sort((a, b) => a.username.localeCompare(b.username, 'es'));
    this.persist();
  }

  private syncRoleSelection(): void {
    for (const user of this.backendUsers) {
      this.roleSelection[user.username] = this.getRoleValue(user.rol);
    }
  }

  estaSuspendido(username: string): boolean {
    const backendUser = this.backendUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (backendUser?.activo !== undefined) {
      return backendUser.activo === false;
    }
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

  private normalizeRoleText(text: string): string {
    return (text ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  getRoleValue(rol: string): string {
    const normalized = this.normalizeRoleText(rol);
    const found = this.rolesDisponibles.find((r) =>
      this.normalizeRoleText(r.value) === normalized ||
      this.normalizeRoleText(r.label) === normalized
    );
    return found ? found.value : rol;
  }

  cambiarRol(user: Usuario, nuevoRol: string): void {
    const rolLabel = this.getRolLabel(nuevoRol);
    this.http.put(`http://localhost:8080/api/usuarios/${user.id}/rol`, { rol: rolLabel }).subscribe({
      next: () => {
        user.rol = rolLabel;
        this.roleSelection[user.username] = nuevoRol;
        this.message = `Rol de ${user.username} actualizado a ${rolLabel}`;
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
    const user = this.backendUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!row) return;

    const currentSuspended = user?.activo !== undefined ? user.activo === false : row.suspended;
    const nextSuspended = !currentSuspended;
    const nextActivo = !nextSuspended;

    // Optimistic update: apply immediately
    const previous = row.suspended;
    row.suspended = nextSuspended;
    this.updatingSuspension[username] = true;
    this.cdr.detectChanges();

    if (user?.id != null) {
      this.authService.updateUsuarioActivo(user.id, nextActivo).subscribe({
        next: (updated) => {
          // Server response wins, but keep optimistic update if consistent
          row.suspended = updated.activo !== undefined ? !updated.activo : nextSuspended;
          if (updated.activo !== undefined) {
            user.activo = updated.activo;
          }
          // update cache
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(this.BACKEND_CACHE_KEY, JSON.stringify(this.backendUsers));
            }
          } catch (e) {
            // ignore
          }
          this.persist();
          this.message = row.suspended ? `${username}: acceso suspendido.` : `${username}: acceso reactivado.`;
          setTimeout(() => this.message = '', 3000);
          this.updatingSuspension[username] = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error actualizando suspensión:', err);
          // revert optimistic change
          row.suspended = previous;
          this.message = 'No se pudo actualizar la suspensión en el servidor.';
          setTimeout(() => this.message = '', 3000);
          this.updatingSuspension[username] = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Local-only user: persist immediately
      this.persist();
      this.message = row.suspended ? `${username}: acceso suspendido.` : `${username}: acceso reactivado.`;
      setTimeout(() => this.message = '', 3000);
      this.updatingSuspension[username] = false;
      this.cdr.detectChanges();
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
          { username, suspended: usuario.activo === false, modules: {} },
        ].sort((a, b) => a.username.localeCompare(b.username, 'es'));
        this.persist();
        this.linkForm.reset();
        this.message = 'Usuario agregado. Puedes configurar sus permisos.';
        
        if (!this.backendUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
          this.backendUsers.push(usuario);
          this.roleSelection[usuario.username] = this.getRoleValue(usuario.rol);
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

  trackByBackendUser(_: number, user: Usuario): string {
    return user.id?.toString() ?? user.username;
  }

  private persist(): void {
    this.overrides.saveRows(this.rows);
  }
}