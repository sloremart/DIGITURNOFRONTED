import React from 'react';
import './Logo.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'kiosk';
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', variant = 'default' }) => {
  return (
    <div className={`logo logo-${size} logo-${variant}`}>
      <div className="logo-icon">
        <img src="/images/logoneuro.jpeg" alt="NeuroDX Logo" className="logo-image" />
      </div>
      <div className="logo-text">
        <span className="logo-primary">Neuro</span>
        <span className="logo-secondary">DX</span>
      </div>
    </div>
  );
};

export default Logo; 