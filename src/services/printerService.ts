import { TurnoResponse } from '../types';

// Interfaz para la configuración de la impresora
interface PrinterServiceConfig {
  type: 'usb' | 'network' | 'file';
  address?: string;
  port?: number;
  vendorId?: number;
  productId?: number;
  autoOpen?: boolean;
}

// Clase para manejar la impresión de turnos
export class PrinterService {
  private config: PrinterServiceConfig;

  constructor(config?: PrinterServiceConfig) {
    this.config = config || {
      type: 'usb',
      autoOpen: true
    };
  }

  // Función helper para obtener nombre completo
  private getNombreCompleto(paciente: any): string {
    const nombres = [paciente.nombre1, paciente.nombre2].filter(Boolean).join(' ');
    const apellidos = [paciente.apellido1, paciente.apellido2].filter(Boolean).join(' ');
    return `${nombres} ${apellidos}`.trim();
  }

  // Generar el contenido del ticket simplificado (9cm x 6cm)
  public generateTicketContent(turno: TurnoResponse, servicio?: string): string {
    const ticketContent = `


${' '.repeat(12)}NEURODX


${' '.repeat(4)}Su diagnostico, nuestro compromiso



${' '.repeat(10)}TURNO ${turno.numero_turno}



${' '.repeat(2)}Por favor espere el llamado en pantalla



`;
    return ticketContent;
  }

  async printTicket(turno: TurnoResponse, servicio?: string): Promise<boolean> {
    try {
      const ticketContent = this.generateTicketContent(turno, servicio);
      
      // Crear una versión con formato optimizado para distribución
      const formattedContent = this.formatForPOSPrinter(turno, servicio);
      
      // Usar el nuevo endpoint de impresión personalizada
      try {
        const response = await fetch('http://localhost:8000/printer/print-ticket-custom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            numero_turno: turno.numero_turno,
            ticket_content: formattedContent
          }),
        });

        if (response.ok) {
          const printData = await response.json();
          if (printData.success) {
            console.log('✅ Ticket NEURODX impreso exitosamente');
            return true;
          } else {
            console.error('Error en la respuesta del backend:', printData);
            // Intentar con formato simple como fallback
            return await this.trySimpleFormat(turno);
          }
        }
      } catch (error) {
        console.log('Endpoint /printer/print-ticket-custom no disponible, intentando alternativa...');
        return await this.trySimpleFormat(turno);
      }

      // Fallback al endpoint anterior si el nuevo no está disponible
      try {
        const response = await fetch('http://localhost:8000/printer/print-ticket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            numero_turno: turno.numero_turno,
            paciente_nombre: turno.paciente ? this.getNombreCompleto(turno.paciente) : 'Paciente',
            hora_cita: turno.cita?.hora_cita || new Date().toLocaleTimeString('es-ES')
          }),
        });

        if (response.ok) {
          console.log('Ticket enviado al backend para impresión (fallback)');
          return true;
        }
      } catch (error) {
        console.log('Endpoint de fallback también falló');
      }

      console.error('No se pudo conectar con el backend para impresión');
      return false;
    } catch (error) {
      console.error('Error imprimiendo ticket:', error);
      return false;
    }
  }

  // Método para formatear el contenido específicamente para impresoras POS
  private formatForPOSPrinter(turno: TurnoResponse, servicio?: string): string {
    // Obtener información del paciente si está disponible
    const pacienteName = turno.paciente ? this.getNombreCompleto(turno.paciente) : '';
    const citaInfo = turno.cita ? `Cita #${turno.cita.id_cita}` : '';
    const servicioInfo = servicio ? `Servicio: ${servicio.toUpperCase()}` : '';
    const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const fecha = new Date().toLocaleDateString('es-ES');
    
    // Versión distribuida verticalmente para papel de 9cm x 6cm
    const content = `


${' '.repeat(12)}NEURODX


${' '.repeat(4)}Su diagnostico, nuestro compromiso



${' '.repeat(10)}TURNO ${turno.numero_turno}


${pacienteName ? ' '.repeat(Math.max(0, (32 - pacienteName.length) / 2)) + pacienteName : ''}

${citaInfo ? ' '.repeat(Math.max(0, (32 - citaInfo.length) / 2)) + citaInfo : ''}

${servicioInfo ? ' '.repeat(Math.max(0, (32 - servicioInfo.length) / 2)) + servicioInfo : ''}


${' '.repeat(8)}${fecha} - ${hora}


${' '.repeat(2)}Por favor espere el llamado en pantalla



`;
    
    return content;
  }

  // Método alternativo con formato más simple para mejor compatibilidad
  private formatSimpleForPOS(turno: TurnoResponse): string {
    const content = `


${' '.repeat(12)}NEURODX


${' '.repeat(4)}Su diagnostico, nuestro compromiso



${' '.repeat(10)}TURNO ${turno.numero_turno}



${' '.repeat(2)}Por favor espere el llamado en pantalla



`;
    return content;
  }

  // Método para intentar con formato simple como fallback
  private async trySimpleFormat(turno: TurnoResponse): Promise<boolean> {
    try {
      const simpleContent = this.formatSimpleForPOS(turno);
      
      const response = await fetch('http://localhost:8000/printer/print-ticket-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numero_turno: turno.numero_turno,
          ticket_content: simpleContent
        }),
      });

      if (response.ok) {
        const printData = await response.json();
        if (printData.success) {
          console.log('✅ Ticket NEURODX impreso exitosamente (formato simple)');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error con formato simple:', error);
      return false;
    }
  }

  // Simular impresión (para desarrollo)
  private async simulatePrint(content: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('✅ Ticket impreso exitosamente');
        resolve();
      }, 1000);
    });
  }

  // Método para imprimir usando la librería ESC/POS (para producción)
  async printWithESCPOS(turno: TurnoResponse): Promise<boolean> {
    try {
      // Nota: Este código requiere Node.js en el backend
      // Para React frontend, necesitarías una API en el backend
      console.log('🖨️ Imprimiendo con ESC/POS...');
      
      // Aquí iría la implementación real con la librería ESC/POS
      // const escpos = require('escpos');
      // const device = new escpos.Network('192.168.1.100');
      // const printer = new escpos.Printer(device);
      
      return true;
    } catch (error) {
      console.error('Error con ESC/POS:', error);
      return false;
    }
  }

  // Generar HTML del ticket para visualización
  public generateTicketHTML(turno: TurnoResponse): string {
    const pacienteName = turno.paciente ? this.getNombreCompleto(turno.paciente) : '';
    const citaInfo = turno.cita ? `Cita #${turno.cita.id_cita}` : '';
    const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const fecha = new Date().toLocaleDateString('es-ES');
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ticket Turno ${turno.numero_turno}</title>
    <style>
        @page {
            size: 9cm 6cm;
            margin: 0.2cm;
        }
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0.2cm;
            background: white;
            width: 8.6cm;
            height: 5.6cm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: center;
            line-height: 1.1;
        }
        .logo {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 0.1cm 0;
        }
        .slogan {
            font-size: 9px;
            margin: 0 0 0.4cm 0;
        }
        .turno-number {
            font-size: 28px;
            font-weight: bold;
            margin: 0.3cm 0;
            letter-spacing: 1px;
        }
        .info-section {
            font-size: 10px;
            margin: 0.2cm 0;
        }
        .date-time {
            font-size: 8px;
            margin: 0.2cm 0;
        }
        .instructions {
            font-size: 11px;
            margin: 0.4cm 0 0 0;
            line-height: 1.2;
        }
    </style>
</head>
<body>
    <div class="logo">NEURODX</div>
    <div class="slogan">Su diagnostico, nuestro compromiso</div>
    <div class="turno-number">TURNO ${turno.numero_turno}</div>
    ${pacienteName ? `<div class="info-section">${pacienteName}</div>` : ''}
    ${citaInfo ? `<div class="info-section">${citaInfo}</div>` : ''}
    <div class="date-time">${fecha} - ${hora}</div>
    <div class="instructions">Por favor espere el llamado en pantalla</div>
</body>
</html>`;
    return htmlContent;
  }

  // Generar PDF del ticket (alternativa)
  async generatePDF(turno: TurnoResponse): Promise<string> {
    const ticketContent = this.generateTicketContent(turno);
    
    // Aquí podrías usar una librería como jsPDF para generar PDF
    console.log('📄 Generando PDF del ticket...');
    
    // Retornar URL del PDF generado
    return `/tickets/${turno.numero_turno}.pdf`;
  }
}

// Configuración por defecto
const defaultConfig: PrinterServiceConfig = {
  type: 'usb',
  autoOpen: true
};

// Instancia por defecto del servicio
export const printerService = new PrinterService(defaultConfig);

// Función helper para imprimir turno
export const printTurno = async (turno: TurnoResponse): Promise<boolean> => {
  return await printerService.printTicket(turno);
};

// Función helper para generar PDF
export const generateTurnoPDF = async (turno: TurnoResponse): Promise<string> => {
  return await printerService.generatePDF(turno);
}; 