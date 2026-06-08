// dashboard-menu.ts
import type { AppRole } from '../core/models/auth.model';

export interface DashboardOption {
  title: string;
  description: string;
  path: string;
  roles: AppRole[];
}

export const DASHBOARD_OPTIONS: DashboardOption[] = [
  {
    title: 'Solicitudes de abasto',
    description: 'Crear o dar seguimiento a solicitudes.',
    path: 'solicitudes',
    roles: ['Dependencia', 'Jefe de Oficina', 'Director Administrativo'],
  },
  {
    title: 'Aprobaciones',
    description: 'Revisar y aprobar solicitudes pendientes.',
    path: 'aprobaciones',
    roles: ['Jefe de Oficina', 'Director Administrativo'],
  },
  {
    title: 'Almacén y entregas',
    description: 'Registrar entregas y movimientos de almacén.',
    path: 'almacen',
    roles: ['Personal de Apoyo'],
  },
  {
    title: 'Administración de usuarios',
    description: 'Permisos por modulo y suspension de acceso para cuentas ya registradas.',
    path: 'usuarios',
    roles: ['Administrador'],  // Solo visible para admin del backend
  },
  {
    title: 'Reportes',
    description: 'Indicadores y exportación de información.',
    path: 'reportes',
    roles: ['Director Administrativo', 'Administrador'],
  },
  {
    title: 'Mis ofertas (proveedor)',
    description: 'Gestionar ofertas y cumplimiento como proveedor.',
    path: 'ofertas-proveedor',
    roles: ['Proveedor'],  // Actualmente tu backend no tiene este rol
  },
];