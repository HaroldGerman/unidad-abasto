import { Injectable } from '@angular/core';

/** Respecta el rol registrado cuando es `inherit`. */
export type ModulePermission = 'inherit' | 'allow' | 'deny';

export interface UserAccessRow {
  username: string;
  suspended: boolean;
  /** Clave = segmento de ruta bajo `/dashboard/` (ej. `solicitudes`). */
  modules: Partial<Record<string, ModulePermission>>;
}

const STORAGE_KEY = 'abasto_user_access_overrides';
const LEGACY_KEY = 'abasto_users_management';

@Injectable({
  providedIn: 'root',
})
export class AccessOverridesService {
  loadRows(): UserAccessRow[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    const migrated = this.migrateLegacyIfNeeded();
    if (migrated) {
      return migrated;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as UserAccessRow[];
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter((r) => r?.username?.trim()?.length >= 3);
    } catch {
      return [];
    }
  }

  saveRows(rows: UserAccessRow[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }

  /**
   * Resuelve acceso a un módulo cuando hay fila para el usuario activo en localStorage (sin borrar cuenta del servidor).
   */
  effectiveAccess(
    username: string | null,
    modulePath: string,
    requiredRoles: string[],
    hasAnyRole: (roles: string[]) => boolean,
  ): boolean {
    if (!username?.trim()) {
      return false;
    }
    const row = this.findRow(username, this.loadRows());
    if (row?.suspended) {
      return false;
    }
    const perm = row?.modules[modulePath];
    if (perm === 'deny') {
      return false;
    }
    if (perm === 'allow') {
      return true;
    }
    if (!requiredRoles.length) {
      return true;
    }
    return hasAnyRole(requiredRoles);
  }

  private findRow(username: string, rows: UserAccessRow[]): UserAccessRow | undefined {
    const key = username.trim().toLowerCase();
    return rows.find((r) => r.username.trim().toLowerCase() === key);
  }

  private migrateLegacyIfNeeded(): UserAccessRow[] | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as Array<{
        username?: string;
        active?: boolean;
      }>;
      if (!Array.isArray(parsed)) {
        localStorage.removeItem(LEGACY_KEY);
        return null;
      }
      const rows: UserAccessRow[] = parsed
        .filter((u) => typeof u.username === 'string' && u.username.trim().length >= 3)
        .map((u) => ({
          username: u.username!.trim(),
          suspended: u.active === false,
          modules: {},
        }));
      localStorage.removeItem(LEGACY_KEY);
      if (rows.length) {
        this.saveRows(rows);
      }
      return rows;
    } catch {
      return null;
    }
  }
}