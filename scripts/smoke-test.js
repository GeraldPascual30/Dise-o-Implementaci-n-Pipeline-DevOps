const baseUrl = process.env.SMOKE_URL || 'http://127.0.0.1:3000';

async function main() {
  const [healthResponse, metricsResponse] = await Promise.all([
    fetch(`${baseUrl}/api/health`),
    fetch(`${baseUrl}/api/metrics`)
  ]);

  if (!healthResponse.ok) {
    throw new Error(`Healthcheck fallo con codigo ${healthResponse.status}`);
  }

  if (!metricsResponse.ok) {
    throw new Error(`Endpoint de metricas fallo con codigo ${metricsResponse.status}`);
  }

  const health = await healthResponse.json();
  console.log(`Smoke test exitoso: ${health.status}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
