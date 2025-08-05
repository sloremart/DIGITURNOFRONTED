import React, { useState, useEffect } from 'react';
import { servicioService, turnoService, pacienteService } from '../services/api';
import { Servicio, TurnoRequest, Paciente } from '../types';
import './Kiosco.css';

const Kiosco: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [documento, setDocumento] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [turnoAsignado, setTurnoAsignado] = useState<any>(null);
  const [step, setStep] = useState<'documento' | 'servicios' | 'confirmacion' | 'exito'>('documento');

  // Datos de ejemplo para probar la interfaz
  const serviciosEjemplo: Servicio[] = [
    {
      id: 1,
      nombre: "Consulta General",
      descripcion: "Atención médica general y revisión de síntomas",
      activo: true,
      tiempo_promedio: 15
    },
    {
      id: 2,
      nombre: "Odontología",
      descripcion: "Servicios dentales y limpieza bucal",
      activo: true,
      tiempo_promedio: 30
    },
    {
      id: 3,
      nombre: "Laboratorio",
      descripcion: "Análisis de sangre y exámenes médicos",
      activo: true,
      tiempo_promedio: 20
    },
    {
      id: 4,
      nombre: "Radiología",
      descripcion: "Rayos X y estudios de imagen",
      activo: true,
      tiempo_promedio: 25
    },
    {
      id: 5,
      nombre: "Farmacia",
      descripcion: "Entrega de medicamentos recetados",
      activo: true,
      tiempo_promedio: 10
    },
    {
      id: 6,
      nombre: "Especialidades",
      descripcion: "Cardiología, dermatología y otras especialidades",
      activo: true,
      tiempo_promedio: 45
    }
  ];

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      // Intentar cargar servicios del backend
      const serviciosData = await servicioService.getServiciosActivos();
      setServicios(serviciosData);
    } catch (error) {
      console.log('Usando datos de ejemplo para demostración');
      // Si falla, usar datos de ejemplo
      setServicios(serviciosEjemplo);
    }
  };

  const buscarPaciente = async () => {
    if (!documento.trim()) {
      setMessage('Por favor ingrese su número de cédula');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Buscar paciente en el backend
      const paciente = await pacienteService.buscarPorDocumento(documento);
      setPacienteEncontrado(paciente);
      setStep('servicios');
      setMessage('Paciente encontrado. Seleccione el servicio.');
    } catch (error) {
      setMessage('Paciente no encontrado. Verifique su número de cédula.');
      setPacienteEncontrado(null);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarServicio = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setStep('confirmacion');
    setMessage('');
  };

  const asignarTurno = async () => {
    if (!selectedServicio || !pacienteEncontrado) {
      setMessage('Faltan datos para asignar el turno');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Intentar crear turno en el backend
      const turnoData: TurnoRequest = {
        servicio_id: selectedServicio.id,
        nombre_cliente: pacienteEncontrado.nombre,
        email_cliente: pacienteEncontrado.email || ''
      };

      const nuevoTurno = await turnoService.crearTurno(turnoData);
      setTurnoAsignado(nuevoTurno);
      setStep('exito');
    } catch (error) {
      // Si falla, simular creación exitosa para demostración
      console.log('Simulando creación de turno para demostración');
      const turnoSimulado = {
        id: Math.floor(Math.random() * 1000) + 1,
        numero: Math.floor(Math.random() * 100) + 1,
        estado: 'pendiente',
        servicio: selectedServicio.nombre,
        fecha_creacion: new Date().toISOString(),
        nombre_cliente: pacienteEncontrado.nombre,
        documento: documento
      };
      setTurnoAsignado(turnoSimulado);
      setStep('exito');
    } finally {
      setLoading(false);
    }
  };

  const reiniciar = () => {
    setSelectedServicio(null);
    setDocumento('');
    setPacienteEncontrado(null);
    setMessage('');
    setTurnoAsignado(null);
    setStep('documento');
  };

  const volverADocumento = () => {
    setStep('documento');
    setPacienteEncontrado(null);
    setMessage('');
  };

  const volverAServicios = () => {
    setStep('servicios');
    setSelectedServicio(null);
    setMessage('');
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
            <span className="step-text">Cédula</span>
          </div>
          <div className={`step ${step === 'servicios' ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-text">Servicio</span>
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
              <p>Ingrese su número de cédula para continuar</p>
            </div>

            <div className="data-form">
              <div className="form-group">
                <label htmlFor="documento">Número de Cédula:</label>
                <input
                  type="text"
                  id="documento"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="Ej: 1234567890"
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

        {/* Step 2: Service Selection */}
        {step === 'servicios' && (
          <div className="step-content">
            <div className="step-header">
              <h2>🏥 Seleccionar Servicio</h2>
              <p>Elija el servicio que necesita</p>
            </div>

            {/* Patient Info Display */}
            {pacienteEncontrado && (
              <div className="patient-info-display">
                <h3>✅ Paciente Encontrado</h3>
                <div className="patient-details">
                  <p><strong>Nombre:</strong> {pacienteEncontrado.nombre}</p>
                  <p><strong>Cédula:</strong> {pacienteEncontrado.documento}</p>
                  {pacienteEncontrado.tiene_cita && pacienteEncontrado.citas && pacienteEncontrado.citas.length > 0 && (
                    <div className="cita-info">
                      <p><strong>⚠️ Tiene citas programadas:</strong></p>
                      {pacienteEncontrado.citas.map((cita) => (
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
            
            <div className="services-grid">
              {servicios.map((servicio) => (
                <button
                  key={servicio.id}
                  className="service-button"
                  onClick={() => seleccionarServicio(servicio)}
                >
                  <div className="service-icon">🏥</div>
                  <h3>{servicio.nombre}</h3>
                  <p>{servicio.descripcion}</p>
                  <span className="service-time">⏱️ {servicio.tiempo_promedio} min</span>
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
                <p><strong>Nombre:</strong> {pacienteEncontrado?.nombre}</p>
                <p><strong>Cédula:</strong> {pacienteEncontrado?.documento}</p>
              </div>

              <div className="confirmation-section">
                <h3>🏥 Servicio Seleccionado</h3>
                <p><strong>Servicio:</strong> {selectedServicio?.nombre}</p>
                <p><strong>Descripción:</strong> {selectedServicio?.descripcion}</p>
                <p><strong>Tiempo estimado:</strong> {selectedServicio?.tiempo_promedio} minutos</p>
              </div>

              <div className="button-group">
                <button className="btn-secondary" onClick={volverAServicios}>
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
                  <span className="numero-value">#{turnoAsignado?.numero}</span>
                </div>
                
                <div className="turno-details">
                  <p><strong>Paciente:</strong> {pacienteEncontrado?.nombre}</p>
                  <p><strong>Servicio:</strong> {selectedServicio?.nombre}</p>
                  <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>Hora:</strong> {new Date().toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="instructions">
                <h3>📋 Instrucciones:</h3>
                <ul>
                  <li>Espere a que su número sea llamado</li>
                  <li>Manténgase cerca del área de atención</li>
                  <li>Tiempo estimado de espera: {selectedServicio?.tiempo_promedio} minutos</li>
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