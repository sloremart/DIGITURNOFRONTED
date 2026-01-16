@echo off
echo ========================================
echo   DigiTurno - Configurar Auto-Inicio
echo ========================================
echo.
echo Este script creara un acceso directo en el inicio
echo de Windows para que el kiosco se inicie automaticamente.
echo.
echo IMPORTANTE: Primero debes ejecutar iniciar-kiosco-chrome.bat
echo o iniciar-kiosco-brave.bat para verificar que funciona.
echo.
pause

REM Obtener la ruta del script actual
set SCRIPT_DIR=%~dp0
set STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

echo.
echo Creando acceso directo en: %STARTUP_DIR%
echo.

REM Crear acceso directo usando PowerShell
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTUP_DIR%\DigiTurno-Kiosco.lnk'); $Shortcut.TargetPath = '%SCRIPT_DIR%iniciar-kiosco-chrome.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Description = 'DigiTurno - Iniciar Kiosco Automaticamente'; $Shortcut.Save()"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Auto-inicio configurado exitosamente!
    echo ========================================
    echo.
    echo El kiosco se iniciara automaticamente cada vez
    echo que se inicie Windows.
    echo.
    echo Para desactivar el auto-inicio, elimina el archivo:
    echo %STARTUP_DIR%\DigiTurno-Kiosco.lnk
    echo.
) else (
    echo.
    echo ERROR: No se pudo crear el acceso directo.
    echo.
    echo Intenta ejecutar este script como Administrador.
    echo.
)

pause
