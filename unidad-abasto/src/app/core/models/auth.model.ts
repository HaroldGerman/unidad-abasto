export type AppRole =
  | 'Administrador'
  | 'Dependencia'
  | 'Personal de Apoyo'
  | 'Jefe de Oficina'
  | 'Director Administrativo'
  | 'Proveedor';

export interface AuthSession {
  id?: number;
  token?: string;
  username?: string;
  usuario?: string;
  rol?: string;
  roles?: string[];
  [key: string]: unknown;
}