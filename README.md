# PoiQuest — Backend API

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-v11-E0234E?style=flat-square&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeORM-0.3.x-FE0902?style=flat-square" />
  <img src="https://img.shields.io/badge/MariaDB-11.4-003545?style=flat-square&logo=mariadb&logoColor=white" />
  <img src="https://img.shields.io/badge/MinIO-Object%20Storage-C72E49?style=flat-square&logo=minio&logoColor=white" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Licencia-MIT-green?style=flat-square" />
</p>

<p align="center">
  <i>Explora, escanea y descubre experiencias culturales únicas.</i>
</p>

---

API REST del backend de **PoiQuest**, una plataforma multiplataforma de eventos culturales donde los usuarios exploran puntos de interés mediante escaneo QR, visualización en realidad aumentada y un sistema de gamificación con niveles y logros. Construido con **NestJS**, **TypeScript** y **Clean Architecture**.

> Este repositorio da servicio a dos aplicaciones cliente: la [app móvil de usuario/validadores (Flutter)](https://github.com/alexMartJu/PoiQuest_frontend_flutter) y la [app de administración (React Native + Expo)](https://github.com/alexMartJu/PoiQuest_frontend_admin_reactnative).

---

## Motivación

Los eventos culturales tradicionales no integran tecnología: el asistente llega, observa y se va. No hay incentivo para volver, no hay interacción con el espacio y no hay forma de medir la participación real. PoiQuest resuelve esto desde el backend: una API que conecta la compra de entradas, la validación de acceso, la exploración mediante QR y un motor de gamificación en tiempo real, todo en un solo sistema.

---

## Índice

- [¿Qué hace este proyecto?](#qué-hace-este-proyecto)
- [Características principales](#características-principales)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [Documentación de la API](#documentación-de-la-api)
- [Módulos](#módulos)
- [Contribución](#contribución)
- [Licencia](#licencia)
- [Autor](#autor)

---

## ¿Qué hace este proyecto?

PoiQuest transforma la forma en que los usuarios interactúan con los eventos culturales. En lugar de ser un espectador pasivo, el usuario:

1. **Compra o reserva una entrada** para un evento cultural (gratuito o de pago vía Stripe).
2. **El día del evento**, presenta su QR en la entrada para que un validador lo marque como utilizado.
3. **Explora el evento** escaneando los puntos de interés (POIs) que lo componen, siguiendo rutas predefinidas.
4. **Desbloquea logros y sube de nivel** automáticamente según su actividad: escaneos, rutas completadas y asistencia a eventos premium.

El backend gestiona toda esta lógica de negocio, garantizando que los escaneos sean válidos (ticket correcto, fecha correcta, POI perteneciente al evento), que los logros se evalúen en tiempo real y que los pagos con Stripe queden correctamente confirmados.

---

## Características principales

- **Autenticación JWT** — Access token + refresh token con blacklist de tokens al cerrar sesión.
- **Gestión de eventos culturales** — CRUD completo de eventos, categorías, rutas y puntos de interés.
- **Exploración con escaneo QR** — El escaneo valida: ticket activo, fecha de visita coincidente, POI perteneciente al evento y que no haya sido escaneado ya. Si todo es correcto, persiste el escaneo y dispara el motor de gamificación.
- **Gamificación automática** — Al finalizar cada escaneo se evalúa si el usuario ha superado el umbral de algún logro; si es así, se desbloquea y se recalcula su nivel.
- **Pagos con Stripe** — Flujo completo de `PaymentIntent`, confirmación y tickets gratuitos sin necesidad de pago.
- **Validación de tickets** — Panel para validadores en el acceso al evento; genera historial de validaciones.
- **Almacenamiento de objetos con MinIO** — Generación de URLs prefirmadas y asociación polimórfica de imágenes a cualquier entidad (evento, POI, perfil…).
- **Notificaciones** — Sistema de notificaciones con programador que envía recordatorios diarios a los usuarios con eventos ese día.
- **Partners** — Gestión de ciudades, organizadores y patrocinadores con paginación por cursor.
- **Analytics** — Endpoints de estadísticas de uso y participación.
- **Manejo global de errores** — `GlobalExceptionFilter` centralizado que devuelve siempre la misma forma de error al cliente, independientemente de la capa que lance la excepción.
- **Swagger / OpenAPI** — Documentación interactiva autogenerada disponible en desarrollo.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | NestJS 11 + Node.js |
| Lenguaje | TypeScript 5 |
| ORM | TypeORM 0.3 |
| Base de datos | MariaDB 11.4 |
| Almacenamiento | MinIO |
| Pagos | Stripe |
| Autenticación | JWT (Passport) + bcryptjs |
| Validación | class-validator / class-transformer |
| Docs API | Swagger / OpenAPI 3 |
| Contenedores | Docker & Docker Compose |
| Gestor de procesos | PM2 |

---

## Arquitectura

El proyecto implementa **Clean Architecture**, dividiendo cada módulo en cuatro capas con dependencias unidireccionales hacia el interior:

| Capa | Responsabilidad |
|---|---|
| **Presentation** | Controllers · DTOs de Request/Response · Mappers |
| **Application** | Services · DTOs internos |
| **Infrastructure** | Repositorios TypeORM · Guards JWT · Decoradores |
| **Domain** | Entidades · Repositorios abstractos · Enums |

**Domain** contiene la lógica de negocio pura, sin ninguna dependencia de framework. Define las entidades TypeORM, los repositorios como contratos abstractos y las enumeraciones de estado.

**Application** orquesta el dominio a través de servicios: valida reglas de negocio, coordina repositorios y delega efectos secundarios (gamificación, notificaciones). Sus DTOs internos mantienen a la capa de presentación desacoplada.

**Infrastructure** implementa los contratos del dominio con TypeORM, y registra los guards JWT y el decorador `@CurrentUser()` que extrae el usuario autenticado del token en cada petición.

**Presentation** es la única capa que conoce HTTP. Los DTOs de request se validan automáticamente mediante `class-validator` (pipe global `ValidationPipe`). Los mappers transforman entidades en DTOs de respuesta listos para el cliente.

Un `GlobalExceptionFilter` registrado en el bootstrap intercepta cualquier excepción lanzada desde cualquier capa y devuelve siempre una respuesta estructurada y consistente.

---

## Estructura del proyecto

```
src/
├── analytics/           # Estadísticas de uso y participación
├── auth/                # Autenticación JWT, blacklist de tokens
├── events/              # Eventos, categorías, rutas y POIs
├── explore/             # Validación de escaneos QR e historial de exploración
├── gamification/        # Logros, niveles y progreso del usuario
├── media/               # Gestión de imágenes y URLs prefirmadas (MinIO)
├── minio-client/        # Wrapper del cliente MinIO
├── notifications/       # Notificaciones y programador de recordatorios diarios
├── partners/            # Ciudades, organizadores y patrocinadores
├── payments/            # Flujo de pago con Stripe y creación de tickets
├── profile/             # Perfil, avatar y estadísticas de gamificación
├── shared/              # Errores de dominio, filtro global y DTOs comunes
├── ticket-validation/   # Validación QR en la entrada al evento
├── users/               # Gestión de usuarios y roles
├── data/                # Datos de seed (logros, ciudades, niveles…)
└── main.ts              # Bootstrap: Swagger, pipes globales, filtro de excepciones
```

Todos los módulos comparten la misma estructura interna:

```
<módulo>/
├── application/
│   ├── dto/             # DTOs internos entre capas
│   └── services/        # Lógica de negocio y orquestación
├── domain/
│   ├── entities/        # Entidades TypeORM
│   ├── enums/           # Enumeraciones del dominio
│   └── repositories/    # Interfaces abstractas de repositorio
├── infrastructure/
│   └── persistence/
│       └── typeorm/     # Implementaciones concretas con TypeORM
└── presentation/
    ├── controllers/     # Controladores NestJS
    ├── dto/             # DTOs de request y response
    └── mappers/         # Entidad → DTO de respuesta
```

---

## Puesta en marcha

### Requisitos previos

- **Docker** y **Docker Compose** — todos los servicios corren en contenedores.

### 1. Clonar el repositorio

```bash
git clone https://github.com/alexMartJu/PoiQuest_backend_nestjs.git
cd PoiQuest_backend_nestjs
```

### 2. Crear el fichero de entorno

```bash
cp .env.example .env
```

Completa todos los valores descritos en [Variables de entorno](#-variables-de-entorno).

### 3. Levantar todos los servicios

```bash
docker compose up -d --build
```

Se arrancan cuatro contenedores:

| Contenedor | Rol | Puerto por defecto |
|---|---|---|
| `poiquest-nestjs` | API NestJS gestionada con PM2 | `WEB_SERVER_PORT` → 3000 |
| `poiquest-mariadb` | Base de datos MariaDB 11.4 | `DB_PORT` → 3306 |
| `poiquest-phpmyadmin` | Interfaz visual de la base de datos | 8081 |
| `poiquest-minio` | Almacenamiento de objetos | 9000 (API) · 9001 (Consola) |

### 4. Poblar la base de datos

```bash
npm run seed
```

> Se ejecuta dentro del contenedor `webserver` mediante `docker compose exec`.

### 5. Verificar que todo está activo

```bash
docker compose logs -f webserver
```

La API está lista cuando aparece el mensaje `Swagger habilitado en /docs` (en desarrollo).

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `TZ` | Zona horaria del servidor (p. ej. `Europe/Madrid`) |
| `WEB_SERVER_PORT` | Puerto expuesto por el contenedor NestJS |
| `NODE_ENV` | `development` o `production` — deshabilita Swagger en producción |
| `DB_HOST` | Hostname de MariaDB (`database` dentro de Docker) |
| `DB_PORT` | Puerto de MariaDB |
| `DB_USER` | Usuario de la base de datos |
| `DB_PASSWORD` | Contraseña del usuario |
| `DB_DATABASE` | Nombre de la base de datos |
| `DB_ROOT_PASSWORD` | Contraseña de root de MariaDB |
| `MINIO_ENDPOINT` | Hostname o IP de MinIO |
| `MINIO_PORT` | Puerto API de MinIO |
| `MINIO_USE_SSL` | `true` / `false` |
| `MINIO_ACCESS_KEY` | Clave de acceso de MinIO |
| `MINIO_SECRET_KEY` | Clave secreta de MinIO |
| `POIQUEST_JWT_ACCESS_KEY` | Secreto del access token JWT |
| `POIQUEST_JWT_REFRESH_KEY` | Secreto del refresh token JWT |
| `POIQUEST_JWT_ACCESS_TTL` | TTL del access token (p. ej. `15m`) |
| `POIQUEST_JWT_REFRESH_TTL` | TTL del refresh token (p. ej. `7d`) |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe |

> No subas nunca el fichero `.env` al repositorio.

---

## Documentación de la API

Swagger UI disponible **solo en desarrollo** en:

```
http://localhost:<WEB_SERVER_PORT>/docs
```

Todos los endpoints protegidos requieren un Bearer JWT. Usa el botón **Authorize** de Swagger para configurarlo globalmente y probar cualquier endpoint de forma interactiva.

---

## Módulos

| Módulo | Responsabilidad |
|---|---|
| `auth` | Registro, login, logout, refresco de token y guards JWT |
| `users` | CRUD de usuarios, asignación de roles, gestión de estado de cuenta |
| `profile` | Actualización de perfil, avatar y estadísticas de gamificación |
| `events` | CRUD de eventos, categorías, rutas y puntos de interés |
| `explore` | Validación de escaneos QR (ticket, fecha, POI) y disparo de gamificación |
| `gamification` | Desbloqueo automático de logros y cálculo de nivel del usuario |
| `payments` | Flujo de `PaymentIntent` con Stripe, confirmación y tickets gratuitos |
| `ticket-validation` | Validación QR presencial en la entrada al evento e historial |
| `notifications` | Entrega de notificaciones y recordatorios diarios programados |
| `partners` | Ciudades, organizadores y patrocinadores con paginación por cursor |
| `media` | URLs prefirmadas y asociación polimórfica de imágenes vía MinIO |
| `analytics` | Estadísticas de participación y uso de la plataforma |

---

## Contribución

Las contribuciones son bienvenidas. Para proponer cambios:

1. Haz un fork del repositorio.
2. Crea una rama descriptiva: `git checkout -b feature/nombre-de-la-feature`.
3. Realiza tus cambios y asegúrate de que el proyecto compila sin errores: `npm run build`.
4. Verifica el linting: `npm run lint`.
5. Haz commit con un mensaje claro: `git commit -m 'feat: descripción del cambio'`.
6. Abre un Pull Request detallando qué cambia y por qué.

---

## Licencia

Este proyecto está licenciado bajo la [MIT License](LICENSE).

---

## Autor

**Alex Martínez Juan** · [@alexMartJu](https://github.com/alexMartJu)

