import React from 'react';
import { Link } from 'react-router-dom';
import './LlamadosGeneral.css';

const LlamadosGeneral: React.FC = () => {
  return (
    <div className="llamados-general-page">
      <div className="llamados-navigation">
        <div className="nav-header">
          <h1>📢 Sistema de Llamados</h1>
          <p>Seleccione el tipo de pantalla de llamados que desea visualizar</p>
        </div>
        
        <div className="nav-options">
          <Link to="/llamados/facturacion" className="nav-card facturacion">
            <div className="card-icon">💰</div>
            <h3>Llamados Facturación</h3>
            <p>Pantalla dedicada para mostrar turnos llamados en el área de facturación</p>
            <div className="card-features">
              <span>• Turnos de facturación</span>
              <span>• Auto-actualización</span>
              <span>• Rotación automática</span>
            </div>
          </Link>
          
          <Link to="/llamados/citas" className="nav-card citas">
            <div className="card-icon">🏥</div>
            <h3>Llamados Consultorios</h3>
            <p>Pantalla para mostrar turnos llamados en consultorios médicos</p>
            <div className="card-features">
              <span>• Citas médicas</span>
              <span>• Información de procedimientos</span>
              <span>• Dirección a consultorios</span>
            </div>
          </Link>
          
          <div className="nav-card general">
            <div className="card-icon">📋</div>
            <h3>Pantalla General</h3>
            <p>Vista completa de todos los turnos llamados en todas las áreas</p>
            <div className="card-features">
              <span>• Todos los turnos</span>
              <span>• Vista consolidada</span>
              <span>• Múltiples servicios</span>
            </div>
            <button className="btn-general" onClick={() => window.location.href = '/llamados/general'}>
              Ver Pantalla General
            </button>
          </div>
        </div>
        
        <div className="nav-info">
          <div className="info-section">
            <h4>💡 Información</h4>
            <ul>
              <li>Las pantallas se actualizan automáticamente cada 10 segundos</li>
              <li>Los turnos rotan automáticamente cada 5 segundos</li>
              <li>Cada pantalla está optimizada para su área específica</li>
              <li>Las pantallas son responsivas y se adaptan a diferentes tamaños</li>
            </ul>
          </div>
          
          <div className="info-section">
            <h4>🖥️ Recomendaciones de Uso</h4>
            <ul>
              <li><strong>Facturación:</strong> Colocar en pantalla visible desde la sala de espera</li>
              <li><strong>Consultorios:</strong> Instalar en pasillos y áreas de consulta</li>
              <li><strong>General:</strong> Ubicar en recepción principal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LlamadosGeneral;
