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
  paciente: Paciente;
  cita: Cita;
  estado: string;
}

// Request types for the backend
export interface BuscarPacienteRequest {
  tipo_documento: string;
  numero_documento: string;
}

export interface AsignarTurnoRequest {
  numero_paciente: number;
  id_cita: number;
}

// Response types for the backend
export interface BuscarPacienteResponse {
  mensaje: string;
  datos?: {
    paciente: Paciente;
    citas: Cita[];
  };
}

export interface AsignarTurnoResponse {
  mensaje: string;
  datos?: TurnoResponse;
}

export interface TurnosActivosResponse {
  mensaje: string;
  datos?: TurnoResponse[];
}

export interface TiposDocumentoResponse {
  mensaje: string;
  datos?: string[];
} 