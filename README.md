# DigiTurno - Frontend

Sistema de Turnos Digital desarrollado en React TypeScript para la gestión eficiente de turnos y servicios.

## 🚀 Características

- **Interfaz Moderna**: Diseño responsive y atractivo con gradientes y animaciones
- **Gestión de Turnos**: Crear, visualizar y gestionar turnos en tiempo real
- **Administración de Servicios**: Gestionar servicios disponibles
- **Estadísticas en Tiempo Real**: Métricas y reportes del sistema
- **API Integration**: Conecta con microservicios de Python
- **TypeScript**: Código tipado para mayor robustez

## 🛠️ Tecnologías Utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **React Router** - Navegación entre páginas
- **Axios** - Cliente HTTP para APIs
- **CSS3** - Estilos modernos con gradientes y animaciones

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/sloremart/DIGITURNOFRONTED.git
   cd DIGITURNOFRONTED
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear un archivo `.env` en la raíz del proyecto:
   ```env
   REACT_APP_API_URL=http://localhost:8000
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm start
   ```

La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Navbar.tsx      # Barra de navegación
│   └── Navbar.css      # Estilos del navbar
├── pages/              # Páginas principales
│   ├── Home.tsx        # Página de inicio
│   └── Home.css        # Estilos de la página home
├── services/           # Servicios de API
│   └── api.ts          # Configuración y métodos de API
├── types/              # Definiciones de tipos TypeScript
│   └── index.ts        # Interfaces y tipos
├── App.tsx             # Componente principal
├── App.css             # Estilos globales
└── index.tsx           # Punto de entrada
```

## 🔧 Configuración de la API

El frontend está configurado para conectarse con un microservicio de Python. Asegúrate de que tu backend esté ejecutándose en `http://localhost:8000` o configura la URL en las variables de entorno.

### Endpoints Esperados

- `GET /turnos` - Obtener todos los turnos
- `POST /turnos` - Crear nuevo turno
- `PUT /turnos/{id}` - Actualizar turno
- `GET /servicios` - Obtener servicios
- `GET /estadisticas` - Obtener estadísticas

## 🎨 Diseño

El sistema utiliza un diseño moderno con:
- Gradientes de color atractivos
- Animaciones suaves
- Diseño responsive
- Iconos emoji para mejor UX
- Cards con sombras y efectos hover

## 📱 Responsive Design

La aplicación es completamente responsive y se adapta a:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (480px - 767px)
- Small Mobile (< 480px)

## 🚀 Scripts Disponibles

- `npm start` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm test` - Ejecutar tests
- `npm run eject` - Eyectar configuración (irreversible)

## 🔗 Integración con Backend

El frontend está diseñado para trabajar con un microservicio de Python que debe proporcionar:

### Tipos de Datos Esperados

```typescript
interface Turno {
  id: number;
  numero: number;
  estado: 'pendiente' | 'en_atencion' | 'completado' | 'cancelado';
  servicio: string;
  fecha_creacion: string;
  fecha_atencion?: string;
  tiempo_espera?: number;
}

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  tiempo_promedio: number;
}
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**sloremart**
- GitHub: [@sloremart](https://github.com/sloremart)

## 🙏 Agradecimientos

- React Team por el framework
- TypeScript por el tipado estático
- La comunidad de desarrolladores por las herramientas y librerías

---

**DigiTurno** - Transformando la gestión de turnos con tecnología moderna 🎫 