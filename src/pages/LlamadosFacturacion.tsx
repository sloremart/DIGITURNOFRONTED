import React from 'react';
import PantallaLlamados from '../components/PantallaLlamados';
import './LlamadosFacturacion.css';

const LlamadosFacturacion: React.FC = () => {
  return (
    <div className="llamados-facturacion-page">
      <PantallaLlamados tipo="facturacion" autoPlay={true} />
    </div>
  );
};

export default LlamadosFacturacion;
