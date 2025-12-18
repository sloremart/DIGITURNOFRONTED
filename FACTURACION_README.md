# 🎫 Sistema de Facturación - DigiTurno

## Descripción

El Sistema de Facturación de DigiTurno es una interfaz especializada que permite a los facturadores gestionar eficientemente la cola de turnos en espera. Proporciona dos modos de visualización para adaptarse a diferentes necesidades de trabajo.

## 🚀 Características Principales

### 📊 Dashboard Compacto (Vista por Defecto)
- **Vista rápida** de turnos pendientes y llamados
- **Estadísticas en tiempo real** con contadores visuales
- **Auto-refresh cada 15 segundos** para mantener información actualizada
- **Diseño responsive** optimizado para pantallas pequeñas
- **Indicadores de prioridad** basados en tiempo de espera

### 🎫 Panel Completo
- **Gestión detallada** de todos los turnos
- **Información completa** de pacientes y citas
- **Acciones avanzadas** (llamar, atender, cancelar)
- **Modal de detalles** para información completa
- **Auto-refresh configurable** (cada 30 segundos)

## 🎯 Funcionalidades

### Gestión de Turnos
- **Llamar Turno**: Cambia el estado de "PENDIENTE" a "LLAMADO"
- **Atender Turno**: Marca el turno como "ATENDIDO"
- **Cancelar Turno**: Cancela el turno (con confirmación)
- **Ver Detalles**: Información completa del paciente y cita

### Sistema de Prioridades
- **🟢 Verde**: Menos de 30 minutos de espera
- **🟠 Naranja**: Entre 30 y 60 minutos de espera
- **🔴 Rojo**: Más de 60 minutos de espera

### Información Mostrada
- **Número de turno**
- **Nombre completo del paciente**
- **Documento de identidad**
- **Información de la cita** (ID, fecha, hora, procedimiento)
- **Hora de asignación del turno**
- **Tiempo de espera actual**
- **Estado del turno**

## 🖥️ Cómo Usar

### 1. Acceso a la Interfaz
- Navega a la sección "🎫 Facturación" en el menú principal
- Por defecto se muestra el Dashboard Compacto

### 2. Cambiar Modo de Vista
- Usa los botones "📊 Dashboard" y "🎫 Panel Completo"
- El Dashboard es ideal para monitoreo continuo
- El Panel Completo es mejor para gestión detallada

### 3. Gestionar Turnos
- **Para llamar un turno**: Haz clic en "📢 Llamar"
- **Para atender un turno**: Haz clic en "✅ Atender"
- **Para ver detalles**: Haz clic en la tarjeta del turno
- **Para cancelar**: Usa el botón "❌ Cancelar" (con confirmación)

### 4. Monitoreo en Tiempo Real
- Los turnos se actualizan automáticamente
- El tiempo de espera se calcula en tiempo real
- Los contadores se actualizan dinámicamente

## 🔧 Configuración Técnica

### Endpoints de API Utilizados
- `GET /turnos-activos` - Obtener turnos activos
- `POST /turnos/llamar` - Llamar un turno
- `POST /turnos/atender` - Marcar turno como atendido
- `POST /turnos/cancelar` - Cancelar un turno

### Estados de Turnos
- **PENDIENTE**: Turno asignado, esperando ser llamado
- **LLAMADO**: Turno llamado, paciente debe acercarse
- **ATENDIDO**: Turno completado, paciente atendido
- **CANCELADO**: Turno cancelado

### Frecuencias de Actualización
- **Dashboard**: Cada 15 segundos
- **Panel Completo**: Cada 30 segundos (configurable)

## 📱 Responsive Design

La interfaz se adapta automáticamente a diferentes tamaños de pantalla:

- **Desktop (>1200px)**: Vista en columnas múltiples
- **Tablet (768px-1200px)**: Vista adaptada con scroll
- **Mobile (<768px)**: Vista vertical optimizada

## 🎨 Personalización

### Colores de Prioridad
- **Baja prioridad**: Verde (#27ae60)
- **Media prioridad**: Naranja (#f39c12)
- **Alta prioridad**: Rojo (#e74c3c)

### Temas Visuales
- Gradientes modernos y profesionales
- Iconos emoji para mejor UX
- Animaciones suaves y transiciones
- Sombras y efectos visuales

## 🚨 Solución de Problemas

### Turnos No Se Actualizan
- Verifica la conexión al backend
- Revisa la consola del navegador para errores
- Usa el botón de actualización manual

### Errores de API
- Verifica que el backend esté funcionando
- Revisa los logs del servidor
- Confirma que los endpoints estén disponibles

### Problemas de Rendimiento
- Reduce la frecuencia de auto-refresh
- Cierra pestañas innecesarias
- Verifica la conexión a internet

## 🔒 Seguridad

- **Validación de datos** en el frontend
- **Confirmación** para acciones destructivas
- **Manejo de errores** robusto
- **Logs de auditoría** para todas las acciones

## 📈 Métricas y Estadísticas

El sistema proporciona:
- **Contador de turnos pendientes**
- **Contador de turnos llamados**
- **Total de turnos activos**
- **Tiempo de espera promedio**
- **Estado de conexión del sistema**

## 🚀 Próximas Funcionalidades

- **Notificaciones push** para nuevos turnos
- **Historial de turnos** por facturador
- **Reportes de productividad**
- **Integración con sistemas de audio**
- **Modo offline** con sincronización

## 📞 Soporte

Para soporte técnico o reportar problemas:
- Revisa los logs del sistema
- Contacta al equipo de desarrollo
- Consulta la documentación del backend

---

**Desarrollado para DigiTurno - Sistema de Gestión de Turnos Digitales**
