import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">🎫</span>
            <span className="logo-text">DigiTurno</span>
          </Link>
        </div>
        
        <div className="navbar-menu">
          <Link 
            to="/" 
            className={`navbar-item ${isActive('/') ? 'active' : ''}`}
          >
            Inicio
          </Link>
          <Link 
            to="/turnos" 
            className={`navbar-item ${isActive('/turnos') ? 'active' : ''}`}
          >
            Turnos
          </Link>
          <Link 
            to="/kiosco" 
            className={`navbar-item ${isActive('/kiosco') ? 'active' : ''}`}
          >
            Kiosco
          </Link>
          <Link 
            to="/servicios" 
            className={`navbar-item ${isActive('/servicios') ? 'active' : ''}`}
          >
            Servicios
          </Link>
          <Link 
            to="/estadisticas" 
            className={`navbar-item ${isActive('/estadisticas') ? 'active' : ''}`}
          >
            Estadísticas
          </Link>
          <Link 
            to="/admin" 
            className={`navbar-item ${isActive('/admin') ? 'active' : ''}`}
          >
            Administración
          </Link>
        </div>

        <div className="navbar-actions">
          <button className="btn-secondary">
            <span className="btn-icon">👤</span>
            Iniciar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 