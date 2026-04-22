# Manual de operaciones

## Arranque de servicios

```bash
docker compose up --build -d
```

## Verificacion rapida

- Aplicacion: `GET /api/health`
- Metricas: `GET /api/metrics`
- Logs: consultar en Grafana o `docker compose logs app`

## Comandos utiles

```bash
docker compose ps
docker compose logs -f app
docker compose restart app
docker compose down
```

## Endpoints operativos

| Endpoint | Uso |
|---|---|
| `/api/health` | Estado general del servicio |
| `/api/metrics` | Metricas en formato Prometheus |
| `/api/alerts` | Receptor de alertas desde Alertmanager |

## Alertas configuradas

### `ApplicationDown`

- Disparo: la app deja de responder a Prometheus durante 1 minuto.
- Accion sugerida:
  - Revisar `docker compose ps`
  - Inspeccionar logs del contenedor `app`
  - Reiniciar el servicio si aplica

### `TaskBacklogHigh`

- Disparo: el backlog supera 15 tareas por mas de 2 minutos.
- Accion sugerida:
  - Revisar carga funcional
  - Cerrar tareas finalizadas
  - Confirmar que no haya fallos en el frontend que dupliquen registros

## Procedimiento de despliegue

1. Hacer merge a `main`.
2. Verificar ejecucion correcta del workflow `Continuous Delivery`.
3. Confirmar en el servidor:

   ```bash
   docker compose ps
   docker compose logs --tail=100 app
   ```

## Backup basico

La informacion vive en el volumen `app_data`. Para un respaldo simple:

```bash
docker run --rm -v app_data:/data -v ${PWD}:/backup alpine tar czf /backup/app_data_backup.tar.gz /data
```
