import React, { useState, useEffect } from 'react';
import { digiturnoService } from '../services/api';
import './Configuracion.css';

interface SedeConfig {
  codigo: string;
  nombre: string;
  descripcion: string;
}

interface ConfiguracionResponse {
  sede_actual: SedeConfig;
  configuracion: {
    sede_por_defecto: string;
    nota: string;
  };
}

const Configuracion: React.FC = () => {
  const [sedeActual, setSedeActual] = useState<SedeConfig | null>(null);
  const [sedeSeleccionada, setSedeSeleccionada] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const sedesDisponibles = [
    { codigo: 'SEDE_A', nombre: 'Sede Principal', descripcion: 'Sede principal de la IPS' },
    { codigo: 'SEDE_B', nombre: 'Sede Secundaria', descripcion: 'Sede secundaria de la IPS' }
  ];

  useEffect(() => {
    cargarSedeActual();
  }, []);

  const cargarSedeActual = async () => {
    try {
      setLoading(true);
      const response = await digiturnoService.getSedeConfigurada();
      console.log('Respuesta de sede:', response);
      if (response && response.sede_actual) {
        setSedeActual(response.sede_actual);
        setSedeSeleccionada(response.sede_actual.codigo);
      } else {
        // Si no hay respuesta del backend, usar valores por defecto
        const sedeDefault = { codigo: 'SEDE_A', nombre: 'Sede Principal', descripcion: 'Sede principal de la IPS' };
        setSedeActual(sedeDefault);
        setSedeSeleccionada(sedeDefault.codigo);
        setMessage('Usando configuración por defecto (SEDE_A)');
        setMessageType('success');
      }
    } catch (error) {
      console.error('Error cargando sede:', error);
      // En caso de error, usar valores por defecto
      const sedeDefault = { codigo: 'SEDE_A', nombre: 'Sede Principal', descripcion: 'Sede principal de la IPS' };
      setSedeActual(sedeDefault);
      setSedeSeleccionada(sedeDefault.codigo);
      setMessage('Error al conectar con el backend. Usando configuración por defecto.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const cambiarSede = async () => {
    if (!sedeSeleccionada) {
      setMessage('Por favor seleccione una sede');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      // Aquí deberías llamar al endpoint para cambiar la sede
      // Por ahora solo simulamos el cambio
      const nuevaSede = sedesDisponibles.find(s => s.codigo === sedeSeleccionada);
      if (nuevaSede) {
        setSedeActual(nuevaSede);
        setMessage(`Sede cambiada exitosamente a: ${nuevaSede.nombre}`);
        setMessageType('success');
      }
    } catch (error) {
      console.error('Error cambiando sede:', error);
      setMessage('Error al cambiar la sede');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="configuracion-container">
      <div className="configuracion-header">
        <h1>⚙️ Configuración del Sistema</h1>
        <p>Gestionar configuración de sede y parámetros del sistema</p>
      </div>

      <div className="configuracion-content">
        {/* Información Actual */}
        <div className="info-section">
          <h2>📍 Sede Actual</h2>
          {sedeActual ? (
            <div className="sede-actual">
              <div className="sede-card">
                <div className="sede-icon">🏥</div>
                <div className="sede-info">
                  <h3>{sedeActual.nombre}</h3>
                  <p><strong>Código:</strong> {sedeActual.codigo}</p>
                  <p><strong>Descripción:</strong> {sedeActual.descripcion}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="loading">Cargando información de sede...</div>
          )}
        </div>

        {/* Cambiar Sede */}
        <div className="cambiar-sede-section">
          <h2>🔄 Cambiar Sede</h2>
          <div className="sede-selector">
            <label htmlFor="sedeSelect">Seleccione la nueva sede:</label>
            <select
              id="sedeSelect"
              value={sedeSeleccionada}
              onChange={(e) => setSedeSeleccionada(e.target.value)}
              className="sede-select"
            >
              <option value="">Seleccione una sede</option>
              {sedesDisponibles.map((sede) => (
                <option key={sede.codigo} value={sede.codigo}>
                  {sede.nombre} ({sede.codigo})
                </option>
              ))}
            </select>
          </div>

          <div className="sede-preview">
            {sedeSeleccionada && (
              <div className="sede-preview-card">
                <h4>Vista previa de la nueva sede:</h4>
                {(() => {
                  const sede = sedesDisponibles.find(s => s.codigo === sedeSeleccionada);
                  return sede ? (
                    <div className="sede-info">
                      <p><strong>Nombre:</strong> {sede.nombre}</p>
                      <p><strong>Código:</strong> {sede.codigo}</p>
                      <p><strong>Descripción:</strong> {sede.descripcion}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          <div className="button-group">
            <button
              className="btn-cambiar-sede"
              onClick={cambiarSede}
              disabled={loading || !sedeSeleccionada}
            >
              {loading ? '🔄 Cambiando...' : '🔄 Cambiar Sede'}
            </button>
          </div>
        </div>

        {/* Mensajes */}
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        {/* Información Adicional */}
        <div className="info-adicional">
          <h3>ℹ️ Información Importante</h3>
          <ul>
            <li>La sede seleccionada se usará automáticamente para todos los turnos</li>
            <li>Los cambios en la sede afectarán inmediatamente al sistema</li>
            <li>Se recomienda cambiar la sede solo cuando sea necesario</li>
            <li>Los turnos existentes mantendrán la sede original</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
