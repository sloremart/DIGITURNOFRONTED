# 🖨️ Instrucciones para Impresión Automática en Kiosco

## 📋 Opción 1: Script Simple (Recomendado)

### Paso 1: Ejecutar el Script
1. Copia el archivo `iniciar-kiosco-chrome.bat` (o `iniciar-kiosco-brave.bat` si usas Brave) al equipo POS
2. Haz doble clic en el archivo `.bat`
3. El navegador se abrirá en modo kiosco con impresión automática

### Paso 2: Configurar Auto-Inicio (Opcional)
1. Ejecuta `configurar-auto-inicio.bat` como Administrador
2. El kiosco se iniciará automáticamente cada vez que se encienda el equipo

## 📋 Opción 2: Manual (Si los scripts no funcionan)

### Para Chrome:
1. Crea un acceso directo a Chrome
2. Haz clic derecho → Propiedades
3. En "Destino", agrega al final:
   ```
   --kiosk --kiosk-printing http://192.168.1.211:8082/kiosco
   ```
4. Ejemplo completo:
   ```
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --kiosk-printing http://192.168.1.211:8082/kiosco
   ```

### Para Brave:
Similar a Chrome, pero usa la ruta de Brave:
```
"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" --kiosk --kiosk-printing http://192.168.1.211:8082/kiosco
```

## ⚙️ Configuración Adicional

### 1. Configurar Impresora como Predeterminada
- Ve a **Configuración** → **Dispositivos** → **Impresoras y escáneres**
- Haz clic derecho en tu impresora POS → **Establecer como impresora predeterminada**

### 2. Salir del Modo Kiosco
- Presiona **Ctrl + Alt + Del**
- Cierra el navegador desde el Administrador de tareas

## ✅ Verificación

Una vez configurado:
- El navegador se abrirá en pantalla completa (modo kiosco)
- Al asignar un turno, se imprimirá automáticamente **sin mostrar diálogo**
- El formato será de 80mm (ticket pequeño)

## 🔧 Solución de Problemas

### El script no encuentra Chrome/Brave
- Edita el archivo `.bat` y modifica la ruta según tu instalación
- O instala Chrome/Brave en la ubicación estándar

### La impresión no es automática
- Verifica que el navegador se inició con los flags `--kiosk --kiosk-printing`
- Verifica que la impresora POS está configurada como predeterminada
- Revisa la consola del navegador (F12) para ver errores

### El navegador no se inicia en modo kiosco
- Ejecuta el script como Administrador
- Verifica que la URL es correcta: `http://192.168.1.211:8082/kiosco`
