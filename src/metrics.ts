import client from 'prom-client';

// Enable collection of default metrics (CPU, memory, etc.)
client.collectDefaultMetrics();

// Create a histogram metric for HTTP request duration
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10]
});

// Export the Prometheus register
export const register = client.register;
