# Impresión Automática de Turnos - Frontend

## 📄 Descripción
La impresión automática está configurada para imprimir tickets directamente desde el frontend cuando se genera un turno, sin necesidad de intervención manual del usuario.

## ✅ Flujos Implementados

### 1. **Kiosco (Autoservicio)**
- **Ubicación**: `src/pages/Kiosco.tsx`
- **Funcionamiento**: Al asignar cualquier tipo de turno (preferencial, facturación, asignación de cita), se imprime automáticamente
- **Líneas**: 187-194

### 2. **Gestión de Turnos (Administrativo)**
- **Ubicación**: `src/pages/Turnos.tsx`
- **Funcionamiento**: Al asignar un turno desde la interfaz administrativa, se imprime automáticamente
- **Líneas**: 112-123

## 🖨️ Características de la Plantilla

### Información Incluida en el Ticket:
- **Logo**: NEURODX
- **Slogan**: "Su diagnóstico, nuestro compromiso"
- **Número de Turno**: Destacado en tamaño grande
- **Nombre del Paciente**: Si está disponible
- **Información de Cita**: Número de cita si aplica
- **Tipo de Servicio**: Preferencial, Facturación, etc.
- **Fecha y Hora**: Momento de impresión
- **Instrucciones**: "Por favor espere el llamado en pantalla"

### Formato del Ticket:
- **Tamaño**: 9cm x 6cm (optimizado para impresoras POS)
- **Centrado**: Todo el contenido está centrado
- **Espaciado**: Distribuido verticalmente para mejor legibilidad

## 🔧 Configuración Técnica

### Backend Requirements:
El frontend intenta conectarse con los siguientes endpoints del backend:
- `POST /printer/print-ticket-custom` (preferido)
- `POST /printer/print-ticket` (fallback)

### Servicios Utilizados:
- **PrinterService**: `src/services/printerService.ts`
- **Métodos principales**:
  - `printTicket()`: Impresión automática
  - `formatForPOSPrinter()`: Formato para impresoras POS
  - `generateTicketHTML()`: Visualización en navegador

## 📱 Comportamiento por Flujo

### Kiosco (Autoservicio):
```typescript
const printSuccess = await printerService.printTicket(turno, servicioSeleccionado || undefined);
```

### Turnos (Administrativo):
```typescript
const printSuccess = await printerService.printTicket(turno, esPreferencial ? 'preferencial' : 'general');
```

## ⚠️ Manejo de Errores

- Si la impresión falla, el turno **SÍ** se asigna correctamente
- Se muestra un mensaje indicando el estado de la impresión
- Logs detallados en la consola del navegador

### Mensajes de Estado:
- ✅ **Éxito**: "Turno asignado exitosamente: [NÚMERO] - Ticket impreso"
- ⚠️ **Error en impresión**: "Turno asignado exitosamente: [NÚMERO] - Error en impresión"

## 🛠️ Resolución de Problemas

### Si no imprime:
1. Verificar que el backend esté ejecutándose
2. Comprobar la conexión con la impresora
3. Revisar logs en la consola del navegador
4. Verificar endpoints de impresión en el backend

### Archivos a revisar:
- `digiturnofrontend/src/services/printerService.ts`
- `digiturnofrontend/src/pages/Kiosco.tsx`
- `digiturnofrontend/src/pages/Turnos.tsx`

## 🔄 Fallbacks Disponibles

1. **Endpoint principal**: `/printer/print-ticket-custom`
2. **Endpoint alternativo**: `/printer/print-ticket`
3. **Formato simple**: Si el formato principal falla
4. **Visualización HTML**: Para debugging (`generateTicketHTML()`)

---

**Nota**: La impresión automática está implementada y funcionando en todos los flujos de generación de turnos del frontend. No se requiere configuración adicional por parte del usuario.
