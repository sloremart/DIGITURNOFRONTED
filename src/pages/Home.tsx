import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { turnoService, servicioService, estadisticasService } from '../services/api';
import { Turno, Servicio, Estadisticas } from '../types';
import './Home.css';

const Home: React.FC = () => {
  const [turnosPendientes, setTurnosPendientes] = useState<Turno[]>([]);
  const [serviciosActivos, setServiciosActivos] = useState<Servicio[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [turnos, servicios, stats] = await Promise.all([
          turnoService.getTurnosPendientes(),
          servicioService.getServiciosActivos(),
          estadisticasService.getEstadisticas()
        ]);

        setTurnosPendientes(turnos.slice(0, 5)); // Solo mostrar los primeros 5
        setServiciosActivos(servicios);
        setEstadisticas(stats);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Sistema de Turnos Digital
            <span className="hero-subtitle">DigiTurno</span>
          </h1>
          <p className="hero-description">
            Gestiona tus turnos de manera eficiente y moderna. 
            Sistema inteligente para optimizar la atención al cliente.
          </p>
          <div className="hero-actions">
            <Link to="/turnos" className="btn-primary">
              <span className="btn-icon">🎫</span>
              Tomar Turno
            </Link>
            <Link to="/servicios" className="btn-secondary">
              <span className="btn-icon">📋</span>
              Ver Servicios
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="card-header">
              <span className="card-icon">📊</span>
              <h3>Estadísticas en Tiempo Real</h3>
            </div>
            <div className="card-content">
              <div className="stat-item">
                <span className="stat-number">{estadisticas?.turnos_hoy || 0}</span>
                <span className="stat-label">Turnos Hoy</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{estadisticas?.turnos_pendientes || 0}</span>
                <span className="stat-label">Pendientes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{estadisticas?.tiempo_promedio_espera || 0} min</span>
                <span className="stat-label">Tiempo Promedio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2 className="section-title">Acciones Rápidas</h2>
        <div className="actions-grid">
          <Link to="/turnos/nuevo" className="action-card">
            <div className="action-icon">➕</div>
            <h3>Nuevo Turno</h3>
            <p>Crear un nuevo turno para cualquier servicio disponible</p>
          </Link>
          <Link to="/turnos" className="action-card">
            <div className="action-icon">📋</div>
            <h3>Ver Turnos</h3>
            <p>Consulta el estado de todos los turnos activos</p>
          </Link>
          <Link to="/servicios" className="action-card">
            <div className="action-icon">⚙️</div>
            <h3>Gestionar Servicios</h3>
            <p>Administra los servicios disponibles en el sistema</p>
          </Link>
          <Link to="/estadisticas" className="action-card">
            <div className="action-icon">📊</div>
            <h3>Estadísticas</h3>
            <p>Visualiza reportes y métricas del sistema</p>
          </Link>
        </div>
      </section>

      {/* Recent Turnos */}
      <section className="recent-turnos">
        <h2 className="section-title">Turnos Recientes</h2>
        <div className="turnos-list">
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
                    {new Date(turno.fecha_creacion).toLocaleString()}
                  </p>
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
      </section>

      {/* Services Overview */}
      <section className="services-overview">
        <h2 className="section-title">Servicios Disponibles</h2>
        <div className="services-grid">
          {serviciosActivos.map((servicio) => (
            <div key={servicio.id} className="service-card">
              <div className="service-icon">🔧</div>
              <h3>{servicio.nombre}</h3>
              <p>{servicio.descripcion}</p>
              <div className="service-meta">
                <span className="service-time">
                  ⏱️ {servicio.tiempo_promedio} min
                </span>
                <span className="service-status active">Activo</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home; 