import React, { useState, useEffect } from 'react';
import { servicioService, turnoService } from '../services/api';
import { Servicio, TurnoRequest } from '../types';
import './Kiosco.css';

const Kiosco: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [documento, setDocumento] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [turnoAsignado, setTurnoAsignado] = useState<any>(null);
  const [step, setStep] = useState<'servicios' | 'datos' | 'confirmacion' | 'exito'>('servicios');

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      const serviciosData = await servicioService.getServiciosActivos();
      setServicios(serviciosData);
    } catch (error) {
      console.error('Error cargando servicios:', error);
      setMessage('Error al cargar servicios');
    }
  };

  const seleccionarServicio = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setStep('datos');
    setMessage('');
  };

  const continuarADatos = () => {
    if (selectedServicio) {
      setStep('datos');
    }
  };

  const continuarAConfirmacion = () => {
    if (documento.trim() && nombre.trim()) {
      setStep('confirmacion');
    } else {
      setMessage('Por favor complete todos los campos');
    }
  };

  const asignarTurno = async () => {
    if (!selectedServicio || !documento.trim() || !nombre.trim()) {
      setMessage('Faltan datos para asignar el turno');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const turnoData: TurnoRequest = {
        servicio_id: selectedServicio.id,
        nombre_cliente: nombre,
        email_cliente: ''
      };

      const nuevoTurno = await turnoService.crearTurno(turnoData);
      setTurnoAsignado(nuevoTurno);
      setStep('exito');
    } catch (error) {
      setMessage('Error al asignar turno. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const reiniciar = () => {
    setSelectedServicio(null);
    setDocumento('');
    setNombre('');
    setMessage('');
    setTurnoAsignado(null);
    setStep('servicios');
  };

  const volverAInicio = () => {
    setStep('servicios');
    setSelectedServicio(null);
    setMessage('');
  };

  const volverADatos = () => {
    setStep('datos');
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
          <div className={`step ${step === 'servicios' ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-text">Servicio</span>
          </div>
          <div className={`step ${step === 'datos' ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-text">Datos</span>
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
          <div className="kiosco-message error">
            {message}
          </div>
        )}

        {/* Step 1: Service Selection */}
        {step === 'servicios' && (
          <div className="step-content">
            <div className="step-header">
              <h2>👋 ¡Bienvenido!</h2>
              <p>Seleccione el servicio que necesita</p>
            </div>
            
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
          </div>
        )}

        {/* Step 2: Data Entry */}
        {step === 'datos' && (
          <div className="step-content">
            <div className="step-header">
              <h2>📝 Sus Datos</h2>
              <p>Complete la información solicitada</p>
            </div>

            <div className="data-form">
              <div className="form-group">
                <label htmlFor="documento">Número de Documento:</label>
                <input
                  type="text"
                  id="documento"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="Ingrese su número de documento"
                  className="kiosco-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nombre">Nombre Completo:</label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ingrese su nombre completo"
                  className="kiosco-input"
                />
              </div>

              <div className="selected-service-info">
                <h3>Servicio Seleccionado:</h3>
                <div className="service-card">
                  <div className="service-icon">🏥</div>
                  <h4>{selectedServicio?.nombre}</h4>
                  <p>{selectedServicio?.descripcion}</p>
                  <span className="service-time">⏱️ {selectedServicio?.tiempo_promedio} min</span>
                </div>
              </div>

              <div className="button-group">
                <button className="btn-secondary" onClick={volverAInicio}>
                  🔙 Volver
                </button>
                <button className="btn-primary" onClick={continuarAConfirmacion}>
                  ➡️ Continuar
                </button>
              </div>
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
                <h3>👤 Datos Personales</h3>
                <p><strong>Nombre:</strong> {nombre}</p>
                <p><strong>Documento:</strong> {documento}</p>
              </div>

              <div className="confirmation-section">
                <h3>🏥 Servicio Seleccionado</h3>
                <p><strong>Servicio:</strong> {selectedServicio?.nombre}</p>
                <p><strong>Descripción:</strong> {selectedServicio?.descripcion}</p>
                <p><strong>Tiempo estimado:</strong> {selectedServicio?.tiempo_promedio} minutos</p>
              </div>

              <div className="button-group">
                <button className="btn-secondary" onClick={volverADatos}>
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