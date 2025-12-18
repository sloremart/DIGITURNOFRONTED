export interface Turno {
  id: number;
  numero: number;
  estado: 'pendiente' | 'en_atencion' | 'completado' | 'cancelado';
  servicio: string;
  fecha_creacion: string;
  fecha_atencion?: string;
  tiempo_espera?: number;
}

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  tiempo_promedio: number;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'operador' | 'cliente';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface TurnoRequest {
  servicio_id: number;
  nombre_cliente?: string;
  email_cliente?: string;
}

export interface Estadisticas {
  turnos_hoy: number;
  turnos_pendientes: number;
  tiempo_promedio_espera: number;
  servicios_activos: number;
}

// Nuevos tipos basados en la estructura real del backend
export interface Paciente {
  numero_paciente: number;
  tipo_id: string;
  id_paciente: string;
  nombre1?: string;
  nombre2?: string;
  apellido1?: string;
  apellido2?: string;
  fecha_nacimiento?: string;
  telefono?: string;
}

export interface Cita {
  id_cita: number;
  fecha_cita: string;
  hora_cita?: string;
  id_medico?: string;
  procedimiento?: string;
  estado?: number;
  cumplida?: boolean;
  observaciones?: string;
}

export interface TurnoResponse {
  numero_turno: string;
  hora_asignacion: string;
  es_preferencial: boolean;
  motivo_preferencial?: string;
  prioridad: number;
  sede: string;
  modulo: string;
  nombre_paciente: string;
  estado: string;
  tipo_operador?: string;
  hora_cita?: string;
  paciente?: Paciente;
  cita?: Cita;
}

// Request types for the backend
export interface BuscarPacienteRequest {
  tipo_documento: string;
  numero_documento: string;
}

export interface AsignarTurnoRequest {
  numero_paciente: number;
  id_cita: number;
  es_preferencial?: boolean;
  motivo_preferencial?: string;
}

// Response types for the backend
export interface BuscarPacienteResponse {
  success: boolean;
  paciente?: Paciente;
  citas?: Cita[];
  tiene_citas_hoy?: boolean;
  mensaje?: string;
}

export interface AsignarTurnoResponse {
  success: boolean;
  turno?: TurnoResponse;
  mensaje?: string;
}

export interface TurnosActivosResponse {
  success: boolean;
  datos?: TurnoResponse[];
  mensaje?: string;
}

export interface TiposDocumentoResponse {
  success: boolean;
  tipos?: Array<{codigo: string; nombre: string}>;
  mensaje?: string;
}

export interface MotivosPreferencialesResponse {
  success: boolean;
  motivos?: Array<{codigo: string; nombre: string}>;
  mensaje?: string;
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion?: string;
  activa: boolean;
}

export interface SucursalesResponse {
  success: boolean;
  sucursales?: Sucursal[];
  mensaje?: string;
}

export interface BuscarCitasResponse {
  success: boolean;
  citas?: Cita[];
  mensaje?: string;
}

export interface EstadisticasResponse {
  success: boolean;
  estadisticas?: {
    total_turnos: number;
    turnos_preferenciales: number;
    turnos_facturacion: number;
    turnos_asignacion_cita: number;
    turnos_hoy: number;
  };
  mensaje?: string;
} 