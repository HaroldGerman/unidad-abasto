import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormBuilder } from '@angular/forms';
import { UsersManagementComponent } from './users-management';
import type { Usuario } from '../services/auth.service';

const createMocks = () => {
  const overridesMock = {
    loadRows: vi.fn().mockReturnValue([]),
    saveRows: vi.fn()
  };

  const authMock = {
    updateUsuarioActivo: vi.fn((id: number, activo: boolean) => {
      return {
        subscribe: (handlers: any) => {
          // async response to allow optimistic assertions
          setTimeout(() => handlers.next({ id, activo }), 0);
        }
      };
    })
  };

  const httpMock = {} as any;
  const ngZoneMock = { run: (fn: Function) => fn() } as any;
  const cdrMock = { detectChanges: vi.fn() } as any;
  const fb = new FormBuilder();

  return { overridesMock, authMock, httpMock, ngZoneMock, cdrMock, fb };
};

describe('UsersManagementComponent (unit)', () => {
  let comp: UsersManagementComponent;
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(() => {
    mocks = createMocks();
    // ensure clean storage for tests
    try { localStorage.clear(); } catch (e) {}

    comp = new UsersManagementComponent(
      mocks.fb,
      mocks.overridesMock as any,
      mocks.authMock as any,
      mocks.httpMock as any,
      mocks.ngZoneMock as any,
      mocks.cdrMock as any
    );
  });

  it('normalizes role text', () => {
    const normalized = (comp as any).normalizeRoleText('  Personal de Apoyo ');
    expect(normalized).toBe('personal de apoyo');
  });

  it('maps labels and values to role value using getRoleValue', () => {
    expect(comp.getRoleValue('Dependencia')).toBe('dependencia');
    expect(comp.getRoleValue('dependencia')).toBe('dependencia');
    expect(comp.getRoleValue('Proveedor')).toBe('proveedor');
  });

  it('getRolLabel returns friendly label for known codes', () => {
    expect(comp.getRolLabel('admin')).toBe('Administrador');
    expect(comp.getRolLabel('personal_apoyo')).toBe('Personal de Apoyo');
  });

  it('loads cached backend users from localStorage', () => {
    const sample: Usuario[] = [
      { id: 11, username: 'cached1', password: '', rol: 'user' }
    ];
    localStorage.setItem('backendUsersCache_v1', JSON.stringify(sample));

    (comp as any).loadCachedBackendUsers();
    expect(comp.backendUsers.length).toBe(1);
    expect(comp.backendUsers[0].username).toBe('cached1');
  });

  it('syncRoleSelection populates roleSelection from backendUsers', () => {
    comp.backendUsers = [ { id: 1, username: 'u1', password: '', rol: 'dependencia' } ];
    (comp as any).syncRoleSelection();
    expect(comp.roleSelection['u1']).toBe('dependencia');
  });

  it('toggleSuspension does optimistic update and then applies server response', async () => {
    vi.useFakeTimers();

    comp.backendUsers = [ { id: 42, username: 'optimista', password: '', rol: 'user', activo: true } ];
    comp.rows = [ { username: 'optimista', suspended: false, modules: {} } as any ];

    comp.toggleSuspension('optimista');

    expect(comp.rows[0].suspended).toBe(true);
    expect(comp.updatingSuspension['optimista']).toBe(true);

    vi.runAllTimers();

    expect(comp.rows[0].suspended).toBe(true);
    expect(comp.updatingSuspension['optimista']).toBe(false);

    vi.useRealTimers();
  });

});
