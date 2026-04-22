# Guia de instalacion

## Requisitos previos

- Node.js 20 o superior
- npm 10 o superior
- Docker Desktop y Docker Compose
- Git

## Instalacion local

1. Clonar el repositorio:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd devops-task-board
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Crear archivo `.env` a partir de `.env.example`.

4. Ejecutar la aplicacion:

   ```bash
   npm run dev
   ```

5. Validar funcionamiento:

   ```bash
   npm run lint
   npm test
   ```

## Instalacion con contenedores

1. Construir e iniciar los servicios:

   ```bash
   docker compose up --build
   ```

2. Verificar que los contenedores esten activos:

   ```bash
   docker compose ps
   ```

3. Detener el entorno:

   ```bash
   docker compose down
   ```

## Variables de entorno

| Variable | Descripcion | Valor por defecto |
|---|---|---|
| `PORT` | Puerto HTTP de la aplicacion | `3000` |
| `HOST` | Host de escucha | `0.0.0.0` |
| `DB_FILE` | Ruta del archivo SQLite | `./data/app.sqlite` |
| `LOG_LEVEL` | Nivel de logs | `info` |
| `SERVICE_NAME` | Nombre del servicio | `devops-task-board` |

## Resolucion de problemas

- Si `npm install` falla, verificar la version de Node.js.
- Si Docker no inicia Promtail en Windows, revisar que Docker Desktop este usando contenedores Linux.
- Si Grafana no muestra datos, esperar 20-30 segundos para que Prometheus haga el primer scrape.
