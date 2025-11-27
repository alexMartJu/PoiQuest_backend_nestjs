# PoiQuest Backend - NestJS

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## 📋 Descripción

Backend de **PoiQuest**, una aplicación interactiva de exploración de puntos de interés (POIs) con gamificación. Este proyecto está construido con NestJS, TypeScript y TypeORM, siguiendo una arquitectura hexagonal (Domain-Driven Design) para garantizar escalabilidad y mantenibilidad.

## ✨ Características Principales

- 🔐 **Autenticación y Autorización** - Sistema completo con JWT y roles de usuario
- 📍 **Gestión de POIs** - CRUD de puntos de interés con geolocalización
- 🎯 **Sistema de Eventos** - Creación y gestión de eventos con categorías
- 🏆 **Logros y Gamificación** - Sistema de achievements y escaneos QR
- 👤 **Perfiles de Usuario** - Gestión completa de perfiles personalizados
- 📸 **Gestión de Media** - Upload y manejo de imágenes
- 🎫 **Sistema de Tickets** - Gestión de entradas para eventos
- 🚨 **Sistema de Incidencias** - Reporte y seguimiento de problemas
- 📢 **Notificaciones** - Sistema de notificaciones para usuarios
- 🛣️ **Rutas** - Creación y gestión de rutas turísticas

## 🏗️ Arquitectura

El proyecto sigue una Clean Architecture organizada en capas:

```
src/
├── auth/                 # Módulo de autenticación
│   ├── application/     # Casos de uso y DTOs
│   ├── domain/          # Entidades y repositorios
│   ├── infrastructure/  # Implementaciones y decoradores
│   └── presentation/    # Controladores y mappers
├── events/              # Módulo de eventos
├── media/               # Módulo de gestión multimedia
├── profile/             # Módulo de perfiles
├── users/               # Módulo de usuarios
├── entities/            # Entidades compartidas
├── shared/              # Recursos compartidos (DTOs, errors, filters)
└── data/                # Datos de seed
```

## 🚀 Tecnologías

- **Framework**: NestJS 11.x
- **Lenguaje**: TypeScript
- **ORM**: TypeORM 0.3.x
- **Base de Datos**: MySQL - MariaDB
- **Autenticación**: JWT + Passport
- **Validación**: class-validator & class-transformer
- **Documentación API**: Swagger
- **Containerización**: Docker & Docker Compose

## 📦 Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Docker y Docker Compose (para desarrollo con contenedores)

### Configuración del Proyecto

1. **Clonar el repositorio**
```bash
git clone https://github.com/alexMartJu/PoiQuest_backend_nestjs.git
cd PoiQuest_backend_nestjs
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Copiar el archivo `.env.example` a `.env` y configurar las variables:

```bash
cp .env.example .env
```

Luego editar `.env` con tus valores reales:

```env
# General
TZ=Europe/Madrid

# Webserver (NestJS)
WEB_SERVER_PORT=8000

# Database (MariaDB)
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=poiquest
DB_ROOT_PASSWORD=your_root_password

# Node environment
NODE_ENV=development

# JWT keys (usar claves largas y aleatorias en producción)
POIQUEST_JWT_ACCESS_KEY=your_strong_access_key
POIQUEST_JWT_REFRESH_KEY=your_strong_refresh_key
POIQUEST_JWT_ACCESS_TTL=1h
POIQUEST_JWT_REFRESH_TTL=7d
```

> ⚠️ **Importante**: No subas el archivo `.env` al repositorio. Mantén tus secretos seguros.

4. **Iniciar la base de datos con Docker**
```bash
docker-compose up -d
```

## 🏃‍♂️ Ejecución del Proyecto

### Modo Desarrollo
```bash
# Iniciar en modo watch
npm run start:dev

# Iniciar con debug
npm run start:debug
```

### Modo Producción
```bash
# Compilar el proyecto
npm run build

# Ejecutar en producción
npm run start:prod
```

### Ejecutar Seeds
```bash
# Poblar la base de datos con datos de prueba
npm run seed
```

## 🧪 Tests

```bash
# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Tests e2e
npm run test:e2e

# Cobertura de tests
npm run test:cov
```

## 📚 Documentación API

Una vez iniciado el servidor, la documentación interactiva de Swagger estará disponible en:

```
http://localhost:8000/docs
```

## 🔑 Endpoints Principales

### Autenticación
- `POST /auth/register-standard-user` - Registro de usuarios
- `POST /auth/login` - Login
- `GET /auth/me` - Obtener perfil actual (requiere autenticación)
- `POST /auth/refresh` - Generar nuevo access token (requiere autenticación)

### Eventos
- `GET /events` - Listar eventos
- `POST /events` - Crear evento (admin)
- `GET /events/:uuid` - Obtener evento activo por UUID
- `PATCH /events/:uuid` - Actualizar un evento por UUID (admin)
- `DELETE /events/:uuid` - Eliminar evento por UUID (admin)

### Usuarios
- `GET /users` - Listar usuarios (admin)
- `GET /users/active` - Obtener usuarios con status active
- `PATCH /users/profile/:profileUuid/disable` - Deshabilitar una cuenta por UUID

### Perfiles
- `GET /profile/me` - Obtener perfil del usuario autenticado
- `PATCH /profile/me` - Actualizar perfil

## 🐳 Docker

El proyecto incluye configuración de Docker para facilitar el desarrollo:

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reconstruir contenedores
docker-compose up -d --build
```

## 📁 Estructura de Módulos

Cada módulo sigue el patrón de Clean Architecture:

- **Application**: Servicios y DTOs de entrada
- **Domain**: Entidades, interfaces de repositorios y lógica de negocio
- **Infrastructure**: Implementaciones concretas (repositories, decorators, guards)
- **Presentation**: Controladores, DTOs de salida y mappers

## 🛠️ Scripts Disponibles

```bash
npm run build          # Compilar proyecto
npm run format         # Formatear código con Prettier
npm run lint           # Ejecutar linter
npm run start          # Iniciar aplicación
npm run start:dev      # Iniciar en modo desarrollo
npm run start:prod     # Iniciar en modo producción
npm run seed           # Ejecutar seeds de base de datos
npm run test           # Ejecutar tests unitarios
npm run test:e2e       # Ejecutar tests e2e
npm run test:cov       # Generar reporte de cobertura
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request


## 👨‍💻 Autor

**Alex Martínez Juan**
- GitHub: [@alexMartJu](https://github.com/alexMartJu)

## 🙏 Agradecimientos

- [NestJS](https://nestjs.com/) - El framework utilizado
- [TypeORM](https://typeorm.io/) - ORM para TypeScript
- Comunidad de código abierto

---

⭐ Si este proyecto te ha sido útil, ¡considera darle una estrella en GitHub!
