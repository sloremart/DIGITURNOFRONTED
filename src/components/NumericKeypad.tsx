import React from 'react';
import './NumericKeypad.css';

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({ 
  value, 
  onChange, 
  maxLength = 20,
  placeholder = "Ingrese número"
}) => {
  const handleNumberClick = (number: string) => {
    if (value.length < maxLength) {
      onChange(value + number);
    }
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '']
  ];

  return (
    <div className="numeric-keypad">
      <div className="keypad-display">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="keypad-input"
          readOnly
        />
      </div>
      
      <div className="keypad-buttons">
        {numbers.map((row, rowIndex) => (
          <div key={rowIndex} className="keypad-row">
            {row.map((number, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`keypad-button ${!number ? 'empty' : ''}`}
                onClick={() => number && handleNumberClick(number)}
                disabled={!number}
              >
                {number}
              </button>
            ))}
          </div>
        ))}
        
        <div className="keypad-controls">
          <button className="keypad-button control-button" onClick={handleDelete}>
            ⌫ Borrar
          </button>
          <button className="keypad-button control-button" onClick={handleClear}>
            🗑️ Limpiar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumericKeypad; 