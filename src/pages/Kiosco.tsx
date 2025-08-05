import React, { useState, useEffect } from 'react';
import { pacienteService, digiturnoService } from '../services/api';
import { Paciente, Cita, TurnoResponse } from '../types';
import './Kiosco.css';

const Kiosco: React.FC = () => {
  const [tipoDocumento, setTipoDocumento] = useState('CC');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Paciente | null>(null);
  const [citasPaciente, setCitasPaciente] = useState<Cita[]>([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [turnoAsignado, setTurnoAsignado] = useState<TurnoResponse | null>(null);
  const [step, setStep] = useState<'documento' | 'citas' | 'confirmacion' | 'exito'>('documento');
  const [tiposDocumento, setTiposDocumento] = useState<string[]>(['CC', 'TI', 'CE', 'PA']);

  useEffect(() => {
    cargarTiposDocumento();
  }, []);

  const cargarTiposDocumento = async () => {
    try {
      const tipos = await pacienteService.getTiposDocumento();
      setTiposDocumento(tipos);
    } catch (error) {
      console.log('Usando tipos de documento por defecto');
    }
  };

  const buscarPaciente = async () => {
    if (!numeroDocumento.trim()) {
      setMessage('Por favor ingrese su número de documento');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Buscar paciente en el backend
      const resultado = await pacienteService.buscarPorDocumento(tipoDocumento, numeroDocumento);
      setPacienteEncontrado(resultado.paciente);
      setCitasPaciente(resultado.citas);
      
      if (resultado.citas.length > 0) {
        setStep('citas');
        setMessage('Paciente encontrado. Seleccione su cita para asignar turno.');
      } else {
        setMessage('Paciente encontrado pero no tiene citas programadas para hoy.');
      }
    } catch (error) {
      setMessage('Paciente no encontrado. Verifique su tipo y número de documento.');
      setPacienteEncontrado(null);
      setCitasPaciente([]);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarCita = (cita: Cita) => {
    setCitaSeleccionada(cita);
    setStep('confirmacion');
    setMessage('');
  };

  const asignarTurno = async () => {
    if (!citaSeleccionada || !pacienteEncontrado) {
      setMessage('Faltan datos para asignar el turno');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Asignar turno usando el backend real
      const turno = await digiturnoService.asignarTurno(
        pacienteEncontrado.numero_paciente,
        citaSeleccionada.id_cita
      );
      setTurnoAsignado(turno);
      setStep('exito');
    } catch (error) {
      setMessage('Error al asignar turno. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const reiniciar = () => {
    setTipoDocumento('CC');
    setNumeroDocumento('');
    setPacienteEncontrado(null);
    setCitasPaciente([]);
    setCitaSeleccionada(null);
    setMessage('');
    setTurnoAsignado(null);
    setStep('documento');
  };

  const volverADocumento = () => {
    setStep('documento');
    setPacienteEncontrado(null);
    setCitasPaciente([]);
    setCitaSeleccionada(null);
    setMessage('');
  };

  const volverACitas = () => {
    setStep('citas');
    setCitaSeleccionada(null);
    setMessage('');
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

  return (
    <div className="kiosco-page">
      <div className="kiosco-container">
        {/* Header */}
        <div className="kiosco-header">
          <h1>🎫 DigiTurno</h1>
          <p>Sistema de Turnos Digital</p>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step ${step === 'documento' ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-text">Documento</span>
          </div>
          <div className={`step ${step === 'citas' ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-text">Citas</span>
          </div>
          <div className={`step ${step === 'confirmacion' ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-text">Confirmar</span>
          </div>
          <div className={`step ${step === 'exito' ? 'active' : ''}`}>
            <span className="step-number">4</span>
            <span className="step-text">Listo</span>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`kiosco-message ${message.includes('encontrado') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Step 1: Document Entry */}
        {step === 'documento' && (
          <div className="step-content">
            <div className="step-header">
              <h2>👋 ¡Bienvenido!</h2>
              <p>Ingrese sus datos para continuar</p>
            </div>

            <div className="data-form">
              <div className="form-group">
                <label htmlFor="tipoDocumento">Tipo de Documento:</label>
                <select
                  id="tipoDocumento"
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className="kiosco-input"
                >
                  {tiposDocumento.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="numeroDocumento">Número de Documento:</label>
                <input
                  type="text"
                  id="numeroDocumento"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  placeholder="Ej: 12345678"
                  className="kiosco-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      buscarPaciente();
                    }
                  }}
                />
              </div>

              <div className="button-group">
                <button 
                  className="btn-primary" 
                  onClick={buscarPaciente}
                  disabled={loading}
                >
                  {loading ? '⏳ Buscando...' : '🔍 Buscar Paciente'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Citas Selection */}
        {step === 'citas' && (
          <div className="step-content">
            <div className="step-header">
              <h2>📅 Sus Citas</h2>
              <p>Seleccione la cita para asignar turno</p>
            </div>

            {/* Patient Info Display */}
            {pacienteEncontrado && (
              <div className="patient-info-display">
                <h3>✅ Paciente Encontrado</h3>
                <div className="patient-details">
                  <p><strong>Nombre:</strong> {getNombreCompleto(pacienteEncontrado)}</p>
                  <p><strong>Documento:</strong> {tipoDocumento} {pacienteEncontrado.id_paciente}</p>
                  {pacienteEncontrado.telefono && (
                    <p><strong>Teléfono:</strong> {pacienteEncontrado.telefono}</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="citas-grid">
              {citasPaciente.map((cita) => (
                <button
                  key={cita.id_cita}
                  className="cita-button"
                  onClick={() => seleccionarCita(cita)}
                >
                  <div className="cita-icon">📋</div>
                  <h3>Cita #{cita.id_cita}</h3>
                  <p><strong>Fecha:</strong> {new Date(cita.fecha_cita).toLocaleDateString()}</p>
                  {cita.hora_cita && (
                    <p><strong>Hora:</strong> {cita.hora_cita}</p>
                  )}
                  {cita.procedimiento && (
                    <p><strong>Procedimiento:</strong> {cita.procedimiento}</p>
                  )}
                  {cita.estado !== undefined && (
                    <p><strong>Estado:</strong> {getEstadoCita(cita.estado)}</p>
                  )}
                </button>
              ))}
            </div>

            <div className="button-group">
              <button className="btn-secondary" onClick={volverADocumento}>
                🔙 Volver
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirmacion' && (
          <div className="step-content">
            <div className="step-header">
              <h2>✅ Confirmar Turno</h2>
              <p>Revise la información antes de confirmar</p>
            </div>

            <div className="confirmation-card">
              <div className="confirmation-section">
                <h3>👤 Datos del Paciente</h3>
                <p><strong>Nombre:</strong> {pacienteEncontrado && getNombreCompleto(pacienteEncontrado)}</p>
                <p><strong>Documento:</strong> {tipoDocumento} {pacienteEncontrado?.id_paciente}</p>
              </div>

              <div className="confirmation-section">
                <h3>📅 Cita Seleccionada</h3>
                <p><strong>Cita #:</strong> {citaSeleccionada?.id_cita}</p>
                <p><strong>Fecha:</strong> {citaSeleccionada && new Date(citaSeleccionada.fecha_cita).toLocaleDateString()}</p>
                {citaSeleccionada?.hora_cita && (
                  <p><strong>Hora:</strong> {citaSeleccionada.hora_cita}</p>
                )}
                {citaSeleccionada?.procedimiento && (
                  <p><strong>Procedimiento:</strong> {citaSeleccionada.procedimiento}</p>
                )}
              </div>

              <div className="button-group">
                <button className="btn-secondary" onClick={volverACitas}>
                  🔙 Volver
                </button>
                <button 
                  className="btn-primary" 
                  onClick={asignarTurno}
                  disabled={loading}
                >
                  {loading ? '⏳ Procesando...' : '🎫 Confirmar Turno'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'exito' && (
          <div className="step-content">
            <div className="success-card">
              <div className="success-icon">🎉</div>
              <h2>¡Turno Asignado!</h2>
              
              <div className="turno-info">
                <div className="turno-numero">
                  <span className="numero-label">Su número de turno es:</span>
                  <span className="numero-value">{turnoAsignado?.numero_turno}</span>
                </div>
                
                <div className="turno-details">
                  <p><strong>Paciente:</strong> {pacienteEncontrado && getNombreCompleto(pacienteEncontrado)}</p>
                  <p><strong>Cita #:</strong> {citaSeleccionada?.id_cita}</p>
                  <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>Hora:</strong> {new Date().toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="instructions">
                <h3>📋 Instrucciones:</h3>
                <ul>
                  <li>Espere a que su número sea llamado</li>
                  <li>Manténgase cerca del área de atención</li>
                  <li>Presente su documento cuando sea llamado</li>
                </ul>
              </div>

              <button className="btn-primary" onClick={reiniciar}>
                🏠 Tomar Otro Turno
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Kiosco; 