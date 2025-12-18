import { TurnoResponse } from '../types';

// Interfaz para la configuración de la impresora
interface PrinterServiceConfig {
  type: 'usb' | 'network' | 'file';
  address?: string;
  port?: number;
  vendorId?: number;
  productId?: number;
  autoOpen?: boolean;
  renderMode?: 'text' | 'html';
}

// Clase para manejar la impresión de turnos
export class PrinterService {
  private config: PrinterServiceConfig;

  constructor(config?: PrinterServiceConfig) {
    const defaultConfig: PrinterServiceConfig = {
      type: 'usb',
      autoOpen: true,
      renderMode: 'html'
    };
    this.config = { ...defaultConfig, ...config };
  }

  // Función helper para obtener nombre completo
  private getNombreCompleto(paciente: any): string {
    const nombres = [paciente.nombre1, paciente.nombre2].filter(Boolean).join(' ');
    const apellidos = [paciente.apellido1, paciente.apellido2].filter(Boolean).join(' ');
    return `${nombres} ${apellidos}`.trim();
  }

  // Generar el contenido del ticket simplificado (alineado a la izquierda)
  public generateTicketContent(turno: TurnoResponse, servicio?: string): string {
    const lines = [
      'NEURODX',
      'Su diagnóstico, nuestro compromiso',
      '',
      `TURNO ${turno.numero_turno}`.toUpperCase(),
      '',
      'Por favor espere el llamado en pantalla',
      ''
    ];
    return `\n${lines.join('\n')}\n`;
  }

  async printTicket(turno: TurnoResponse, servicio?: string): Promise<boolean> {
    try {
      const ticketContentText = this.formatForPOSPrinter(turno, servicio);
      const ticketContentHtml = this.generateTicketHTML(turno, servicio);
      const useHtml = (this.config.renderMode ?? 'html') === 'html';
      const ticketContent = useHtml ? ticketContentHtml : ticketContentText;
      
      let primaryResult = false;

      // Usar el nuevo endpoint de impresión personalizada
      try {
        console.log('🖨️ Enviando ticket al backend para impresión...', {
          numero_turno: turno.numero_turno,
          contenido_length: ticketContent.length
        });
        
        const response = await fetch('http://localhost:8000/printer/print-ticket-custom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            numero_turno: turno.numero_turno,
            ticket_content: ticketContent,
            ticket_content_plain: ticketContentText,
            ticket_format: useHtml ? 'html' : 'text'
          }),
        });

        console.log('📥 Respuesta del backend:', response.status, response.statusText);
        
        if (response.ok) {
          const printData = await response.json();
          console.log('📄 Datos de respuesta:', printData);
          
          if (printData.success) {
            console.log('✅ Ticket NEURODX impreso exitosamente desde frontend');
            primaryResult = true;
          } else {
            console.error('❌ Error en la respuesta del backend:', printData);
            primaryResult = await this.trySimpleFormat(turno);
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Error HTTP del backend:', response.status, errorText);
          primaryResult = await this.trySimpleFormat(turno);
        }
      } catch (error) {
        console.error('❌ Error de conexión con endpoint de impresión:', error);
        console.log('🔄 Intentando formato simple como fallback...');
        primaryResult = await this.trySimpleFormat(turno);
      }

      if (primaryResult) {
        return true;
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

  private readonly POS_WIDTH = 40;

  // Formato para impresoras POS: diseño mejorado y profesional
  private formatForPOSPrinter(turno: TurnoResponse, servicio?: string): string {
    const pacienteName = turno.paciente ? this.getNombreCompleto(turno.paciente) : (turno.nombre_paciente || '');
    
    // Obtener fecha y hora actual
    const fechaActual = new Date().toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const horaActual = new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Determinar nombre del servicio/módulo
    let nombreServicio = '';
    if (servicio) {
      const servicios: { [key: string]: string } = {
        'facturacion': 'FACTURACIÓN',
        'asignacion': 'ASIGNACIÓN DE CITAS',
        'preferencial': 'TURNO PREFERENCIAL'
      };
      nombreServicio = servicios[servicio.toLowerCase()] || servicio.toUpperCase();
    } else if (turno.modulo) {
      const modulos: { [key: string]: string } = {
        'FACTURACION': 'FACTURACIÓN',
        'ASIGNACION_CITA': 'ASIGNACIÓN DE CITAS',
        'PREFERENCIAL': 'TURNO PREFERENCIAL'
      };
      nombreServicio = modulos[turno.modulo] || turno.modulo;
    }

    // Información adicional
    const horaCita = turno.cita?.hora_cita || turno.hora_cita || '';
    const esPreferencial = turno.es_preferencial || false;
    const motivoPreferencial = turno.motivo_preferencial || '';

    const lines: string[] = [];
    
    // NEURODX centrado
    lines.push('[CENTER]NEURODX[/CENTER]');
    
    // Slogan centrado
    lines.push('[CENTER]Su diagnóstico, nuestro compromiso[/CENTER]');
    lines.push('');
    
    // FACTURACIÓN centrado (si existe)
    if (nombreServicio) {
      lines.push(`[CENTER]${nombreServicio}[/CENTER]`);
      lines.push('');
    }
    
    // TURNO destacado (el más grande)
    lines.push(`[CENTER]TURNO ${turno.numero_turno}[/CENTER]`);
    lines.push('');
    
    // Información del paciente (solo si está disponible)
    if (pacienteName) {
      lines.push(pacienteName);
      lines.push('');
    }
    
    // SOLO fecha y hora actual (sin "Hora Cita")
    lines.push(`${fechaActual} - ${horaActual}`);
    lines.push('');
    
    // Instrucción
    lines.push('Por favor espere el llamado en pantalla');
    lines.push('');

    return `\n${lines.join('\n')}\n`;
  }

  private wrapText(text: string | undefined, width: number = this.POS_WIDTH): string[] {
    if (!text) return [];
    const words = text.split(/\s+/).filter(Boolean);
    const result: string[] = [];
    let current = '';

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > width) {
        if (current) result.push(current);
        if (word.length > width) {
          result.push(word);
          current = '';
        } else {
          current = word;
        }
      } else {
        current = next;
      }
    }

    if (current) result.push(current);
    return result;
  }

  private emphasizeTurnLine(numeroTurno: string | number): string {
    const text = `TURNO ${numeroTurno}`.toUpperCase();
    if (text.length >= this.POS_WIDTH) {
      return text;
    }
    return `${text}${' '.repeat(this.POS_WIDTH - text.length)}`;
  }

  // Método alternativo con formato más simple para mejor compatibilidad
  private formatSimpleForPOS(turno: TurnoResponse): string {
    return this.generateTicketContent(turno);
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

  // Generar HTML del ticket para visualización - Diseño mejorado
  public generateTicketHTML(turno: TurnoResponse, servicio?: string): string {
    const pacienteName = turno.paciente ? this.getNombreCompleto(turno.paciente) : (turno.nombre_paciente || '');
    
    // Obtener fecha y hora actual
    const fechaActual = new Date().toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const horaActual = new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Determinar nombre del servicio/módulo
    let nombreServicio = '';
    if (servicio) {
      const servicios: { [key: string]: string } = {
        'facturacion': 'FACTURACIÓN',
        'asignacion': 'ASIGNACIÓN DE CITAS',
        'preferencial': 'TURNO PREFERENCIAL'
      };
      nombreServicio = servicios[servicio.toLowerCase()] || servicio.toUpperCase();
    } else if (turno.modulo) {
      const modulos: { [key: string]: string } = {
        'FACTURACION': 'FACTURACIÓN',
        'ASIGNACION_CITA': 'ASIGNACIÓN DE CITAS',
        'PREFERENCIAL': 'TURNO PREFERENCIAL'
      };
      nombreServicio = modulos[turno.modulo] || turno.modulo;
    }

    // Información adicional
    const horaCita = turno.cita?.hora_cita || turno.hora_cita || '';
    const esPreferencial = turno.es_preferencial || false;
    const motivoPreferencial = turno.motivo_preferencial || '';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ticket Turno ${turno.numero_turno}</title>
    <style>
        @page {
            size: 80mm auto;
            margin: 0mm;
            padding: 0mm;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            margin: 0;
            padding: 0;
            width: 80mm;
            min-height: auto;
        }
        body {
            font-family: 'Courier New', Courier, monospace;
            margin: 0;
            padding: 0.4cm 0.25cm;
            background: white;
            width: 78mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            line-height: 1.5;
            transform-origin: top left;
            transform: scale(1);
        }
        .separator {
            width: 100%;
            height: 1px;
            background: #000;
            margin: 0.1cm 0;
            border: none;
        }
        .logo-text {
            font-size: 18px;
            font-weight: bold;
            margin: 0.1cm 0 0.05cm 0;
            text-align: center;
            letter-spacing: 2px;
            color: #000;
            font-family: 'Courier New', Courier, monospace;
        }
        .slogan {
            font-size: 7px;
            margin: 0 0 0.1cm 0;
            text-align: center;
            color: #333;
            font-style: normal;
            letter-spacing: 0.3px;
            font-weight: normal;
            font-family: 'Courier New', Courier, monospace;
        }
        .servicio {
            font-size: 9px;
            font-weight: bold;
            margin: 0.1cm 0;
            text-align: center;
            color: #000;
            font-family: 'Courier New', Courier, monospace;
        }
        .turno-number {
            font-size: 48px;
            font-weight: bold;
            margin: 0.2cm 0;
            letter-spacing: 4px;
            text-align: center;
            color: #000;
            font-family: 'Courier New', Courier, monospace;
            line-height: 1.2;
        }
        .preferencial {
            font-size: 8px;
            font-weight: bold;
            margin: 0.05cm 0;
            text-align: center;
            color: #000;
            font-family: 'Courier New', Courier, monospace;
        }
        .info-line {
            font-size: 11px;
            margin: 0.08cm 0;
            text-align: left;
            width: 100%;
            padding-left: 0.1cm;
            color: #000;
            font-weight: normal;
            font-family: 'Courier New', Courier, monospace;
        }
        .info-label {
            font-weight: bold;
        }
        .instructions {
            font-size: 10px;
            margin: 0.1cm 0 0 0;
            line-height: 1.4;
            text-align: left;
            width: 100%;
            padding-left: 0.1cm;
            color: #000;
            font-style: normal;
            font-weight: normal;
            font-family: 'Courier New', Courier, monospace;
        }
        .separator-line {
            width: 100%;
            border-top: 1px dashed #666;
            margin: 0.08cm 0;
        }
        .thanks {
            font-size: 8px;
            margin: 0.08cm 0;
            text-align: center;
            color: #000;
            font-weight: bold;
            font-family: 'Courier New', Courier, monospace;
        }
    </style>
</head>
<body>
    <div class="separator"></div>
    <div class="logo-text">NEURODX</div>
    <div class="slogan">Su diagnóstico, nuestro compromiso</div>
    <div class="separator"></div>
    ${nombreServicio ? `<div class="servicio">${nombreServicio}</div>` : ''}
    <div class="turno-number">TURNO ${turno.numero_turno}</div>
    ${esPreferencial ? `<div class="preferencial">* TURNO PREFERENCIAL *</div>` : ''}
    ${esPreferencial && motivoPreferencial ? `<div class="preferencial">(${motivoPreferencial})</div>` : ''}
    ${pacienteName ? `<div class="info-line"><span class="info-label">Paciente:</span> ${pacienteName}</div>` : ''}
    <div class="info-line">${fechaActual} - ${horaActual}</div>
    <div class="separator-line"></div>
    <div class="instructions">Por favor espere ser llamado<br>en la pantalla de facturación</div>
    <div class="thanks">¡Gracias por su paciencia!</div>
    <div class="separator"></div>
</body>
</html>`;
    return htmlContent;
  }

  // Generar PDF del ticket (alternativa)
  async generatePDF(turno: TurnoResponse): Promise<string> {
    const ticketContent = this.generateTicketContent(turno);
    
    // Aquí podrías usar una librería como jsPDF para generar PDF
    console.log('📄 Generando PDF del ticket...', {
      numero_turno: turno.numero_turno,
      longitud_contenido: ticketContent.length
    });
    
    // Retornar URL del PDF generado
    return `/tickets/${turno.numero_turno}.pdf`;
  }
}

// Configuración por defecto
const defaultConfig: PrinterServiceConfig = {
  type: 'usb',
  autoOpen: true,
  renderMode: 'html'
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