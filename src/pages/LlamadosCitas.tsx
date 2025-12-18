import React from 'react';
import PantallaLlamados from '../components/PantallaLlamados';
import './LlamadosCitas.css';

const LlamadosCitas: React.FC = () => {
  return (
    <div className="llamados-citas-page">
      <PantallaLlamados tipo="citas" autoPlay={true} />
    </div>
  );
};

export default LlamadosCitas;
