# Dockerfile multi-stage para el frontend de Digiturno
# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
# Instalar herramientas necesarias para node-gyp (usb)
RUN apk add --no-cache python3 make g++ pkgconfig linux-headers libusb-dev eudev-dev

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci --legacy-peer-deps

# Copiar el código fuente
COPY . .

# Variables de entorno para el build
# IMPORTANTE: Este ARG debe ser pasado desde docker-compose.yml
# Valor por defecto para producción (puede ser sobrescrito desde docker-compose.yml)
ARG REACT_APP_API_URL=http://192.168.1.211:8010
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Debug: Verificar que la variable se está pasando correctamente durante el build
RUN echo "🔧 [DOCKER BUILD] REACT_APP_API_URL configurada: $REACT_APP_API_URL"

# Construir la aplicación para producción
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copiar archivos construidos desde el stage de build
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
