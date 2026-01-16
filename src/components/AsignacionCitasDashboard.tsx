import React, { useState, useEffect } from 'react';
import { TurnoResponse } from '../types';
import { digiturnoService } from '../services/api';
import './AsignacionCitasDashboard.css';

const AsignacionCitasDashboard: React.FC = () => {
  const [turnosPendientes, setTurnosPendientes] = useState<TurnoResponse[]>([]);
  const [turnosLlamados, setTurnosLlamados] = useState<TurnoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    cargarTurnos();
    
    // Auto-refresh cada 15 segundos
    const interval = setInterval(cargarTurnos, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const cargarTurnos = async () => {
    setLoading(true);
    try {
      console.log('🔄 Iniciando carga de turnos de asignación de citas...');
      // Usar el endpoint específico para turnos de asignación de citas
      const turnos = await digiturnoService.getTurnosAsignacionCita();
      
      console.log('📊 Turnos de asignación de citas recibidos del backend:', turnos);
      console.log('📊 Cantidad de turnos recibidos:', turnos?.length || 0);
      console.log('📊 Tipo de turnos:', Array.isArray(turnos) ? 'Array' : typeof turnos);
      
      // Debug: mostrar todos los turnos recibidos
      console.log('🔍 Debug - Turnos de asignación recibidos:', turnos.map(t => ({
        numero: t.numero_turno,
        modulo: t.modulo,
        tipo_operador: t.tipo_operador,
        estado: t.estado
      })));
      
      // Ya no necesitamos filtrar, el backend nos devuelve solo los turnos de asignación
      const turnosAsignacion = turnos;
      
      console.log('🔍 Endpoint específico de asignación usado - no se requiere filtrado adicional');
      
      console.log('📅 Turnos de asignación de citas:', turnosAsignacion);
      
      const pendientes = turnosAsignacion.filter(t => {
        const esPendiente = t.estado === 'PENDIENTE';
        if (!esPendiente) {
          console.log(`⚠️ Turno ${t.numero_turno} no es PENDIENTE, estado: "${t.estado}"`);
        }
        return esPendiente;
      });
      const llamados = turnosAsignacion.filter(t => t.estado === 'LLAMADO');
      
      console.log('📋 Turnos pendientes de asignación:', pendientes);
      console.log('📋 Cantidad de pendientes:', pendientes.length);
      console.log('📢 Turnos llamados de asignación:', llamados);
      console.log('📢 Cantidad de llamados:', llamados.length);
      
      // Verificar que los estados se están estableciendo
      console.log('🔍 ANTES de setTurnosPendientes - pendientes.length:', pendientes.length);
      console.log('🔍 ANTES de setTurnosLlamados - llamados.length:', llamados.length);
      
      // Debug: mostrar información de filtrado
      console.log('🔍 Debug filtrado asignación:', {
        total_turnos: turnos.length,
        turnos_asignacion: turnos.filter(t => t.modulo === 'ASIGNACION_CITA').length,
        turnos_preferenciales_asignador: turnos.filter(t => t.modulo === 'PREFERENCIAL' && t.tipo_operador === 'ASIGNADOR_CITA').length,
        turnos_filtrados: turnosAsignacion.length
      });
      
      // Debug: mostrar qué turnos se están filtrando
      console.log('🔍 Turnos que pasan el filtro de asignación:', turnosAsignacion.map(t => ({
        numero: t.numero_turno,
        modulo: t.modulo,
        tipo_operador: t.tipo_operador,
        estado: t.estado
      })));
      
      // Ordenar por hora de asignación (más antiguos primero)
      const ordenarPorHora = (a: TurnoResponse, b: TurnoResponse) => 
        new Date(a.hora_asignacion).getTime() - new Date(b.hora_asignacion).getTime();
      
      const pendientesOrdenados = pendientes.sort(ordenarPorHora);
      const llamadosOrdenados = llamados.sort(ordenarPorHora);
      
      console.log('🔍 DESPUÉS de ordenar - pendientesOrdenados.length:', pendientesOrdenados.length);
      console.log('🔍 DESPUÉS de ordenar - llamadosOrdenados.length:', llamadosOrdenados.length);
      console.log('🔍 Primeros 3 pendientes ordenados:', pendientesOrdenados.slice(0, 3).map(t => ({
        numero: t.numero_turno,
        estado: t.estado,
        nombre: t.nombre_paciente
      })));
      
      setTurnosPendientes(pendientesOrdenados);
      setTurnosLlamados(llamadosOrdenados);
      setLastUpdate(new Date());
      
      console.log('✅ Estados actualizados - turnosPendientes y turnosLlamados establecidos');
      
    } catch (error) {
      console.error('Error cargando turnos de asignación de citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const llamarTurno = async (turno: TurnoResponse) => {
    try {
      console.log('📢 Llamando turno:', turno.numero_turno);
      await digiturnoService.llamarTurno(turno.numero_turno);
      console.log('✅ Turno llamado, recargando lista...');
      await cargarTurnos(); // Recargar para actualizar estados
    } catch (error) {
      console.error('Error llamando turno:', error);
    }
  };

  const atenderTurno = async (turno: TurnoResponse) => {
    try {
      await digiturnoService.atenderTurno(turno.numero_turno);
      await cargarTurnos(); // Recargar para actualizar estados
    } catch (error) {
      console.error('Error atendiendo turno:', error);
    }
  };

  const getNombreCompleto = (paciente: any) => {
    if (!paciente) return 'Paciente no disponible';
    const nombres = [paciente.nombre1, paciente.nombre2].filter(Boolean).join(' ');
    const apellidos = [paciente.apellido1, paciente.apellido2].filter(Boolean).join(' ');
    return `${nombres} ${apellidos}`.trim() || 'Paciente no disponible';
  };

  const mostrarNombrePaciente = (turno: TurnoResponse) => {
    // Prioridad 1: nombre_paciente del backend (que ya funciona)
    if (turno.nombre_paciente) {
      return turno.nombre_paciente;
    }
    // Prioridad 2: objeto paciente del frontend
    if (turno.paciente) {
      return getNombreCompleto(turno.paciente);
    }
    // Fallback
    return 'Paciente no disponible';
  };

  const getTiempoEspera = (horaAsignacion: string) => {
    const asignacion = new Date(horaAsignacion);
    const ahora = new Date();
    const diffMs = ahora.getTime() - asignacion.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const horas = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${horas}h ${mins}min`;
    }
  };

  const getPrioridadColor = (turno: TurnoResponse) => {
    const tiempoEspera = getTiempoEspera(turno.hora_asignacion);
    const mins = parseInt(tiempoEspera.split(' ')[0]);
    
    if (mins > 60) return '#e53e3e'; // Rojo suave - más de 1 hora
    if (mins > 30) return '#9f7aea'; // Morado claro - más de 30 min
    return '#4299e1'; // Azul suave - menos de 30 min
  };

  return (
    <div className="facturacion-dashboard">
      <div className="dashboard-header">
        <h1>📅 Dashboard de Asignación de Citas</h1>
        <div className="dashboard-stats">
          <div className="stat-card pending">
            <span className="stat-number">{turnosPendientes.length}</span>
            <span className="stat-label">Pendientes</span>
          </div>
          <div className="stat-card called">
            <span className="stat-number">{turnosLlamados.length}</span>
            <span className="stat-label">Llamados</span>
          </div>
          <div className="stat-card total">
            <span className="stat-number">{turnosPendientes.length + turnosLlamados.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="dashboard-controls">
          <button 
            className="btn-refresh-dashboard"
            onClick={cargarTurnos}
            disabled={loading}
          >
            {loading ? '⏳ Actualizando...' : '🔄 Actualizar'}
          </button>
          <span className="last-update">
            Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
          </span>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Turnos Pendientes */}
        <div className="dashboard-section">
          <h2 className="section-title pending">
            ⏳ Turnos Pendientes ({turnosPendientes.length})
          </h2>
          <div className="turnos-grid-dashboard">
            {(() => {
              console.log('🎨 RENDERIZANDO - turnosPendientes.length:', turnosPendientes.length);
              console.log('🎨 RENDERIZANDO - turnosPendientes:', turnosPendientes);
              return null;
            })()}
            {turnosPendientes.length > 0 ? (
              turnosPendientes.map(turno => {
                console.log('🎨 Renderizando turno:', turno.numero_turno);
                return (
                <div key={turno.numero_turno} className={`turno-card-dashboard pending ${turno.es_preferencial ? 'preferencial' : ''}`}>
                  <div className="turno-header-dashboard">
                    <span className="turno-numero-dashboard">{turno.numero_turno}</span>
                    <span 
                      className="turno-prioridad-dashboard"
                      style={{ backgroundColor: getPrioridadColor(turno) }}
                    >
                      {getTiempoEspera(turno.hora_asignacion)}
                    </span>
                  </div>
                  
                  <div className="turno-content-dashboard">
                    <p className="turno-paciente-dashboard">
                      <strong>{mostrarNombrePaciente(turno)}</strong>
                    </p>
                    
                    {turno.es_preferencial && (
                      <p className="turno-motivo-dashboard">
                        📋 Motivo: {turno.motivo_preferencial}
                      </p>
                    )}
                    
                    <p className="turno-hora-dashboard">
                      ⏰ {new Date(turno.hora_asignacion).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  
                  <div className="turno-actions-dashboard">
                    <button 
                      className="btn-llamar-dashboard"
                      onClick={() => llamarTurno(turno)}
                    >
                      📢 Llamar
                    </button>
                  </div>
                </div>
              );
              })
            ) : (
              <div className="empty-state-dashboard">
                <span className="empty-icon-dashboard">📅</span>
                <p>No hay turnos pendientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Turnos Llamados */}
        <div className="dashboard-section">
          <h2 className="section-title called">
            📢 Turnos Llamados ({turnosLlamados.length})
          </h2>
          <div className="turnos-grid-dashboard">
            {turnosLlamados.length > 0 ? (
              turnosLlamados.map(turno => (
                <div key={turno.numero_turno} className={`turno-card-dashboard called ${turno.es_preferencial ? 'preferencial' : ''}`}>
                  <div className="turno-header-dashboard">
                    <span className="turno-numero-dashboard">{turno.numero_turno}</span>
                    <span className="turno-estado-dashboard called">
                      Llamado
                    </span>
                  </div>
                  
                  <div className="turno-content-dashboard">
                    <p className="turno-paciente-dashboard">
                      <strong>{mostrarNombrePaciente(turno)}</strong>
                    </p>
                    
                    {turno.es_preferencial && (
                      <p className="turno-motivo-dashboard">
                        📋 Motivo: {turno.motivo_preferencial}
                      </p>
                    )}
                    
                    <p className="turno-hora-dashboard">
                      ⏰ {new Date(turno.hora_asignacion).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  
                  <div className="turno-actions-dashboard">
                    <button 
                      className="btn-atender-dashboard"
                      onClick={() => atenderTurno(turno)}
                    >
                      ✅ Atender
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state-dashboard">
                <span className="empty-icon-dashboard">📢</span>
                <p>No hay turnos llamados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Indicador de estado del sistema */}
      <div className="system-status">
        <div className="status-indicator online">
          <span className="status-dot"></span>
          Sistema en línea
        </div>
        <div className="status-info">
          <span>Auto-refresh: Activado (15s)</span>
          <span>Conectado a: Backend API</span>
        </div>
      </div>
    </div>
  );
};

export default AsignacionCitasDashboard;