import React from 'react';
import PantallaLlamados from '../components/PantallaLlamados';
import './LlamadosCompleto.css';

const LlamadosCompleto: React.FC = () => {
  return (
    <div className="llamados-completo-page">
      <PantallaLlamados tipo="todos" autoPlay={true} />
    </div>
  );
};

export default LlamadosCompleto;
