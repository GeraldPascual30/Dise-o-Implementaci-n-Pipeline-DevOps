#!/usr/bin/env sh
set -eu

if [ -z "${APP_IMAGE:-}" ]; then
  echo "APP_IMAGE no esta definido"
  exit 1
fi

echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin
docker compose pull app
docker compose up -d
docker image prune -f
