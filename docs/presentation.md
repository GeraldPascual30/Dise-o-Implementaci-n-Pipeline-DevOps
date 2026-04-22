# Guion de presentacion

## Slide 1. Problema y objetivo

- Mostrar que el proyecto busca demostrar un pipeline DevOps completo.
- Explicar que se eligio una app simple para enfocar el esfuerzo en automatizacion y operacion.

## Slide 2. Arquitectura

- Frontend estatico.
- API Express.
- Persistencia SQLite.
- Observabilidad con Prometheus, Grafana, Loki y Alertmanager.

## Slide 3. Flujo de desarrollo

- GitHub como control de versiones.
- Ramas `feature`, `develop` y `main`.
- Pull requests con validacion automatica.

## Slide 4. CI

- Lint.
- Pruebas unitarias.
- Pruebas de integracion.
- Build de imagen Docker.
- Smoke test.

## Slide 5. CD

- Publicacion de imagen en GHCR.
- Despliegue remoto automatizado via SSH.
- Beneficio: reducir errores manuales.

## Slide 6. Docker

- Un `Dockerfile` para la app.
- Un `docker-compose.yml` para levantar app y stack de monitoreo.
- Beneficio: entorno reproducible.

## Slide 7. Monitoreo

- Logs centralizados con Loki.
- Metricas con Prometheus.
- Dashboard en Grafana.
- Alertas simples con Alertmanager.

## Slide 8. Demo en vivo

Secuencia sugerida:

1. Crear una tarea.
2. Cambiar su estado.
3. Mostrar el healthcheck.
4. Mostrar metricas en Prometheus.
5. Mostrar logs y dashboard en Grafana.
6. Enseñar el workflow exitoso en GitHub Actions.

## Slide 9. Desafios y soluciones

- Mantener bajo el alcance funcional.
- Integrar monitoreo sin volver complejo el proyecto.
- Garantizar que la app funcionara dentro de Docker y en CI.

## Slide 10. Lecciones aprendidas

- DevOps no es solo despliegue, tambien calidad y observabilidad.
- Automatizar temprano reduce retrabajo.
- Una app simple permite demostrar mejor las practicas del pipeline.
