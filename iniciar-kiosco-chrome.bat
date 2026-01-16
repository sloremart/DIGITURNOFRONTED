@echo off
echo ========================================
echo   DigiTurno - Iniciar Kiosco
echo ========================================
echo.
echo Iniciando navegador en modo kiosco...
echo La impresion sera automatica y silenciosa.
echo.
echo Presiona Ctrl+Alt+Del para salir del modo kiosco.
echo.

REM Intentar encontrar Chrome en ubicaciones comunes
set CHROME_PATH=

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
)

if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

if "%CHROME_PATH%"=="" (
    echo ERROR: No se encontro Google Chrome instalado.
    echo.
    echo Por favor instala Google Chrome o modifica este script
    echo con la ruta correcta de tu navegador.
    echo.
    pause
    exit /b 1
)

echo Navegador encontrado: %CHROME_PATH%
echo.

REM Verificar impresora predeterminada del sistema
echo Verificando impresora predeterminada del sistema...
for /f "tokens=2 delims==" %%I in ('wmic printer where "Default=True" get Name /value 2^>nul') do (
    if not "%%I"=="" (
        set DEFAULT_PRINTER=%%I
        goto :printer_found_chrome
    )
)
:printer_found_chrome
if defined DEFAULT_PRINTER (
    echo Impresora predeterminada: %DEFAULT_PRINTER%
) else (
    echo ADVERTENCIA: No se encontro una impresora predeterminada.
    echo Por favor configura una impresora predeterminada en Windows.
)
echo.

REM Cerrar todas las instancias de Chrome antes de iniciar
echo Cerrando instancias anteriores de Chrome (si existen)...
taskkill /F /IM chrome.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Instancias anteriores cerradas.
    timeout /t 1 /nobreak >nul
) else (
    echo No habia instancias anteriores de Chrome.
)
echo.

echo Iniciando en modo kiosco...
echo NOTA: El navegador usara la impresora predeterminada del sistema.
echo.

REM Iniciar Chrome en modo kiosco con impresion automatica
REM IMPORTANTE:
REM - Si Chrome ya estaba abierto, puede reutilizar la instancia anterior SIN los flags.
REM - Forzamos una instancia con perfil dedicado para que SIEMPRE aplique --kiosk-printing.
REM - El flag --kiosk-printing usa la impresora predeterminada del sistema.
set KIOSK_PROFILE=%LOCALAPPDATA%\DigiTurnoKioscoChrome
echo Perfil kiosco: %KIOSK_PROFILE%
echo.
echo Ejecutando comando:
echo "%CHROME_PATH%" --kiosk --kiosk-printing --new-window --no-first-run --disable-session-crashed-bubble --user-data-dir="%KIOSK_PROFILE%" http://192.168.1.211:8082/kiosco
echo.

start "" "%CHROME_PATH%" --kiosk --kiosk-printing --new-window --no-first-run --disable-session-crashed-bubble --user-data-dir="%KIOSK_PROFILE%" http://192.168.1.211:8082/kiosco

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo ERROR: No se pudo iniciar Chrome
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