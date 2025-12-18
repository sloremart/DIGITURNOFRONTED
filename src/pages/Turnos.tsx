import React, { useState, useEffect } from 'react';
import { pacienteService, digiturnoService } from '../services/api';
import { Paciente, Cita, TurnoResponse } from '../types';
import './Turnos.css';

const Turnos: React.FC = () => {
  const [tipoDocumento, setTipoDocumento] = useState('CC');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [nombrePaciente, setNombrePaciente] = useState('');
  const [turnosActivos, setTurnosActivos] = useState<TurnoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Paciente | null>(null);
  const [citasPaciente, setCitasPaciente] = useState<Cita[]>([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [tiposDocumento, setTiposDocumento] = useState<string[]>(['CC', 'TI', 'CE', 'PA']);
  const [motivosPreferenciales, setMotivosPreferenciales] = useState<string[]>(['EMBARAZO', 'DISCAPACIDAD', 'TERCERA_EDAD']);
  const [esPreferencial, setEsPreferencial] = useState(false);
  const [motivoPreferencial, setMotivoPreferencial] = useState('');
  
  // Nuevos estados para manejar los dos tipos de flujo
  const [tipoOperacion, setTipoOperacion] = useState<'FACTURACION' | 'ASIGNACION_CITA'>('FACTURACION');

  useEffect(() => {
    cargarTiposDocumento();
    cargarMotivosPreferenciales();
    cargarTurnosActivos();
  }, []);

  const cargarTiposDocumento = async () => {
    try {
      const tipos = await pacienteService.getTiposDocumento();
      if (tipos && tipos.length > 0) {
        setTiposDocumento(tipos);
      }
    } catch (error) {
      console.log('Usando tipos de documento por defecto');
      // Mantener los tipos por defecto que ya están en el estado inicial
    }
  };

  const cargarMotivosPreferenciales = async () => {
    try {
      const motivos = await pacienteService.getMotivosPreferenciales();
      if (motivos && motivos.length > 0) {
        setMotivosPreferenciales(motivos);
      }
    } catch (error) {
      console.log('Usando motivos preferenciales por defecto');
      // Mantener los motivos por defecto que ya están en el estado inicial
    }
  };

  const cargarTurnosActivos = async () => {
    try {
      const turnos = await digiturnoService.getTurnosActivos();
      setTurnosActivos(turnos);
    } catch (error) {
      console.error('Error cargando turnos activos:', error);
    }
  };

  const buscarPaciente = async () => {
    if (!numeroDocumento.trim()) {
      setMessage('Por favor ingrese un número de documento');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const resultado = await pacienteService.buscarPorDocumento(tipoDocumento, numeroDocumento);
      setPacienteEncontrado(resultado.paciente || null);
      setCitasPaciente(resultado.citas || []);
      setMessage('Paciente encontrado');
    } catch (error) {
      setMessage('Paciente no encontrado');
      setPacienteEncontrado(null);
      setCitasPaciente([]);
    } finally {
      setLoading(false);
    }
  };

  const asignarTurno = async () => {
    setLoading(true);

    try {
      let turno: TurnoResponse;

      if (tipoOperacion === 'FACTURACION') {
        // Para facturación: necesita paciente y cita
        if (!pacienteEncontrado) {
          setMessage('Primero debe buscar un paciente');
          return;
        }

        if (!citaSeleccionada) {
          setMessage('Por favor seleccione una cita');
          return;
        }

        // Validar motivo preferencial si es turno preferencial
        if (esPreferencial && !motivoPreferencial) {
          setMessage('Por favor seleccione un motivo para el turno preferencial');
          return;
        }

        console.log('🎫 Asignando turno de FACTURACIÓN');
        turno = await digiturnoService.asignarTurno(
          pacienteEncontrado.numero_paciente,
          citaSeleccionada.id_cita,
          esPreferencial,
          motivoPreferencial
        );

      } else {
        // Para asignación de cita: solo necesita documento (no búsqueda en BD)
        if (!numeroDocumento.trim()) {
          setMessage('Por favor ingrese un número de documento');
          return;
        }

        // Validar motivo preferencial si es turno preferencial
        if (esPreferencial && !motivoPreferencial) {
          setMessage('Por favor seleccione un motivo para el turno preferencial');
          return;
        }

        console.log('📅 Asignando turno de ASIGNACIÓN DE CITA');
        
        if (esPreferencial) {
          turno = await digiturnoService.asignarTurnoPreferencial(
            tipoDocumento,
            numeroDocumento,
            motivoPreferencial,
            nombrePaciente || undefined
          );
        } else {
          turno = await digiturnoService.asignarTurnoAsignacionCita(
            tipoDocumento,
            numeroDocumento,
            nombrePaciente || undefined
          );
        }
      }
      
      console.log('Turno asignado exitosamente:', turno);
      setMessage(`Turno asignado exitosamente: ${turno.numero_turno}`);
      
      // Limpiar formulario
      resetForm();
      
      // Recargar turnos activos
      await cargarTurnosActivos();
    } catch (error: any) {
      console.error('Error asignando turno:', error);
      setMessage(error.message || 'Error al asignar turno');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTipoDocumento('CC');
    setNumeroDocumento('');
    setNombrePaciente('');
    setPacienteEncontrado(null);
    setCitasPaciente([]);
    setCitaSeleccionada(null);
    setEsPreferencial(false);
    setMotivoPreferencial('');
  };

  const cambiarTipoOperacion = (tipo: 'FACTURACION' | 'ASIGNACION_CITA') => {
    setTipoOperacion(tipo);
    resetForm();
  };

  const getNombreCompleto = (paciente: Paciente) => {
    const nombres = [paciente.nombre1, paciente.nombre2].filter(Boolean).join(' ');
    const apellidos = [paciente.apellido1, paciente.apellido2].filter(Boolean).join(' ');
    return `${nombres} ${apellidos}`.trim();
  };

  const getEstadoCita = (estado: number) => {
    switch (estado) {
      case 0: return 'Programada';
      case 1: return 'Confirmada';
      case 2: return 'En Proceso';
      case 3: return 'Completada';
      case 4: return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return '#ff9800';
      case 'LLAMADO': return '#2196f3';
      case 'ATENDIDO': return '#4caf50';
      case 'CANCELADO': return '#f44336';
      default: return '#757575';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'LLAMADO': return 'Llamado';
      case 'ATENDIDO': return 'Atendido';
      case 'CANCELADO': return 'Cancelado';
      default: return estado;
    }
  };

  return (
    <div className="turnos-page">
      <div className="turnos-container">
        {/* Header */}
        <div className="page-header">
          <h1>Gestión de Turnos</h1>
          <p>Asigna turnos para facturación o asignación de citas</p>
          
          {/* Selector de tipo de operación */}
          <div className="operation-selector">
            <h3>¿Para qué viene el paciente?</h3>
            <div className="operation-buttons">
              <button
                className={`operation-btn ${tipoOperacion === 'FACTURACION' ? 'active' : ''}`}
                onClick={() => cambiarTipoOperacion('FACTURACION')}
              >
                💰 Facturación
                <small>Viene a facturar (requiere cita)</small>
              </button>
              <button
                className={`operation-btn ${tipoOperacion === 'ASIGNACION_CITA' ? 'active' : ''}`}
                onClick={() => cambiarTipoOperacion('ASIGNACION_CITA')}
              >
                📅 Asignación de Cita
                <small>Primera vez o agendar cita</small>
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-card">
            <h2>
              {tipoOperacion === 'FACTURACION' ? '🔍 Buscar Paciente' : '📝 Datos del Paciente'}
            </h2>
            <div className="search-form">
              <div className="input-group">
                <label htmlFor="tipoDocumento">Tipo de Documento:</label>
                <select
                  id="tipoDocumento"
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className="input-field"
                >
                  {tiposDocumento.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="numeroDocumento">Número de Documento:</label>
                <input
                  type="text"
                  id="numeroDocumento"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  placeholder="Ingrese el número de documento"
                  className="input-field"
                />
              </div>
              {tipoOperacion === 'FACTURACION' && (
                <button 
                  onClick={buscarPaciente}
                  disabled={loading}
                  className="btn-search"
                >
                  {loading ? 'Buscando...' : '🔍 Buscar'}
                </button>
              )}
            </div>

            {/* Patient Info */}
            {pacienteEncontrado && (
              <div className="patient-info">
                <h3>✅ Paciente Encontrado</h3>
                <div className="patient-details">
                  <p><strong>Nombre:</strong> {getNombreCompleto(pacienteEncontrado)}</p>
                  <p><strong>Documento:</strong> {tipoDocumento} {pacienteEncontrado.id_paciente}</p>
                  {pacienteEncontrado.telefono && (
                    <p><strong>Teléfono:</strong> {pacienteEncontrado.telefono}</p>
                  )}
                  {pacienteEncontrado.fecha_nacimiento && (
                    <p><strong>Fecha de Nacimiento:</strong> {new Date(pacienteEncontrado.fecha_nacimiento).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            )}

            {/* Citas Selection - Solo para facturación */}
            {tipoOperacion === 'FACTURACION' && pacienteEncontrado && citasPaciente.length > 0 && (
              <div className="citas-selection">
                <h3>📅 Citas Programadas</h3>
                <p className="citas-subtitle">Selecciona una cita para asignar el turno:</p>
                <div className="citas-grid">
                  {citasPaciente.map((cita) => (
                    <div
                      key={cita.id_cita}
                      className={`cita-option ${citaSeleccionada?.id_cita === cita.id_cita ? 'selected' : ''}`}
                      onClick={() => setCitaSeleccionada(cita)}
                    >
                      <div className="cita-icon">📋</div>
                      <div className="cita-info">
                        <h4>Cita #{cita.id_cita}</h4>
                        <div className="cita-details">
                          <div className="cita-date">
                            <span className="date-icon">📅</span>
                            <span className="date-text">
                              {new Date(cita.fecha_cita).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          {cita.hora_cita && (
                            <div className="cita-time">
                              <span className="time-icon">🕐</span>
                              <span className="time-text">{cita.hora_cita}</span>
                            </div>
                          )}
                          {cita.procedimiento && (
                            <div className="cita-procedure">
                              <span className="procedure-icon">🏥</span>
                              <span className="procedure-text">{cita.procedimiento}</span>
                            </div>
                          )}
                          {cita.estado !== undefined && (
                            <div className="cita-status">
                              <span className="status-icon">📊</span>
                              <span className="status-text">{getEstadoCita(cita.estado)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                                 {citaSeleccionada && (
                   <div className="selected-cita-info">
                     <h4>✅ Cita Seleccionada</h4>
                     <div className="selected-cita-details">
                       <p><strong>Cita #:</strong> {citaSeleccionada.id_cita}</p>
                       <p><strong>Fecha:</strong> {new Date(citaSeleccionada.fecha_cita).toLocaleDateString('es-ES', {
                         weekday: 'long',
                         year: 'numeric',
                         month: 'long',
                         day: 'numeric'
                       })}</p>
                       {citaSeleccionada.hora_cita && (
                         <p><strong>Hora:</strong> {citaSeleccionada.hora_cita}</p>
                       )}
                       {citaSeleccionada.procedimiento && (
                         <p><strong>Procedimiento:</strong> {citaSeleccionada.procedimiento}</p>
                       )}
                     </div>
                   </div>
                 )}

                 {/* Turno Preferencial */}
                 <div className="preferencial-section">
                   <h4>🎯 Turno Preferencial</h4>
                   <div className="preferencial-controls">
                     <div className="checkbox-group">
                       <input
                         type="checkbox"
                         id="esPreferencial"
                         checked={esPreferencial}
                         onChange={(e) => setEsPreferencial(e.target.checked)}
                         className="checkbox-input"
                       />
                       <label htmlFor="esPreferencial" className="checkbox-label">
                         ¿Es un turno preferencial?
                       </label>
                     </div>
                     
                     {esPreferencial && (
                       <div className="input-group">
                         <label htmlFor="motivoPreferencial">Motivo Preferencial:</label>
                         <select
                           id="motivoPreferencial"
                           value={motivoPreferencial}
                           onChange={(e) => setMotivoPreferencial(e.target.value)}
                           className="input-field"
                         >
                           <option value="">Seleccione un motivo</option>
                           {motivosPreferenciales.map((motivo) => (
                             <option key={motivo} value={motivo}>{motivo}</option>
                           ))}
                         </select>
                       </div>
                     )}
                   </div>
                 </div>
                
                <button
                  onClick={asignarTurno}
                  disabled={
                    loading || 
                    (tipoOperacion === 'FACTURACION' && (!pacienteEncontrado || !citaSeleccionada)) ||
                    (tipoOperacion !== 'FACTURACION' && !numeroDocumento.trim())
                  }
                  className="btn-assign"
                >
                  {loading ? '⏳ Asignando Turno...' : 
                   tipoOperacion === 'FACTURACION' ? '🎫 Asignar Turno para Facturación' : 
                   '🎫 Asignar Turno para Asignación de Cita'}
                </button>
              </div>
            )}

            {tipoOperacion === 'FACTURACION' && pacienteEncontrado && citasPaciente.length === 0 && (
              <div className="no-citas">
                <p>⚠️ El paciente no tiene citas programadas para hoy</p>
              </div>
            )}

            {/* Botón directo para asignación de cita (sin búsqueda) */}
            {tipoOperacion === 'ASIGNACION_CITA' && (
              <div className="direct-assignment">
                <h3>📅 Asignación Directa</h3>
                <p>Para pacientes que vienen a agendar cita por primera vez</p>
                
                {/* Campo para nombre del paciente */}
                <div className="input-group">
                  <label htmlFor="nombrePaciente">Nombre del Paciente (Opcional):</label>
                  <input
                    type="text"
                    id="nombrePaciente"
                    value={nombrePaciente}
                    onChange={(e) => setNombrePaciente(e.target.value)}
                    placeholder="Ingrese el nombre completo del paciente"
                    className="input-field"
                  />
                  <small className="input-help">Si no se ingresa, se usará el documento como identificador</small>
                </div>
                
                {/* Turno Preferencial para asignación de cita */}
                <div className="preferencial-section">
                  <h4>🎯 Turno Preferencial</h4>
                  <div className="preferencial-controls">
                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        id="esPreferencialDirecto"
                        checked={esPreferencial}
                        onChange={(e) => setEsPreferencial(e.target.checked)}
                        className="checkbox-input"
                      />
                      <label htmlFor="esPreferencialDirecto" className="checkbox-label">
                        ¿Es un turno preferencial?
                      </label>
                    </div>
                    
                    {esPreferencial && (
                      <div className="input-group">
                        <label htmlFor="motivoPreferencialDirecto">Motivo Preferencial:</label>
                        <select
                          id="motivoPreferencialDirecto"
                          value={motivoPreferencial}
                          onChange={(e) => setMotivoPreferencial(e.target.value)}
                          className="input-field"
                        >
                          <option value="">Seleccione un motivo</option>
                          {motivosPreferenciales.map((motivo) => (
                            <option key={motivo} value={motivo}>{motivo}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={asignarTurno}
                  disabled={loading || !numeroDocumento.trim()}
                  className="btn-assign"
                >
                  {loading ? '⏳ Asignando Turno...' : '🎫 Asignar Turno para Asignación de Cita'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {/* Active Turnos */}
        <div className="active-turnos">
          <h2>📋 Turnos Activos</h2>
          <div className="turnos-grid">
            {turnosActivos.length > 0 ? (
              turnosActivos.map((turno) => (
                <div key={turno.numero_turno} className="turno-card">
                  <div className="turno-header">
                    <span className="turno-numero">{turno.numero_turno}</span>
                    <span 
                      className="turno-estado"
                      style={{ backgroundColor: getEstadoColor(turno.estado) }}
                    >
                      {getEstadoTexto(turno.estado)}
                    </span>
                  </div>
                  <div className="turno-content">
                    <p className="turno-paciente">
                      <strong>Paciente:</strong> {turno.nombre_paciente || (turno.paciente ? getNombreCompleto(turno.paciente) : 'No disponible')}
                    </p>
                    {turno.cita && (
                      <p className="turno-cita">
                        <strong>Cita #:</strong> {turno.cita.id_cita}
                      </p>
                    )}
                    <p className="turno-fecha">
                      📅 {new Date(turno.hora_asignacion).toLocaleString()}
                    </p>
                    {turno.cita?.procedimiento && (
                      <p className="turno-procedimiento">
                        🏥 {turno.cita.procedimiento}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🎫</span>
                <p>No hay turnos activos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Turnos; 