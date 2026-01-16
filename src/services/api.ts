import axios from 'axios';
import { 
  Paciente, 
  Cita, 
  TurnoResponse, 
  AsignarTurnoResponse,
  BuscarPacienteResponse,
  TurnosActivosResponse,
  MotivosPreferencialesResponse,
  EstadisticasResponse
} from '../types';

// Configurar la instancia de axios
// Usa variable de entorno en producción, valor por defecto para producción
export const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.211:8010';

// Debug: Log para verificar qué URL se está usando
console.log('🔧 API_URL configurada:', API_URL);
console.log('🔧 REACT_APP_API_URL desde env:', process.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export const digiturnoService = {
  // Método principal de asignación de turno - SIEMPRE usa facturación cuando hay cita
  asignarTurno: async (numeroPaciente: number, idCita: number, esPreferencial?: boolean, motivoPreferencial?: string, paciente?: any): Promise<TurnoResponse> => {
    // SIEMPRE usar el endpoint de facturación cuando hay numero_paciente e id_cita
    console.log('🔍 asignarTurno llamado con:', { numeroPaciente, idCita, esPreferencial, motivoPreferencial });
    
    const requestData = {
      numero_paciente: numeroPaciente,
      id_cita: idCita,
      modulo: esPreferencial ? "PREFERENCIAL" : "FACTURACION",
      es_preferencial: esPreferencial || false,
      motivo_preferencial: motivoPreferencial || null,
      tipo_operador_override: "FACTURADOR" // SIEMPRE facturador para turnos con cita
    };
    
    console.log('📤 Enviando a /asignar-turno-facturacion:', requestData);
    
    const response = await api.post<AsignarTurnoResponse>('/asignar-turno-facturacion', requestData);
    if (response.data.success && response.data.turno) {
      return response.data.turno;
    } else {
      throw new Error(response.data.mensaje || 'Error al asignar turno');
    }
  },

  // Nuevos métodos específicos para cada tipo de turno
  asignarTurnoPreferencial: async (tipoDocumento: string, numeroDocumento: string, motivoPreferencial: string, nombrePaciente?: string): Promise<TurnoResponse> => {
    const response = await api.post<AsignarTurnoResponse>('/asignar-turno-preferencial', {
      tipo_documento: tipoDocumento,
      numero_documento: numeroDocumento,
      motivo_preferencial: motivoPreferencial,
      nombre_paciente: nombrePaciente || `${tipoDocumento} ${numeroDocumento}`
    });
    if (response.data.success && response.data.turno) {
      return response.data.turno;
    } else {
      throw new Error(response.data.mensaje || 'Error al asignar turno preferencial');
    }
  },

  asignarTurnoFacturacion: async (numeroPaciente: number, idCita: number): Promise<TurnoResponse> => {
    const response = await api.post<AsignarTurnoResponse>('/asignar-turno-facturacion', {
      numero_paciente: numeroPaciente,
      id_cita: idCita,
      modulo: "FACTURACION"
    });
    if (response.data.success && response.data.turno) {
      return response.data.turno;
    } else {
      throw new Error(response.data.mensaje || 'Error al asignar turno de facturación');
    }
  },

  asignarTurnoAsignacionCita: async (tipoDocumento: string, numeroDocumento: string, nombrePaciente?: string): Promise<TurnoResponse> => {
    const response = await api.post<AsignarTurnoResponse>('/asignar-turno-asignacion-cita', {
      tipo_documento: tipoDocumento,
      numero_documento: numeroDocumento,
      nombre_paciente: nombrePaciente || `${tipoDocumento} ${numeroDocumento}`
    });
    if (response.data.success && response.data.turno) {
      return response.data.turno;
    } else {
      throw new Error(response.data.mensaje || 'Error al asignar turno de asignación de cita');
    }
  },

  // Métodos de búsqueda
  buscarPaciente: async (tipoDocumento: string, numeroDocumento: string): Promise<BuscarPacienteResponse> => {
    const requestData = {
      tipo_documento: tipoDocumento,
      numero_documento: numeroDocumento
    };
    const response = await api.post<BuscarPacienteResponse>('/buscar-paciente', requestData);
    if (response.data.success && response.data.paciente) {
      return response.data;
    } else {
      throw new Error(response.data.mensaje || 'Paciente no encontrado');
    }
  },

  buscarCitas: async (numeroDocumento: string): Promise<Cita[]> => {
    // Como el endpoint /buscar-paciente ya devuelve las citas, 
    // podemos usar esa información o crear un endpoint específico
    // Por ahora, vamos a usar el endpoint de buscar paciente y extraer las citas
    const requestData = {
      tipo_documento: 'CC', // Por defecto, se puede mejorar
      numero_documento: numeroDocumento
    };
    const response = await api.post<BuscarPacienteResponse>('/buscar-paciente', requestData);
    if (response.data.success) {
      return response.data.citas || [];
    } else {
      throw new Error(response.data.mensaje || 'Error al buscar citas');
    }
  },

  // Métodos existentes
  getTurnosActivos: async (): Promise<TurnoResponse[]> => {
    try {
      console.log('📡 Llamando endpoint /turnos-activos...');
      console.log('📡 URL completa:', `${API_URL}/turnos-activos`);
      const response = await api.get<TurnosActivosResponse>('/turnos-activos');
      console.log('📥 Respuesta completa:', response.data);
      console.log('📥 Tipo de respuesta:', typeof response.data);
      console.log('📥 Es array?:', Array.isArray(response.data));
      console.log('📥 Claves en response.data:', Object.keys(response.data || {}));
      
      // El backend devuelve: { success: true, turnos: [...], total: ... }
      // Priorizar 'turnos' que es el formato actual del backend
      if (response.data.success && (response.data as any).turnos) {
        const turnos = (response.data as any).turnos || [];
        console.log('✅ Turnos encontrados (en turnos con success):', turnos.length);
        console.log('📋 Primeros turnos:', turnos.slice(0, 3));
        return turnos;
      } else if ((response.data as any).turnos && Array.isArray((response.data as any).turnos)) {
        // Si está en response.data.turnos sin success
        const turnos = (response.data as any).turnos;
        console.log('✅ Turnos encontrados (en turnos sin success):', turnos.length);
        console.log('📋 Primeros turnos:', turnos.slice(0, 3));
        return turnos;
      } else if (response.data.success && response.data.datos) {
        // Compatibilidad con formato antiguo que usa 'datos'
        console.log('✅ Turnos encontrados (en datos con success):', response.data.datos.length);
        return response.data.datos || [];
      } else if (response.data.datos && Array.isArray(response.data.datos)) {
        // Algunos backends usan 'datos' en lugar de 'turnos'
        console.log('✅ Turnos encontrados (en datos):', response.data.datos.length);
        return response.data.datos;
      } else if (Array.isArray(response.data)) {
        // Si la respuesta es directamente un array
        console.log('✅ Turnos encontrados (array directo):', response.data.length);
        return response.data;
      } else {
        console.warn('⚠️ Formato de respuesta inesperado:', response.data);
        console.warn('⚠️ Claves disponibles:', Object.keys(response.data || {}));
        console.warn('⚠️ Tipo de response.data:', typeof response.data);
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error en getTurnosActivos:', error);
      console.error('   URL intentada:', `${API_URL}/turnos-activos`);
      console.error('   Status:', error.response?.status);
      console.error('   Status Text:', error.response?.statusText);
      console.error('   Detalles:', error.response?.data);
      console.error('   Mensaje:', error.message);
      console.error('   ¿Es error de red?:', !error.response);
      // Retornar array vacío en lugar de lanzar error para que la tabla se muestre vacía
      return [];
    }
  },

  getTurnosFacturacion: async (): Promise<TurnoResponse[]> => {
    try {
      console.log('📡 Llamando endpoint /turnos-facturacion...');
      const response = await api.get('/turnos-facturacion');
      console.log('📥 Respuesta turnos-facturacion:', response.data);
      
      if (response.data.success && response.data.turnos) {
        return response.data.turnos || [];
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.turnos && Array.isArray(response.data.turnos)) {
        return response.data.turnos;
      } else {
        console.warn('⚠️ Formato inesperado en turnos-facturacion:', response.data);
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error en getTurnosFacturacion:', error);
      return [];
    }
  },

  getTurnosAsignacionCita: async (): Promise<TurnoResponse[]> => {
    try {
      console.log('📡 Llamando endpoint /turnos-asignacion-cita...');
      console.log('📡 URL completa:', `${API_URL}/turnos-asignacion-cita`);
      const response = await api.get('/turnos-asignacion-cita');
      console.log('📥 Respuesta completa turnos-asignacion-cita:', response.data);
      console.log('📥 Tipo de respuesta:', typeof response.data);
      console.log('📥 Claves en response.data:', Object.keys(response.data || {}));
      
      if (response.data.success && response.data.turnos) {
        const turnos = response.data.turnos || [];
        console.log('✅ Turnos encontrados (en turnos con success):', turnos.length);
        console.log('📋 Primeros turnos:', turnos.slice(0, 3));
        return turnos;
      } else if (Array.isArray(response.data)) {
        console.log('✅ Turnos encontrados (array directo):', response.data.length);
        return response.data;
      } else if (response.data.turnos && Array.isArray(response.data.turnos)) {
        const turnos = response.data.turnos;
        console.log('✅ Turnos encontrados (en turnos sin success):', turnos.length);
        console.log('📋 Primeros turnos:', turnos.slice(0, 3));
        return turnos;
      } else {
        console.warn('⚠️ Formato inesperado en turnos-asignacion-cita:', response.data);
        console.warn('⚠️ Claves disponibles:', Object.keys(response.data || {}));
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error en getTurnosAsignacionCita:', error);
      console.error('   URL intentada:', `${API_URL}/turnos-asignacion-cita`);
      console.error('   Status:', error.response?.status);
      console.error('   Status Text:', error.response?.statusText);
      console.error('   Detalles:', error.response?.data);
      console.error('   Mensaje:', error.message);
      return [];
    }
  },

  getEstadisticas: async (): Promise<EstadisticasResponse> => {
    const response = await api.get<EstadisticasResponse>('/estadisticas');
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.mensaje || 'Error al obtener estadísticas');
    }
  },

  getSedeConfigurada: async (): Promise<any> => {
    const response = await api.get('/sede-configurada');
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.mensaje || 'Error al obtener configuración de sede');
    }
  },

  // Métodos para gestión de turnos - Usando endpoints simplificados
  llamarTurno: async (numeroTurno: string): Promise<boolean> => {
    try {
      console.log('📢 Llamando turno:', numeroTurno);
      
      const response = await api.post(`/llamar-turno/${numeroTurno}`);
      
      console.log('📥 Respuesta del backend:', response.data);
      
      if (response.data.success || response.data.mensaje || response.status === 200) {
        console.log('✅ Turno llamado exitosamente');
        return true;
      }
      
      console.log('❌ No se pudo llamar el turno - respuesta inválida');
      return false;
    } catch (error: any) {
      console.error('❌ Error llamando turno:', error);
      console.error('❌ Error details:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Error al llamar el turno');
    }
  },

  atenderTurno: async (numeroTurno: string): Promise<boolean> => {
    try {
      console.log('✅ Finalizando turno:', numeroTurno);
      
      const response = await api.post(`/finalizar-turno/${numeroTurno}`);
      
      console.log('📥 Respuesta del backend:', response.data);
      
      if (response.data.success || response.data.mensaje || response.status === 200) {
        console.log('✅ Turno finalizado exitosamente');
        return true;
      }
      
      console.log('❌ No se pudo finalizar el turno - respuesta inválida');
      return false;
    } catch (error: any) {
      console.error('❌ Error finalizando turno:', error);
      console.error('❌ Error details:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Error al marcar turno como atendido');
    }
  },

  cancelarTurno: async (numeroTurno: string): Promise<boolean> => {
    try {
      console.log('❌ Cancelando turno:', numeroTurno);
      
      // Para cancelar, usamos el endpoint de finalizar
      const response = await api.post(`/finalizar-turno/${numeroTurno}`);
      
      console.log('📥 Respuesta del backend:', response.data);
      
      if (response.data.success || response.data.mensaje || response.status === 200) {
        console.log('✅ Turno cancelado exitosamente');
        return true;
      }
      
      console.log('❌ No se pudo cancelar el turno - respuesta inválida');
      return false;
    } catch (error: any) {
      console.error('❌ Error cancelando turno:', error);
      console.error('❌ Error details:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Error al cancelar el turno');
    }
  }
};

export const pacienteService = {
  buscarPorDocumento: async (tipoDocumento: string, numeroDocumento: string): Promise<{ paciente?: Paciente; citas?: Cita[] }> => {
    try {
      const requestData = {
        tipo_documento: tipoDocumento,
        numero_documento: numeroDocumento
      };
      const response = await api.post('/buscar-paciente', requestData);
      if (response.data.success && response.data.paciente) {
        return {
          paciente: response.data.paciente,
          citas: response.data.citas || []
        };
      } else {
        throw new Error(response.data.detail || 'Paciente no encontrado');
      }
    } catch (error) {
      console.error('Error buscando paciente:', error);
      throw error;
    }
  },

  getTiposDocumento: async (): Promise<string[]> => {
    try {
      const response = await api.get('/tipos-documento');
      return response.data.tipos || ['CC', 'TI', 'CE', 'PA'];
    } catch (error) {
      console.error('Error obteniendo tipos de documento:', error);
      return ['CC', 'TI', 'CE', 'PA'];
    }
  },

  getMotivosPreferenciales: async (): Promise<string[]> => {
    try {
      const response = await api.get<MotivosPreferencialesResponse>('/motivos-preferenciales');
      return response.data.motivos?.map((motivo: any) => motivo.codigo) || ['EMBARAZO', 'DISCAPACIDAD', 'TERCERA_EDAD'];
    } catch (error) {
      console.error('Error obteniendo motivos preferenciales:', error);
      return ['EMBARAZO', 'DISCAPACIDAD', 'TERCERA_EDAD'];
    }
  }
}; 