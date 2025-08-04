import axios from 'axios';
import { Turno, Servicio, Usuario, ApiResponse, TurnoRequest, Estadisticas } from '../types';

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

// Servicios de Turnos
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

// Servicios de Pacientes
export const pacienteService = {
  // Buscar paciente por documento
  buscarPorDocumento: async (documento: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/pacientes/buscar/${documento}`);
    return response.data.data!;
  },

  // Obtener citas del paciente
  getCitasPaciente: async (pacienteId: number): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>(`/pacientes/${pacienteId}/citas`);
    return response.data.data || [];
  },

  // Crear nuevo paciente
  crearPaciente: async (pacienteData: any): Promise<any> => {
    const response = await api.post<ApiResponse<any>>('/pacientes', pacienteData);
    return response.data.data!;
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