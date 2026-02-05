# FarmaProyect - Sistema de Gestión Farmacéutica

Sistema de intercomunicación entre médicos y proveedores de fármacos que permite gestionar y dar seguimiento a las recetas médicas de los pacientes.

## 📋 Descripción

FarmaProyect optimiza el flujo de información, gestion y envio de flujo de notificaciones entre las recetas de los pacientes :

- Facilitar la comunicación entre médicos y proveedores
- Visualizar el estado de las recetas en tiempo real
- Garantizar trazabilidad de la información médica
- Escalar fácilmente para futuras integraciones

## 🏗️ Componentes Principales

- **API REST** - Django + PostgreSQL
- **Panel de Administración** - PHP + Apache
- **Aplicación Web** - React + Vite
- **Reverse Proxy** - Traefik con SSL automático

## 🚀 Inicio Rápido

### Requisitos

- Docker & Docker Compose
- Git

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd FarmaProyect
   ```

2. **Configurar variables de entorno**
   ```bash
   cp backend/.env.example backend/.env
   cp backend/.db.env.example backend/.db.env
   ```

   Editar los archivos y cambiar:
   - `DJANGO_SECRET_KEY` → Generar clave única
   - `POSTGRES_PASSWORD` → Contraseña segura
   - `DJANGO_ALLOWED_HOSTS` → Tu dominio

3. **Crear infraestructura de Docker**
   ```bash
   docker network create main_net
   mkdir -p certs proxy
   touch certs/acme.json proxy/acme.json
   chmod 600 certs/acme.json proxy/acme.json
   ```

4. **Actualizar configuración**
   - En `docker-compose.yml`: cambiar dominio
   - En `proxy/config.yml`: cambiar email para Let's Encrypt

5. **Iniciar servicios**
   ```bash
   docker compose up -d --build
   ```

6. **Configurar base de datos**
   ```bash
   docker compose exec backend python manage.py migrate
   docker compose exec backend python manage.py createsuperuser
   ```

## 🌐 Acceso

- **API**: `https://tu-dominio.com/api/`
- **Panel**: `https://tu-dominio.com/panel/`
- **App Web**: `https://tu-dominio.com/app/`

## 📁 Estructura

```
project/
├── backend/            # API REST
├── frontend/           # Aplicación Web
├── admin/              # Panel Admin
├── proxy/              # Reverse Proxy Config
├── docker-compose.yml  # Orquestación
└── README.md           # Este archivo
```

## 🛠️ Comandos Útiles

### General
```bash
# Ver logs
docker compose logs -f

# Ver logs de un servicio
docker compose logs -f backend

# Detener servicios
docker compose down
```

### Backend
```bash
# Ejecutar migraciones
docker compose exec backend python manage.py migrate

# Crear superusuario
docker compose exec backend python manage.py createsuperuser
```

### Base de Datos
```bash
# Backup
docker compose exec db pg_dump -U app app > backup.sql

# Restaurar
docker compose exec -T db psql -U app app < backup.sql
```

## 📦 Tecnologías

- Backend: Django 5.1 + DRF
- Frontend: React 19 + Vite 7
- Base de Datos: PostgreSQL 16
- Proxy: Traefik v3.6
- Orquestación: Docker Compose