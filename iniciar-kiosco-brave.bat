@echo off
echo ========================================
echo   DigiTurno - Iniciar Kiosco (Brave)
echo ========================================
echo.
echo Iniciando navegador en modo kiosco...
echo La impresion sera automatica y silenciosa.
echo.
echo Presiona Ctrl+Alt+Del para salir del modo kiosco.
echo.

REM Intentar encontrar Brave en ubicaciones comunes
set BRAVE_PATH=

if exist "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" (
    set "BRAVE_PATH=C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
)

if exist "C:\Program Files (x86)\BraveSoftware\Brave-Browser\Application\brave.exe" (
    set "BRAVE_PATH=C:\Program Files (x86)\BraveSoftware\Brave-Browser\Application\brave.exe"
)

if "%BRAVE_PATH%"=="" (
    echo ERROR: No se encontro Brave Browser instalado.
    echo.
    echo Por favor instala Brave Browser o modifica este script
    echo con la ruta correcta de tu navegador.
    echo.
    pause
    exit /b 1
)

echo Navegador encontrado: %BRAVE_PATH%
echo.

REM Verificar impresora predeterminada del sistema
echo Verificando impresora predeterminada del sistema...
for /f "tokens=2 delims==" %%I in ('wmic printer where "Default=True" get Name /value 2^>nul') do (
    if not "%%I"=="" (
        set DEFAULT_PRINTER=%%I
        goto :printer_found
    )
)
:printer_found
if defined DEFAULT_PRINTER (
    echo Impresora predeterminada: %DEFAULT_PRINTER%
) else (
    echo ADVERTENCIA: No se encontro una impresora predeterminada.
    echo Por favor configura una impresora predeterminada en Windows.
)
echo.

REM Cerrar todas las instancias de Brave antes de iniciar
echo Cerrando instancias anteriores de Brave (si existen)...
taskkill /F /IM brave.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Instancias anteriores cerradas.
    timeout /t 1 /nobreak >nul
) else (
    echo No habia instancias anteriores de Brave.
)
echo.

echo Iniciando en modo kiosco...
echo NOTA: El navegador usara la impresora predeterminada del sistema.
echo.

REM Iniciar Brave en modo kiosco con impresion automatica
REM IMPORTANTE:
REM - Si Brave ya estaba abierto, puede reutilizar la instancia anterior SIN los flags.
REM - Forzamos una instancia con perfil dedicado para que SIEMPRE aplique --kiosk-printing.
REM - El flag --kiosk-printing usa la impresora predeterminada del sistema.
set KIOSK_PROFILE=%LOCALAPPDATA%\DigiTurnoKioscoBrave
echo Perfil kiosco: %KIOSK_PROFILE%
echo.
echo Ejecutando comando:
echo "%BRAVE_PATH%" --kiosk --kiosk-printing --new-window --no-first-run --disable-session-crashed-bubble --user-data-dir="%KIOSK_PROFILE%" http://192.168.1.211:8082/kiosco
echo.

REM Iniciar Brave con el flag --kiosk-printing que usa la impresora predeterminada del sistema
start "" "%BRAVE_PATH%" --kiosk --kiosk-printing --new-window --no-first-run --disable-session-crashed-bubble --user-data-dir="%KIOSK_PROFILE%" http://192.168.1.211:8082/kiosco

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo ERROR: No se pudo iniciar Brave
    echo Codigo de error: %ERRORLEVEL%
    echo ========================================
    echo.
) else (
    echo Comando ejecutado exitosamente.
)

echo.
echo Navegador iniciado en modo kiosco.
echo.
echo Para salir: Presiona Ctrl+Alt+Del y cierra el navegador
echo.
echo.
echo ========================================
echo Presiona cualquier tecla para cerrar...
echo ========================================
pause >nul