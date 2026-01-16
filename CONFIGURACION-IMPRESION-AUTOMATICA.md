# 🖨️ Configuración para Impresión Automática Sin Diálogos

## 📋 Solución Sin Instalar Software en el Equipo POS

Esta solución usa la impresión del navegador con configuración automática. **No requiere instalar ningún software adicional** en los equipos POS.

## ⚙️ Configuración Requerida

### 1. Configurar Impresora como Predeterminada

**Windows:**
1. Ve a **Configuración** → **Dispositivos** → **Impresoras y escáneres**
2. Busca tu impresora POS
3. Haz clic derecho → **Establecer como impresora predeterminada**

**Linux:**
```bash
lpoptions -d NOMBRE_IMPRESORA_POS
```

### 2. Configurar Navegador en Modo Kiosco

Para impresión completamente silenciosa, el navegador debe ejecutarse en **modo kiosco** con permisos de impresión automática.

#### Chrome/Edge (Recomendado):

**Windows:**
```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --kiosk-printing http://192.168.1.211:8082/kiosco
```

**Linux:**
```bash
google-chrome --kiosk --kiosk-printing http://192.168.1.211:8082/kiosco
```

#### Brave:
```bash
brave.exe --kiosk --kiosk-printing http://192.168.1.211:8082/kiosco
```

### 3. Configurar Auto-Start del Navegador

**Windows - Usando Task Scheduler:**

1. Abre **Programador de tareas** (Task Scheduler)
2. Crea nueva tarea:
   - **Nombre:** "Kiosco Digiturno"
   - **Disparador:** Al iniciar sesión
   - **Acción:** Iniciar programa
   - **Programa:** Ruta a Chrome/Brave
   - **Argumentos:** `--kiosk --kiosk-printing http://192.168.1.211:8082/kiosco`
   - **Ejecutar con privilegios elevados:** ✅

**Linux - Usando systemd o autostart:**

Crear archivo `~/.config/autostart/kiosco.desktop`:
```ini
[Desktop Entry]
Type=Application
Name=Kiosco Digiturno
Exec=google-chrome --kiosk --kiosk-printing http://192.168.1.211:8082/kiosco
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
```

## 🎯 Cómo Funciona

1. El frontend crea un **iframe oculto** con el contenido del ticket
2. Llama automáticamente a `window.print()` en el iframe
3. Si el navegador está en modo kiosco con `--kiosk-printing`, imprime directamente sin diálogo
4. Si no está en modo kiosco, muestra el diálogo (pero la impresora ya está seleccionada como predeterminada)

## ✅ Ventajas

- ✅ **No requiere software adicional** en el equipo POS
- ✅ **Funciona en Windows y Linux**
- ✅ **Usa solo el navegador** (Chrome/Edge/Brave)
- ✅ **Configuración simple** (solo modo kiosco)

## ⚠️ Limitaciones

- Requiere que el navegador esté en modo kiosco con `--kiosk-printing`
- La impresora debe estar configurada como predeterminada
- Algunos navegadores pueden requerir permisos adicionales

## 🔧 Solución Alternativa: Script de Inicio Automático

Puedes crear un script que inicie el navegador automáticamente:

**Windows (`iniciar-kiosco.bat`):**
```batch
@echo off
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --kiosk-printing http://192.168.1.211:8082/kiosco
```

**Linux (`iniciar-kiosco.sh`):**
```bash
#!/bin/bash
google-chrome --kiosk --kiosk-printing http://192.168.1.211:8082/kiosco &
```

## 📝 Notas

- El flag `--kiosk-printing` permite impresión automática sin diálogos
- El flag `--kiosk` oculta la barra de direcciones y botones
- Asegúrate de que la URL sea accesible desde el equipo POS
