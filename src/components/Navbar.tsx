import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
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
            <Logo size="medium" />
          
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
            to="/facturacion" 
            className={`navbar-item ${isActive('/facturacion') ? 'active' : ''}`}
          >
            💰 Facturación
          </Link>
          <Link 
            to="/asignacion-citas" 
            className={`navbar-item ${isActive('/asignacion-citas') ? 'active' : ''}`}
          >
            📅 Asignación de Citas
          </Link>
          <Link 
            to="/llamados" 
            className={`navbar-item ${isActive('/llamados') || location.pathname.startsWith('/llamados') ? 'active' : ''}`}
          >
            📢 Llamados
          </Link>
          <Link 
            to="/sala-espera" 
            className={`navbar-item ${isActive('/sala-espera') ? 'active' : ''}`}
          >
            🖥️ Pantalla Sala
          </Link>

          <Link 
            to="/configuracion" 
            className={`navbar-item ${isActive('/configuracion') ? 'active' : ''}`}
          >
            ⚙️ Configuración
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