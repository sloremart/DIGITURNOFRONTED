# 🖨️ Configuración de Impresoras POS para DigiTurno

## 📋 Descripción General

Este sistema incluye soporte completo para impresoras POS (Point of Sale) para imprimir tickets de turnos. El sistema es compatible con impresoras USB, de red y puede generar PDFs como alternativa.

## 🎯 Características

- ✅ **Impresoras USB**: Soporte para impresoras conectadas por USB
- ✅ **Impresoras de Red**: Soporte para impresoras conectadas por red Ethernet
- ✅ **Configuración Personalizada**: Interfaz para configurar impresoras específicas
- ✅ **Impresión por Navegador**: Alternativa usando la función de impresión del navegador
- ✅ **Generación de PDF**: Crear archivos PDF de los tickets
- ✅ **Configuraciones Predefinidas**: Soporte para marcas populares (Epson, Star, Citizen)

## 🖨️ Impresoras Soportadas

### Epson
- **TM-T88VI** (USB y Red)
- **TM-T88V** (USB y Red)
- **TM-T82II** (USB y Red)

### Star
- **TSP100** (USB y Red)
- **TSP143III** (USB y Red)
- **TSP700II** (USB y Red)

### Citizen
- **CT-S310II** (USB y Red)
- **CT-S310** (USB y Red)

### Genéricas
- **Impresora USB Genérica**
- **Impresora de Red Genérica**

## ⚙️ Configuración

### 1. Configuración Automática

1. Ve al **Kiosco** y asigna un turno
2. En la ventana de impresión, haz clic en **"⚙️ Configurar Impresora"**
3. Selecciona tu impresora de la lista predefinida
4. Haz clic en **"🧪 Probar Impresora"** para verificar la conexión

### 2. Configuración Personalizada

Si tu impresora no está en la lista:

1. Selecciona **"🔧 Configuración Personalizada"**
2. Completa los campos según tu impresora:

#### Para Impresoras USB:
- **Tipo de Conexión**: USB
- **Nombre**: Nombre descriptivo de tu impresora
- **Vendor ID**: ID del fabricante (hexadecimal)
- **Product ID**: ID del producto (hexadecimal)
- **Ancho del Papel**: Número de caracteres por línea (típicamente 42)
- **Codificación**: GB18030 (recomendado)

#### Para Impresoras de Red:
- **Tipo de Conexión**: Red (Network)
- **Nombre**: Nombre descriptivo de tu impresora
- **Dirección IP**: IP de la impresora (ej: 192.168.1.100)
- **Puerto**: Puerto de la impresora (típicamente 9100)
- **Ancho del Papel**: Número de caracteres por línea
- **Codificación**: GB18030 (recomendado)

### 3. Encontrar Vendor ID y Product ID (USB)

#### En Windows:
1. Abre **Administrador de dispositivos**
2. Busca tu impresora en **Puertos (COM y LPT)** o **Impresoras**
3. Haz clic derecho → **Propiedades**
4. Ve a la pestaña **Detalles**
5. En **Propiedad**, selecciona **Hardware Ids**
6. El formato será: `USB\VID_04B8&PID_0202`
   - Vendor ID: `04B8`
   - Product ID: `0202`

#### En Linux:
```bash
lsusb
```

#### En macOS:
```bash
system_profiler SPUSBDataType
```

## 🔧 Configuración Avanzada

### Configuración de Red

Para impresoras de red, asegúrate de:

1. **IP Estática**: Configura una IP fija en la impresora
2. **Puerto Abierto**: Verifica que el puerto 9100 esté abierto
3. **Firewall**: Configura el firewall para permitir conexiones
4. **Ping**: Verifica conectividad con `ping [IP_IMPRESORA]`

### Configuración de USB

Para impresoras USB:

1. **Drivers**: Instala los drivers oficiales
2. **Permisos**: En Linux, agrega tu usuario al grupo `lp`
3. **Cable**: Usa un cable USB de calidad
4. **Puerto**: Prueba diferentes puertos USB

## 🧪 Pruebas

### Test de Conexión
1. Configura tu impresora
2. Haz clic en **"🧪 Probar Impresora"**
3. Verifica que aparezca el mensaje de éxito

### Test de Impresión
1. Asigna un turno en el kiosco
2. Haz clic en **"🖨️ Imprimir en POS"**
3. Verifica que el ticket se imprima correctamente

## 📄 Formato del Ticket

El ticket incluye:

```
================================
        NEURODX IPS
     SISTEMA DIGITURNO
================================

FECHA: [Fecha actual]
HORA: [Hora actual]

🎫 NUMERO DE TURNO:
    [Número del turno]

👤 PACIENTE:
    [Nombre completo]
    [Tipo documento]: [Número documento]

📅 CITA PROGRAMADA:
    Cita #: [ID de la cita]
    Fecha: [Fecha de la cita]
    Hora: [Hora de la cita]
    Procedimiento: [Procedimiento]

⏰ HORA DE ASIGNACION:
    [Hora de asignación]

📋 INSTRUCCIONES:
    • Espere a que su número sea llamado
    • Manténgase cerca del área de atención
    • Presente su documento cuando sea llamado

================================
    ¡GRACIAS POR SU PACIENCIA!
================================
```

## 🚨 Solución de Problemas

### Error: "Impresora no encontrada"
- Verifica que la impresora esté encendida
- Comprueba la conexión USB/Red
- Revisa los Vendor ID y Product ID

### Error: "No se puede conectar"
- Verifica la IP y puerto (impresoras de red)
- Comprueba que el firewall no bloquee la conexión
- Prueba con ping a la IP de la impresora

### Error: "Caracteres extraños"
- Cambia la codificación a UTF-8 o ISO-8859-1
- Verifica que la impresora soporte la codificación
- Prueba con diferentes configuraciones de ancho

### Error: "Papel atascado"
- Verifica que no haya papel atascado
- Comprueba que el rollo de papel esté bien colocado
- Limpia los rodillos de la impresora

## 📞 Soporte

Si tienes problemas con la configuración:

1. **Revisa los logs** en la consola del navegador
2. **Prueba la configuración** con el botón de prueba
3. **Verifica la conectividad** de red/USB
4. **Consulta la documentación** de tu impresora

## 🔄 Actualizaciones

El sistema se actualiza automáticamente con nuevas configuraciones de impresoras. Para agregar una nueva impresora:

1. Edita el archivo `src/config/printerConfig.ts`
2. Agrega la nueva configuración
3. Reinicia la aplicación

## 📝 Notas Técnicas

- **Protocolo**: ESC/POS
- **Codificación**: GB18030 (por defecto)
- **Ancho**: 42 caracteres (configurable)
- **Puerto**: 9100 (impresoras de red)
- **Formato**: Texto plano con caracteres especiales

## 🎯 Próximas Características

- [ ] Soporte para impresoras Bluetooth
- [ ] Configuración de múltiples impresoras
- [ ] Plantillas de tickets personalizables
- [ ] Impresión de códigos QR
- [ ] Integración con sistemas de facturación 