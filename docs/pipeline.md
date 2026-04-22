# Documentacion del pipeline

## Resumen

El pipeline se divide en dos flujos:

- Integracion continua: valida calidad y funcionamiento en cada cambio.
- Entrega continua: genera imagen versionada y despliega si el entorno remoto esta configurado.

## Flujo CI

Archivo: `.github/workflows/ci.yml`

Etapas:

1. Checkout del codigo.
2. Instalacion de Node.js 20.
3. `npm ci`
4. `npm run lint`
5. `npm test`
6. `docker build`
7. Smoke test del contenedor levantado.

Objetivo:

- Evitar que cambios defectuosos lleguen a `main`.
- Garantizar que la imagen construye correctamente.
- Comprobar que la app arranca dentro del contenedor.

## Flujo CD

Archivo: `.github/workflows/cd.yml`

Etapas:

1. Login en GitHub Container Registry.
2. Generacion de metadata y tags.
3. Build y push de la imagen.
4. Despliegue remoto por SSH si existen secretos.

## Estrategia de ramas sugerida

- `main`: version estable o entregable.
- `develop`: integracion del equipo.
- `feature/*`: trabajo individual por componente.

## Politicas recomendadas

- Pull request obligatorio hacia `develop` o `main`.
- Revision por al menos un integrante.
- Pipeline CI obligatorio antes del merge.

## Secretos necesarios para CD

| Secreto | Uso |
|---|---|
| `DEPLOY_HOST` | IP o dominio del servidor |
| `DEPLOY_USER` | Usuario SSH |
| `DEPLOY_SSH_KEY` | Clave privada para despliegue |
| `DEPLOY_PATH` | Ruta del proyecto en el servidor |

## Evidencia para la presentacion

Capturas recomendadas:

- Workflow CI exitoso.
- Imagen publicada en GHCR.
- Logs del job de smoke test.
- Dashboard de Grafana con metricas y logs.
