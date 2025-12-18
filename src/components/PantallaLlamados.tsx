import React, { useState, useEffect } from 'react';
import { TurnoResponse } from '../types';
import { digiturnoService } from '../services/api';
import './PantallaLlamados.css';

interface PantallaLlamadosProps {
  tipo?: 'facturacion' | 'citas' | 'todos';
  autoPlay?: boolean;
}

const PantallaLlamados: React.FC<PantallaLlamadosProps> = ({ 
  tipo = 'todos', 
  autoPlay = true 
}) => {
  const [turnosLlamados, setTurnosLlamados] = useState<TurnoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());
  const [turnoActual, setTurnoActual] = useState<TurnoResponse | null>(null);
  const [indiceTurnoActual, setIndiceTurnoActual] = useState(0);

  useEffect(() => {
    cargarTurnosLlamados();
    
    // Auto-refresh cada 10 segundos
    const interval = setInterval(cargarTurnosLlamados, 10000);
    
    return () => clearInterval(interval);
  }, [tipo]);

  useEffect(() => {
    // Rotar entre turnos llamados cada 5 segundos
    if (turnosLlamados.length > 0 && autoPlay) {
      const interval = setInterval(() => {
        setIndiceTurnoActual(prev => {
          const siguiente = (prev + 1) % turnosLlamados.length;
          setTurnoActual(turnosLlamados[siguiente]);
          return siguiente;
        });
      }, 5000);

      // Establecer el primer turno
      if (turnosLlamados.length > 0) {
        setTurnoActual(turnosLlamados[0]);
      }

      return () => clearInterval(interval);
    }
  }, [turnosLlamados, autoPlay]);

  const cargarTurnosLlamados = async () => {
    setLoading(true);
    try {
      const turnos = await digiturnoService.getTurnosActivos();
      
      // Filtrar solo turnos llamados
      let turnosLlamados = turnos.filter(t => t.estado === 'LLAMADO');
      
      // Filtrar por tipo si no es "todos"
      if (tipo === 'facturacion') {
        // Aquí podrías agregar lógica para filtrar turnos de facturación
        // Por ejemplo, basado en algún campo del turno o cita
      } else if (tipo === 'citas') {
        // Filtrar turnos para agenda de citas
        turnosLlamados = turnosLlamados.filter(t => t.cita);
      }
      
      // Ordenar por hora de asignación (más antiguos primero)
      turnosLlamados.sort((a, b) => 
        new Date(a.hora_asignacion).getTime() - new Date(b.hora_asignacion).getTime()
      );
      
      setTurnosLlamados(turnosLlamados);
      setUltimaActualizacion(new Date());
      
      // Si hay turnos y no hay turno actual, establecer el primero
      if (turnosLlamados.length > 0 && !turnoActual) {
        setTurnoActual(turnosLlamados[0]);
        setIndiceTurnoActual(0);
      }
      
    } catch (error) {
      console.error('Error cargando turnos llamados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNombreCompleto = (paciente: any) => {
    if (!paciente) return 'Paciente no disponible';
    const nombres = [paciente.nombre1, paciente.nombre2].filter(Boolean).join(' ');
    const apellidos = [paciente.apellido1, paciente.apellido2].filter(Boolean).join(' ');
    return `${nombres} ${apellidos}`.trim() || 'Paciente no disponible';
  };

  const getTipoServicio = (turno: TurnoResponse) => {
    if (turno.cita) {
      return turno.cita.procedimiento || 'Consulta Médica';
    }
    return 'Facturación';
  };

  const getModuloDestino = (turno: TurnoResponse) => {
    if (turno.cita) {
      return 'CONSULTORIO';
    }
    return 'FACTURACIÓN';
  };

  const getTituloPanel = () => {
    switch (tipo) {
      case 'facturacion':
        return '💰 TURNOS DE FACTURACIÓN';
      case 'citas':
        return '🏥 TURNOS DE CONSULTA';
      default:
        return '📢 TURNOS LLAMADOS';
    }
  };

  if (loading && turnosLlamados.length === 0) {
    return (
      <div className="pantalla-llamados loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Cargando turnos...</h2>
        </div>
      </div>
    );
  }

  if (turnosLlamados.length === 0) {
    return (
      <div className="pantalla-llamados empty">
        <div className="empty-content">
          <div className="empty-icon">🎫</div>
          <h2>No hay turnos llamados</h2>
          <p>Los turnos llamados aparecerán aquí automáticamente</p>
          <div className="last-update">
            Última actualización: {ultimaActualizacion.toLocaleTimeString('es-ES')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pantalla-llamados">
      {/* Header */}
      <div className="llamados-header">
        <h1 className="titulo-principal">{getTituloPanel()}</h1>
        <div className="info-header">
          <div className="contador-turnos">
            <span className="contador-numero">{turnosLlamados.length}</span>
            <span className="contador-label">
              {turnosLlamados.length === 1 ? 'TURNO' : 'TURNOS'} EN LLAMADO
            </span>
          </div>
          <div className="ultima-actualizacion">
            <span className="update-icon">🔄</span>
            <span>Actualizado: {ultimaActualizacion.toLocaleTimeString('es-ES')}</span>
          </div>
        </div>
      </div>

      {/* Turno Principal (destacado) */}
      {turnoActual && (
        <div className="turno-principal">
          <div className="turno-principal-content">
            <div className="turno-numero-grande">
              TURNO
              <span className="numero">{turnoActual.numero_turno}</span>
            </div>
            
            <div className="turno-info-principal">
              <div className="paciente-principal">
                <span className="label">PACIENTE:</span>
                <span className="nombre">{getNombreCompleto(turnoActual.paciente)}</span>
              </div>
              
              <div className="servicio-principal">
                <span className="label">SERVICIO:</span>
                <span className="servicio">{getTipoServicio(turnoActual)}</span>
              </div>
              
              <div className="destino-principal">
                <span className="label">DIRIGIRSE A:</span>
                <span className="destino">{getModuloDestino(turnoActual)}</span>
              </div>
            </div>
          </div>
          
          <div className="indicador-progreso">
            <div className="progreso-info">
              Turno {indiceTurnoActual + 1} de {turnosLlamados.length}
            </div>
            <div className="progreso-barra">
              <div 
                className="progreso-fill"
                style={{ width: `${((indiceTurnoActual + 1) / turnosLlamados.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de todos los turnos llamados */}
      {turnosLlamados.length > 1 && (
        <div className="lista-turnos-llamados">
          <h3 className="lista-titulo">OTROS TURNOS LLAMADOS</h3>
          <div className="turnos-grid">
            {turnosLlamados
              .filter((_, index) => index !== indiceTurnoActual)
              .map((turno, index) => (
                <div 
                  key={turno.numero_turno} 
                  className="turno-card-pequeño"
                  onClick={() => {
                    setTurnoActual(turno);
                    setIndiceTurnoActual(turnosLlamados.indexOf(turno));
                  }}
                >
                  <div className="turno-numero-pequeño">{turno.numero_turno}</div>
                  <div className="turno-info-pequeño">
                    <div className="paciente-pequeño">
                      {getNombreCompleto(turno.paciente)}
                    </div>
                    <div className="destino-pequeño">
                      → {getModuloDestino(turno)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Footer con información adicional */}
      <div className="llamados-footer">
        <div className="footer-info">
          <div className="info-item">
            <span className="info-icon">⏰</span>
            <span>Actualización automática cada 10 segundos</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🔄</span>
            <span>Rotación automática cada 5 segundos</span>
          </div>
          <div className="info-item">
            <span className="info-icon">📍</span>
            <span>Diríjase al módulo indicado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PantallaLlamados;
