# Video para Pantalla de Sala de Espera

## Ubicación del Video

Coloca tu video en esta carpeta (`public/videos/`) con uno de estos nombres:

- `sala-espera.mp4` (recomendado - formato más compatible)
- `sala-espera.webm` (alternativa - mejor compresión)

## Especificaciones Recomendadas

Para una mejor experiencia en TV:

- **Formato**: MP4 (H.264) o WebM
- **Resolución**: 1920x1080 (Full HD) o 1280x720 (HD)
- **Duración**: Recomendado entre 30 segundos y 5 minutos (se reproducirá en loop)
- **Tamaño de archivo**: Intenta mantenerlo bajo 50MB para mejor rendimiento
- **Aspecto**: 16:9 (widescreen) es ideal para TVs

## Configuración del Video

El video se reproducirá automáticamente:
- ✅ En loop (se repite continuamente)
- ✅ Sin sonido (muted) para no interferir con las notificaciones
- ✅ Reproducción automática al cargar la página

## Ejemplo de Comando para Convertir Video

Si necesitas convertir un video a MP4:

```bash
# Usando ffmpeg (si lo tienes instalado)
ffmpeg -i tu_video_original.mp4 -c:v libx264 -crf 23 -c:a aac -b:a 128k -movflags +faststart sala-espera.mp4
```

## Notas

- El video se mostrará en la columna derecha de la pantalla de sala de espera
- En pantallas pequeñas (móviles/tablets), el video aparecerá arriba de los turnos
- Si no hay video, simplemente no se mostrará (no causará errores)

