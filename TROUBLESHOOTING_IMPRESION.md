# Guía de Solución de Problemas - Sistema de Impresión DigiTurno

## Problema: "No quiere imprimir"

### Diagnóstico

El sistema de impresión puede no estar funcionando por varias razones. Sigue estos pasos para diagnosticar y solucionar el problema:

### 1. Verificar que el Modal se Muestre

**Síntoma**: El modal de impresión no aparece después de asignar un turno.

**Solución**:
1. Abre la consola del navegador (F12)
2. Busca un paciente y asigna un turno
3. Verifica que aparezcan estos logs en la consola:
   - "Turno asignado exitosamente: [objeto]"
   - "Activando modal de impresión..."
   - "TicketPrinter renderizado con turno: [objeto]"

**Si no aparecen los logs**:
- El problema está en la asignación del turno
- Verifica que el backend esté respondiendo correctamente
- Revisa la consola para errores de red

### 2. Probar el Modal Manualmente

**Usar el botón de prueba**:
1. En la página del Kiosco, busca el botón "🧪 Probar Modal de Impresión"
2. Haz clic en él
3. Debería aparecer el modal de impresión inmediatamente

**Si el botón de prueba no funciona**:
- Hay un problema con el componente `TicketPrinter`
- Verifica que no haya errores de JavaScript en la consola

### 3. Verificar el Componente TicketPrinter

**Problemas comunes**:
- El CSS no se está cargando correctamente
- Hay errores de TypeScript
- El componente no se está importando correctamente

**Solución**:
1. Verifica que el archivo `src/components/TicketPrinter.tsx` existe
2. Verifica que el archivo `src/components/TicketPrinter.css` existe
3. Asegúrate de que no haya errores de compilación

### 4. Verificar el Servicio de Impresión

**Problemas comunes**:
- El servicio no está generando el contenido del ticket
- Hay errores en la simulación de impresión

**Solución**:
1. Abre la consola del navegador
2. Busca el log "🎫 TICKET A IMPRIMIR:"
3. Debería mostrar el contenido del ticket formateado

### 5. Problemas de CSS

**Síntoma**: El modal aparece pero no se ve correctamente.

**Solución**:
1. Verifica que el archivo `TicketPrinter.css` esté siendo importado
2. Asegúrate de que no haya conflictos de CSS
3. Verifica que el z-index del modal sea alto (1000)

### 6. Problemas de Estado

**Síntoma**: El modal no se muestra aunque el turno se asigne correctamente.

**Solución**:
1. Verifica que `showTicketPrinter` se esté estableciendo en `true`
2. Verifica que `turnoAsignado` no sea `null`
3. Asegúrate de que ambos estados estén correctos simultáneamente

### 7. Verificar la Consola del Navegador

**Pasos**:
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Busca los logs de depuración que agregamos

### 8. Logs de Depuración Esperados

Cuando todo funciona correctamente, deberías ver estos logs:

```
Asignando turno para cita: [objeto cita]
Turno asignado exitosamente: [objeto turno]
Activando modal de impresión...
TicketPrinter renderizado con turno: [objeto turno]
🎫 TICKET A IMPRIMIR:
[contenido del ticket]
✅ Ticket impreso exitosamente
```

### 9. Soluciones Rápidas

**Si el modal no aparece**:
1. Recarga la página (Ctrl+F5)
2. Limpia la caché del navegador
3. Verifica que no haya errores de JavaScript

**Si el modal aparece pero no imprime**:
1. Usa el botón "Imprimir en Navegador" como alternativa
2. Verifica que la impresora esté conectada y configurada
3. Revisa la configuración de la impresora en el modal

### 10. Contacto para Soporte

Si ninguna de estas soluciones funciona:

1. Toma una captura de pantalla de la consola del navegador
2. Anota los pasos exactos que seguiste
3. Proporciona información sobre tu navegador y sistema operativo

### Información del Sistema

- **Frontend**: React JS con TypeScript
- **Servicio de Impresión**: Simulado para desarrollo
- **Modal**: Componente personalizado con CSS
- **Estado**: React Hooks (useState)

### Notas Importantes

- El sistema de impresión está simulado para desarrollo
- En producción, necesitarás configurar una impresora POS real
- El modal se muestra automáticamente después de asignar un turno
- Puedes usar el botón de prueba para verificar el funcionamiento 