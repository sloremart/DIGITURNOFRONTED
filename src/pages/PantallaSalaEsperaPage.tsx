import React, { useState, useEffect, useRef } from 'react';
import { TurnoResponse } from '../types';
import { digiturnoService } from '../services/api';
import './PantallaSalaEsperaPage.css';

const PantallaSalaEsperaPage: React.FC = () => {
  const [turnosLlamados, setTurnosLlamados] = useState<TurnoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [turnosAnteriores, setTurnosAnteriores] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    cargarTurnos();
    
    // Auto-refresh cada 10 segundos para mantener la pantalla actualizada
    const interval = setInterval(cargarTurnos, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const cargarTurnos = async () => {
    setLoading(true);
    try {
      // Obtener todos los turnos activos
      const turnos = await digiturnoService.getTurnosActivos();
      
             console.log('📊 Turnos activos para pantalla de sala de espera:', turnos);
       console.log('🔍 Detalle del primer turno:', turnos[0]);
       console.log('🔍 Campos disponibles:', Object.keys(turnos[0] || {}));
      
      // Filtrar SOLO turnos llamados
      const turnosLlamados = turnos.filter(t => t.estado === 'LLAMADO');
      
      // Detectar nuevos turnos para reproducir sonido
      const turnosActuales = new Set(turnosLlamados.map(t => `${t.numero_turno}-${t.modulo}`));
      const nuevosTurnos = turnosLlamados.filter(t => 
        !turnosAnteriores.has(`${t.numero_turno}-${t.modulo}`)
      );
      
      if (nuevosTurnos.length > 0) {
        console.log('🔔 Nuevos turnos llamados:', nuevosTurnos);
        reproducirSonido();
      }
      
      setTurnosAnteriores(turnosActuales);
      
      // Ordenar por prioridad (preferenciales primero) y luego por hora de asignación
      const ordenarTurnos = (a: TurnoResponse, b: TurnoResponse) => {
        // Primero por prioridad (preferenciales primero)
        if (a.es_preferencial && !b.es_preferencial) return -1;
        if (!a.es_preferencial && b.es_preferencial) return 1;
        
        // Luego por hora de asignación (más antiguos primero)
        return new Date(a.hora_asignacion).getTime() - new Date(b.hora_asignacion).getTime();
      };
      
      setTurnosLlamados(turnosLlamados.sort(ordenarTurnos));
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error cargando turnos para pantalla de sala de espera:', error);
    } finally {
      setLoading(false);
    }
  };

  const reproducirSonido = () => {
    try {
      if (audioRef.current) {
        // Solo reproducir si el usuario ya ha interactuado con la página
        audioRef.current.currentTime = 0;
        // Usar play() con manejo de promesas para evitar errores de autoplay
        audioRef.current.play().catch((error) => {
          console.log('Audio no pudo reproducirse automáticamente (normal en navegadores modernos):', error);
          // Fallback: usar beep nativo del navegador
          reproducirBeepNativo();
        });
      } else {
        // Si no hay audio, usar beep nativo
        reproducirBeepNativo();
      }
    } catch (error) {
      console.error('Error reproduciendo sonido:', error);
      // Fallback: usar beep nativo del navegador
      reproducirBeepNativo();
    }
  };

  const reproducirBeepNativo = () => {
    try {
      // Crear un beep nativo usando Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      
      console.log('🔔 Beep nativo reproducido');
    } catch (error) {
      console.log('No se pudo reproducir beep nativo:', error);
    }
  };

  const esTurnoNuevo = (turno: TurnoResponse) => {
    return !turnosAnteriores.has(`${turno.numero_turno}-${turno.modulo}`);
  };

  const getNombreModulo = (turno: TurnoResponse) => {
    console.log('🔍 getNombreModulo - Turno completo:', turno);
    console.log('🔍 getNombreModulo - Campos disponibles:', Object.keys(turno));
    
    // Para turnos preferenciales, usar el tipo_operador que viene del backend
    if (turno.es_preferencial && turno.tipo_operador) {
      console.log('🔍 Turno preferencial con tipo_operador:', turno.tipo_operador);
      switch (turno.tipo_operador) {
        case 'FACTURADOR':
          return 'FACTURACIÓN';
        case 'ASIGNADOR_CITA':
          return 'ASIGNACIÓN DE CITAS';
        default:
          return turno.tipo_operador;
      }
    }
    
    // Para turnos no preferenciales, usar el módulo
    switch (turno.modulo) {
      case 'FACTURACION':
        return 'FACTURACIÓN';
      case 'ASIGNACION_CITA':
        return 'ASIGNACIÓN DE CITAS';
      case 'PREFERENCIAL':
        return 'PREFERENCIAL';
      default:
        return turno.modulo;
    }
  };

  return (
    <div className="pantalla-sala-espera">

      {/* Contenido Principal */}
      <div className="pantalla-content">
        {/* Turnos Llamados */}
        <div className="turnos-section">
          <h2 className="section-title">
            📢 Turnos Llamados ({turnosLlamados.length})
          </h2>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Actualizando turnos...</p>
            </div>
          ) : turnosLlamados.length > 0 ? (
            <div className="turnos-grid">
              {turnosLlamados.map(turno => (
                <div 
                  key={`${turno.numero_turno}-${turno.estado}`} 
                  className={`turno-container ${esTurnoNuevo(turno) ? 'nuevo' : ''}`}
                >
                                     {/* Card Izquierda - Módulo */}
                   <div className="modulo-card">
                     <div className="modulo-titulo">MÓDULO</div>
                     <div className="modulo-nombre">{getNombreModulo(turno)}</div>
                   </div>

                  {/* Card Derecha - Turno y Nombre */}
                  <div className="turno-card">
                    <div className="turno-numero">
                      <span className="numero">TURNO {turno.numero_turno}</span>
                    </div>

                    {/* Nombre del Paciente (solo para facturación) */}
                    {turno.modulo === 'FACTURACION' && turno.nombre_paciente && (
                      <div className="nombre-paciente">
                        {turno.nombre_paciente}
                      </div>
                    )}


                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📢</div>
              <h3>No hay turnos llamados</h3>
              <p>La pantalla se actualizará automáticamente cuando haya turnos llamados</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pantalla-footer">
        <p>&copy; 2025 Neuro DX - Sistema de Gestión de Turnos</p>
        <p>Desarrollado con tecnología moderna para su comodidad</p>
      </div>
      
      {/* Audio para notificaciones - usando beep nativo del navegador como fallback */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="/sounds/notification.wav" type="audio/wav" />
        {/* Fallback: si no hay archivos de audio, usar beep nativo */}
      </audio>
    </div>
  );
};

export default PantallaSalaEsperaPage;
