import axios from 'axios';
import { 
  Turno, 
  Servicio, 
  Usuario, 
  ApiResponse, 
  TurnoRequest, 
  Estadisticas,
  Paciente,
  Cita,
  TurnoResponse,
  BuscarPacienteRequest,
  AsignarTurnoRequest,
  BuscarPacienteResponse,
  AsignarTurnoResponse,
  TurnosActivosResponse,
  TiposDocumentoResponse
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Servicios de Turnos (legacy - mantener para compatibilidad)
export const turnoService = {
  // Obtener todos los turnos
  getTurnos: async (): Promise<Turno[]> => {
    const response = await api.get<ApiResponse<Turno[]>>('/turnos');
    return response.data.data || [];
  },

  // Obtener turno por ID
  getTurnoById: async (id: number): Promise<Turno> => {
    const response = await api.get<ApiResponse<Turno>>(`/turnos/${id}`);
    return response.data.data!;
  },

  // Crear nuevo turno
  crearTurno: async (turnoData: TurnoRequest): Promise<Turno> => {
    const response = await api.post<ApiResponse<Turno>>('/turnos', turnoData);
    return response.data.data!;
  },

  // Actualizar estado del turno
  actualizarTurno: async (id: number, estado: string): Promise<Turno> => {
    const response = await api.put<ApiResponse<Turno>>(`/turnos/${id}`, { estado });
    return response.data.data!;
  },

  // Obtener turnos pendientes
  getTurnosPendientes: async (): Promise<Turno[]> => {
    const response = await api.get<ApiResponse<Turno[]>>('/turnos/pendientes');
    return response.data.data || [];
  },

  // Cancelar turno
  cancelarTurno: async (id: number): Promise<Turno> => {
    const response = await api.put<ApiResponse<Turno>>(`/turnos/${id}/cancelar`);
    return response.data.data!;
  },
};

// Servicios de Servicios
export const servicioService = {
  // Obtener todos los servicios
  getServicios: async (): Promise<Servicio[]> => {
    const response = await api.get<ApiResponse<Servicio[]>>('/servicios');
    return response.data.data || [];
  },

  // Obtener servicios activos
  getServiciosActivos: async (): Promise<Servicio[]> => {
    const response = await api.get<ApiResponse<Servicio[]>>('/servicios/activos');
    return response.data.data || [];
  },

  // Crear nuevo servicio
  crearServicio: async (servicioData: Partial<Servicio>): Promise<Servicio> => {
    const response = await api.post<ApiResponse<Servicio>>('/servicios', servicioData);
    return response.data.data!;
  },

  // Actualizar servicio
  actualizarServicio: async (id: number, servicioData: Partial<Servicio>): Promise<Servicio> => {
    const response = await api.put<ApiResponse<Servicio>>(`/servicios/${id}`, servicioData);
    return response.data.data!;
  },

  // Eliminar servicio
  eliminarServicio: async (id: number): Promise<void> => {
    await api.delete(`/servicios/${id}`);
  },
};

// Servicios de Usuarios
export const usuarioService = {
  // Obtener todos los usuarios
  getUsuarios: async (): Promise<Usuario[]> => {
    const response = await api.get<ApiResponse<Usuario[]>>('/usuarios');
    return response.data.data || [];
  },

  // Obtener usuario por ID
  getUsuarioById: async (id: number): Promise<Usuario> => {
    const response = await api.get<ApiResponse<Usuario>>(`/usuarios/${id}`);
    return response.data.data!;
  },

  // Crear nuevo usuario
  crearUsuario: async (usuarioData: Partial<Usuario>): Promise<Usuario> => {
    const response = await api.post<ApiResponse<Usuario>>('/usuarios', usuarioData);
    return response.data.data!;
  },

  // Actualizar usuario
  actualizarUsuario: async (id: number, usuarioData: Partial<Usuario>): Promise<Usuario> => {
    const response = await api.put<ApiResponse<Usuario>>(`/usuarios/${id}`, usuarioData);
    return response.data.data!;
  },
};

// Servicios de Pacientes (actualizados para el backend real)
export const pacienteService = {
  // Buscar paciente por documento
  buscarPorDocumento: async (tipoDocumento: string, numeroDocumento: string): Promise<{ paciente: Paciente; citas: Cita[] }> => {
    const requestData: BuscarPacienteRequest = {
      tipo_documento: tipoDocumento,
      numero_documento: numeroDocumento
    };
    
    const response = await api.post<BuscarPacienteResponse>('/buscar-paciente', requestData);
    
    if (response.data.datos) {
      return {
        paciente: response.data.datos.paciente,
        citas: response.data.datos.citas || []
      };
    } else {
      throw new Error('Paciente no encontrado');
    }
  },

  // Obtener tipos de documento
  getTiposDocumento: async (): Promise<string[]> => {
    const response = await api.get<TiposDocumentoResponse>('/tipos-documento');
    return response.data.datos || [];
  },
};

// Servicios de Turnos (actualizados para el backend real)
export const digiturnoService = {
  // Asignar turno
  asignarTurno: async (numeroPaciente: number, idCita: number): Promise<TurnoResponse> => {
    const requestData: AsignarTurnoRequest = {
      numero_paciente: numeroPaciente,
      id_cita: idCita
    };
    
    const response = await api.post<AsignarTurnoResponse>('/asignar-turno', requestData);
    
    if (response.data.datos) {
      return response.data.datos;
    } else {
      throw new Error('Error al asignar turno');
    }
  },

  // Obtener turnos activos
  getTurnosActivos: async (): Promise<TurnoResponse[]> => {
    const response = await api.get<TurnosActivosResponse>('/turnos-activos');
    return response.data.datos || [];
  },

  // Obtener siguiente turno
  getSiguienteTurno: async (): Promise<TurnoResponse | null> => {
    try {
      const response = await api.get<TurnosActivosResponse>('/siguiente-turno');
      return response.data.datos?.[0] || null;
    } catch (error) {
      return null;
    }
  },

  // Llamar turno
  llamarTurno: async (numeroTurno: string): Promise<void> => {
    await api.post(`/llamar-turno/${numeroTurno}`);
  },

  // Finalizar turno
  finalizarTurno: async (numeroTurno: string): Promise<void> => {
    await api.post(`/finalizar-turno/${numeroTurno}`);
  },

  // Obtener turnos para facturación
  getTurnosFacturacion: async (): Promise<TurnoResponse[]> => {
    const response = await api.get<TurnosActivosResponse>('/turnos-facturacion');
    return response.data.datos || [];
  },

  // Obtener estadísticas
  getEstadisticas: async (): Promise<any> => {
    const response = await api.get('/estadisticas');
    return response.data;
  },
};

// Servicios de Estadísticas
export const estadisticasService = {
  // Obtener estadísticas generales
  getEstadisticas: async (): Promise<Estadisticas> => {
    const response = await api.get<ApiResponse<Estadisticas>>('/estadisticas');
    return response.data.data!;
  },

  // Obtener estadísticas por fecha
  getEstadisticasPorFecha: async (fecha: string): Promise<Estadisticas> => {
    const response = await api.get<ApiResponse<Estadisticas>>(`/estadisticas/${fecha}`);
    return response.data.data!;
  },
};

export default api; 