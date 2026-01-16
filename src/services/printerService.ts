import { TurnoResponse } from '../types';
import { API_URL } from './api';

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

  /**
   * Detecta si el navegador está en modo kiosco
   * (aproximación basada en características del navegador)
   */
  private isKioskMode(): boolean {
    // Detectar modo kiosco: si no hay barra de herramientas visible
    // o si window.chrome tiene propiedades específicas de kiosco
    try {
      // En modo kiosco, window.outerHeight === window.innerHeight (sin barras)
      const hasNoBars = window.outerHeight === window.innerHeight && 
                        window.outerWidth === window.innerWidth;
      
      // Verificar si hay flags de kiosco (no siempre disponible)
      const userAgent = navigator.userAgent.toLowerCase();
      const isChromeBased = userAgent.includes('chrome') || userAgent.includes('edge') || userAgent.includes('brave');
      
      // Si no hay barras y es Chrome-based, probablemente está en kiosco
      return hasNoBars && isChromeBased;
    } catch {
      return false;
    }
  }

  async printTicket(turno: TurnoResponse, servicio?: string): Promise<boolean> {
    try {
      const ticketContentText = this.formatForPOSPrinter(turno, servicio);
      const ticketContentHtml = this.generateTicketHTML(turno, servicio);
      
      const isKiosk = this.isKioskMode();
      
      if (isKiosk) {
        console.log('🖨️ Modo kiosco detectado - Impresión automática activada');
      } else {
        console.log('🖨️ Modo normal - El diálogo de impresión aparecerá (requiere --kiosk-printing para impresión automática)');
      }
      
      // MÉTODO PRINCIPAL: Usar iframe oculto para impresión
      // Si el navegador está en modo kiosco con --kiosk-printing, imprimirá automáticamente sin diálogo
      // Si no está en modo kiosco, mostrará el diálogo (limitación de seguridad del navegador)
      try {
        // Crear iframe completamente oculto
        const printIframe = document.createElement('iframe');
        printIframe.style.position = 'fixed';
        printIframe.style.right = '0';
        printIframe.style.bottom = '0';
        printIframe.style.width = '0';
        printIframe.style.height = '0';
        printIframe.style.border = '0';
        printIframe.style.opacity = '0';
        printIframe.style.pointerEvents = 'none';
        printIframe.style.zIndex = '-1';
        printIframe.style.visibility = 'hidden';
        
        document.body.appendChild(printIframe);
        
        console.log('✅ Iframe oculto creado');
        
        // Escribir contenido en el iframe
        const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
        if (!iframeDoc) {
          throw new Error('No se pudo acceder al documento del iframe');
        }
        
        iframeDoc.open();
        iframeDoc.write(ticketContentHtml);
        iframeDoc.close();
        
        console.log('✅ Contenido escrito en iframe');
        
        // Función para imprimir cuando el iframe esté listo
        const printWhenReady = () => {
          try {
            const iframeWindow = printIframe.contentWindow;
            if (!iframeWindow) {
              throw new Error('No se pudo acceder a la ventana del iframe');
            }
            
            console.log('🖨️ Llamando a print() en iframe...');
            
            // Llamar a print() en el iframe
            iframeWindow.focus();
            
            // Intentar imprimir automáticamente
            // Si el navegador tiene --kiosk-printing, esto funcionará sin diálogo
            // Si no, intentaremos simular Enter automáticamente después de un breve delay
            iframeWindow.print();
            
            console.log('✅ print() llamado exitosamente');
            
            if (!isKiosk) {
              console.log('💡 NOTA: Para impresión completamente automática sin diálogo,');
              console.log('   inicia el navegador con: --kiosk --kiosk-printing');
              console.log('   Verifica en brave://version o chrome://version que la línea "Command Line" lo incluya.');
            } else {
              console.log('✅ Modo kiosco detectado (aprox). Si sigue apareciendo vista previa, el proceso NO tiene --kiosk-printing.');
              console.log('   Verifica en brave://version (Command Line).');
            }
            
            // Limpiar el iframe después de un tiempo
            setTimeout(() => {
              if (printIframe.parentNode) {
                printIframe.parentNode.removeChild(printIframe);
                console.log('🧹 Iframe removido');
              }
            }, 3000);
            
            return true;
          } catch (error) {
            console.error('❌ Error en impresión:', error);
            if (printIframe.parentNode) {
              printIframe.parentNode.removeChild(printIframe);
            }
            return false;
          }
        };
        
        // Esperar a que el iframe cargue completamente
        printIframe.onload = () => {
          console.log('✅ Iframe cargado, imprimiendo...');
          setTimeout(printWhenReady, 300);
        };
        
        // Fallback: intentar después de un tiempo fijo
        setTimeout(() => {
          if (printIframe.parentNode) {
            console.log('⏰ Fallback: intentando imprimir...');
            printWhenReady();
          }
        }, 1000);
        
        return true;
      } catch (error) {
        console.error('❌ Error creando iframe de impresión:', error);
        
        // Si falló, intentar con el backend como respaldo
        console.log('🔄 Intentando impresión a través del backend del servidor (respaldo)...');
        try {
          const printUrl = `${API_URL}/printer/print-ticket-custom`;
          const response = await fetch(printUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              numero_turno: turno.numero_turno,
              ticket_content: ticketContentHtml,
              ticket_content_plain: ticketContentText,
              ticket_format: 'text'
            }),
          });

          if (response.ok) {
            const printData = await response.json();
            if (printData.success) {
              console.log('✅ Ticket impreso exitosamente a través del backend');
              return true;
            }
          }
        } catch (backendError) {
          console.error('❌ Error con backend:', backendError);
        }

        // Si ambos métodos fallaron
        console.error('❌ No se pudo imprimir el ticket.');
        return false;
      }
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
      
      const response = await fetch(`${API_URL}/printer/print-ticket-custom`, {
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