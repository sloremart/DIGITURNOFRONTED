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