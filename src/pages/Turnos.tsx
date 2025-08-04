import React, { useState, useEffect } from 'react';
import { turnoService, servicioService, pacienteService } from '../services/api';
import { Turno, Servicio, TurnoRequest, Paciente } from '../types';
import './Turnos.css';

const Turnos: React.FC = () => {
  const [documento, setDocumento] = useState('');
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [turnosPendientes, setTurnosPendientes] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedServicio, setSelectedServicio] = useState<number | null>(null);
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Paciente | null>(null);

  useEffect(() => {
    cargarServicios();
    cargarTurnosPendientes();
  }, []);

  const cargarServicios = async () => {
    try {
      const serviciosData = await servicioService.getServiciosActivos();
      setServicios(serviciosData);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    }
  };

  const cargarTurnosPendientes = async () => {
    try {
      const turnos = await turnoService.getTurnosPendientes();
      setTurnosPendientes(turnos);
    } catch (error) {
      console.error('Error cargando turnos:', error);
    }
  };

  const buscarPaciente = async () => {
    if (!documento.trim()) {
      setMessage('Por favor ingrese un número de documento');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const paciente = await pacienteService.buscarPorDocumento(documento);
      setPacienteEncontrado(paciente);
      setMessage('Paciente encontrado');
    } catch (error) {
      setMessage('Paciente no encontrado');
      setPacienteEncontrado(null);
    } finally {
      setLoading(false);
    }
  };

  const asignarTurno = async () => {
    if (!selectedServicio) {
      setMessage('Por favor seleccione un servicio');
      return;
    }

    if (!pacienteEncontrado) {
      setMessage('Primero debe buscar un paciente');
      return;
    }

    setLoading(true);

    try {
      const turnoData: TurnoRequest = {
        servicio_id: selectedServicio,
        nombre_cliente: pacienteEncontrado.nombre,
        email_cliente: pacienteEncontrado.email || ''
      };

      const nuevoTurno = await turnoService.crearTurno(turnoData);
      
      setMessage(`Turno asignado exitosamente: #${nuevoTurno.numero}`);
      setDocumento('');
      setPacienteEncontrado(null);
      setSelectedServicio(null);
      
      // Recargar turnos pendientes
      await cargarTurnosPendientes();
    } catch (error) {
      setMessage('Error al asignar turno');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return '#ff9800';
      case 'en_atencion': return '#2196f3';
      case 'completado': return '#4caf50';
      case 'cancelado': return '#f44336';
      default: return '#757575';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_atencion': return 'En Atención';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  return (
    <div className="turnos-page">
      <div className="turnos-container">
        {/* Header */}
        <div className="page-header">
          <h1>Gestión de Turnos</h1>
          <p>Busca pacientes y asigna turnos para los servicios disponibles</p>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-card">
            <h2>🔍 Buscar Paciente</h2>
            <div className="search-form">
              <div className="input-group">
                <label htmlFor="documento">Número de Documento:</label>
                <input
                  type="text"
                  id="documento"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="Ingrese el número de documento"
                  className="input-field"
                />
              </div>
              <button 
                onClick={buscarPaciente}
                disabled={loading}
                className="btn-search"
              >
                {loading ? 'Buscando...' : '🔍 Buscar'}
              </button>
            </div>

            {/* Patient Info */}
            {pacienteEncontrado && (
              <div className="patient-info">
                <h3>✅ Paciente Encontrado</h3>
                <div className="patient-details">
                                     <p><strong>Nombre:</strong> {pacienteEncontrado.nombre}</p>
                   <p><strong>Documento:</strong> {pacienteEncontrado.documento}</p>
                   {pacienteEncontrado.email && (
                     <p><strong>Email:</strong> {pacienteEncontrado.email}</p>
                   )}
                   {pacienteEncontrado.telefono && (
                     <p><strong>Teléfono:</strong> {pacienteEncontrado.telefono}</p>
                   )}
                   {pacienteEncontrado.tiene_cita && pacienteEncontrado.citas && pacienteEncontrado.citas.length > 0 && (
                     <div className="cita-info">
                       <p><strong>Tiene citas programadas:</strong></p>
                       {pacienteEncontrado.citas.map((cita, index) => (
                         <div key={cita.id} className="cita-item">
                           <p>📅 {cita.fecha} - ⏰ {cita.hora}</p>
                           <p>🏥 {cita.servicio} - {cita.estado}</p>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              </div>
            )}

            {/* Service Selection */}
            {pacienteEncontrado && (
              <div className="service-selection">
                <h3>🎯 Seleccionar Servicio</h3>
                <div className="services-grid">
                  {servicios.map((servicio) => (
                    <div
                      key={servicio.id}
                      className={`service-option ${selectedServicio === servicio.id ? 'selected' : ''}`}
                      onClick={() => setSelectedServicio(servicio.id)}
                    >
                      <div className="service-icon">🏥</div>
                      <h4>{servicio.nombre}</h4>
                      <p>{servicio.descripcion}</p>
                      <span className="service-time">⏱️ {servicio.tiempo_promedio} min</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={asignarTurno}
                  disabled={!selectedServicio || loading}
                  className="btn-assign"
                >
                  {loading ? 'Asignando...' : '🎫 Asignar Turno'}
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

        {/* Pending Turnos */}
        <div className="pending-turnos">
          <h2>📋 Turnos Pendientes</h2>
          <div className="turnos-grid">
            {turnosPendientes.length > 0 ? (
              turnosPendientes.map((turno) => (
                <div key={turno.id} className="turno-card">
                  <div className="turno-header">
                    <span className="turno-numero">#{turno.numero}</span>
                    <span 
                      className="turno-estado"
                      style={{ backgroundColor: getEstadoColor(turno.estado) }}
                    >
                      {getEstadoTexto(turno.estado)}
                    </span>
                  </div>
                  <div className="turno-content">
                    <p className="turno-servicio">{turno.servicio}</p>
                    <p className="turno-fecha">
                      📅 {new Date(turno.fecha_creacion).toLocaleString()}
                    </p>
                    {turno.tiempo_espera && (
                      <p className="turno-tiempo">
                        ⏱️ Tiempo de espera: {turno.tiempo_espera} min
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🎫</span>
                <p>No hay turnos pendientes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Turnos; 