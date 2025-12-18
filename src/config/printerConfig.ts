// Configuraciones para diferentes tipos de impresoras POS

export interface PrinterConfig {
  type: 'usb' | 'network' | 'file';
  name: string;
  address?: string;
  port?: number;
  vendorId?: number;
  productId?: number;
  autoOpen?: boolean;
  width?: number; // Ancho del papel en caracteres
  encoding?: string;
}

// Configuraciones predefinidas para impresoras comunes
export const PRINTER_CONFIGS: { [key: string]: PrinterConfig } = {
  // Impresora USB genérica
  'usb-generic': {
    type: 'usb',
    name: 'Impresora USB Genérica',
    autoOpen: true,
    width: 42,
    encoding: 'GB18030'
  },

  // Impresora de red
  'network-generic': {
    type: 'network',
    name: 'Impresora de Red',
    address: '192.168.1.100',
    port: 9100,
    width: 42,
    encoding: 'GB18030'
  },

  // Impresora Epson TM-T88VI (USB)
  'epson-tm-t88vi-usb': {
    type: 'usb',
    name: 'Epson TM-T88VI (USB)',
    vendorId: 0x04b8,
    productId: 0x0202,
    autoOpen: true,
    width: 42,
    encoding: 'GB18030'
  },

  // Impresora Epson TM-T88VI (Red)
  'epson-tm-t88vi-network': {
    type: 'network',
    name: 'Epson TM-T88VI (Red)',
    address: '192.168.1.100',
    port: 9100,
    width: 42,
    encoding: 'GB18030'
  },

  // Impresora Star TSP100 (USB)
  'star-tsp100-usb': {
    type: 'usb',
    name: 'Star TSP100 (USB)',
    vendorId: 0x0519,
    productId: 0x0003,
    autoOpen: true,
    width: 42,
    encoding: 'GB18030'
  },

  // Impresora Star TSP100 (Red)
  'star-tsp100-network': {
    type: 'network',
    name: 'Star TSP100 (Red)',
    address: '192.168.1.100',
    port: 9100,
    width: 42,
    encoding: 'GB18030'
  },

  // Impresora Citizen CT-S310II (USB)
  'citizen-ct-s310ii-usb': {
    type: 'usb',
    name: 'Citizen CT-S310II (USB)',
    vendorId: 0x1eab,
    productId: 0x0001,
    autoOpen: true,
    width: 42,
    encoding: 'GB18030'
  },

  // Impresora Citizen CT-S310II (Red)
  'citizen-ct-s310ii-network': {
    type: 'network',
    name: 'Citizen CT-S310II (Red)',
    address: '192.168.1.100',
    port: 9100,
    width: 42,
    encoding: 'GB18030'
  }
};

// Configuración por defecto
export const DEFAULT_PRINTER_CONFIG: PrinterConfig = {
  type: 'usb',
  name: 'Impresora por Defecto',
  autoOpen: true,
  width: 42,
  encoding: 'GB18030'
};

// Función para obtener configuración de impresora
export const getPrinterConfig = (printerKey: string): PrinterConfig => {
  return PRINTER_CONFIGS[printerKey] || DEFAULT_PRINTER_CONFIG;
};

// Función para listar todas las configuraciones disponibles
export const getAvailablePrinterConfigs = (): { key: string; config: PrinterConfig }[] => {
  return Object.entries(PRINTER_CONFIGS).map(([key, config]) => ({
    key,
    config
  }));
};

// Función para validar configuración de impresora
export const validatePrinterConfig = (config: PrinterConfig): boolean => {
  if (!config.type || !['usb', 'network', 'file'].includes(config.type)) {
    return false;
  }

  if (config.type === 'network' && (!config.address || !config.port)) {
    return false;
  }

  if (config.type === 'usb' && (!config.vendorId || !config.productId)) {
    return false;
  }

  return true;
};

// Función para crear configuración personalizada
export const createCustomPrinterConfig = (
  type: 'usb' | 'network' | 'file',
  options: Partial<PrinterConfig>
): PrinterConfig => {
  return {
    ...DEFAULT_PRINTER_CONFIG,
    type,
    ...options
  };
}; 