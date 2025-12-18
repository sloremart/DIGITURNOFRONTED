import React, { useState } from 'react';
import { TurnoResponse } from '../types';
import { PrinterService } from '../services/printerService';
import './TicketPrinter.css';

interface TicketPrinterProps {
  turno: TurnoResponse;
  onClose: () => void;
}

const TicketPrinter: React.FC<TicketPrinterProps> = ({ turno, onClose }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<'idle' | 'printing' | 'success' | 'error'>('idle');

  console.log('TicketPrinter renderizado con turno:', turno);

  const getNombreCompleto = (paciente: any) => {
    if (!paciente) return 'Paciente no disponible';
    const nombres = [paciente.nombre1, paciente.nombre2].filter(Boolean).join(' ');
    const apellidos = [paciente.apellido1, paciente.apellido2].filter(Boolean).join(' ');
    return `${nombres} ${apellidos}`.trim() || 'Paciente no disponible';
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    setPrintStatus('printing');

    try {
      const printerService = new PrinterService();
      const success = await printerService.printTicket(turno);
      
      if (success) {
        setPrintStatus('success');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setPrintStatus('error');
      }
    } catch (error) {
      console.error('Error al imprimir:', error);
      setPrintStatus('error');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      // Mostrar el ticket formateado en una nueva ventana
      const printerService = new PrinterService();
      const ticketHTML = printerService.generateTicketHTML(turno);
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(ticketHTML);
        newWindow.document.close();
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
    }
  };

  const handlePrintBrowser = () => {
    // Imprimir usando la función de impresión del navegador
    window.print();
  };

  return (
    <div className="ticket-printer-overlay">
      <div className="ticket-printer-modal">
        <div className="ticket-printer-header">
          <h2>🎫 Ticket de Turno</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="ticket-content">
          <div className="ticket-header">
            <h3>NEURODX</h3>
            <p>Su diagnóstico, nuestro compromiso</p>
          </div>

          <div className="ticket-info">
            <div className="ticket-number">
              <span className="value">{turno.numero_turno}</span>
            </div>

            <div className="instructions">
              <p>Por favor espere el llamado en pantalla</p>
            </div>
          </div>
        </div>

        <div className="print-actions">
          {printStatus === 'printing' && (
            <div className="print-status">
              <span className="loading">⏳ Imprimiendo...</span>
            </div>
          )}

          {printStatus === 'success' && (
            <div className="print-status success">
              <span>✅ ¡Ticket impreso exitosamente!</span>
            </div>
          )}

          {printStatus === 'error' && (
            <div className="print-status error">
              <span>❌ Error al imprimir. Intente nuevamente.</span>
            </div>
          )}

          <div className="print-buttons">
            <button 
              className="btn-print-pos" 
              onClick={handlePrint}
              disabled={isPrinting}
            >
              🖨️ Imprimir en POS
            </button>

            <button 
              className="btn-print-browser" 
              onClick={handlePrintBrowser}
              disabled={isPrinting}
            >
              🖨️ Imprimir (Navegador)
            </button>

            <button 
              className="btn-generate-pdf" 
              onClick={handleGeneratePDF}
              disabled={isPrinting}
            >
              📄 Generar PDF
            </button>



            <button 
              className="btn-close" 
              onClick={onClose}
              disabled={isPrinting}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>


    </div>
  );
};

export default TicketPrinter; 