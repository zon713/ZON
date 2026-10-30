import { appendFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// Diagnostic preload only: preserve the framework's requests, responses and
// exceptions. Never log headers, bodies, query strings or prerender secrets.
const reportFile = path.resolve('../evidence/static-export-request-diagnostics-20261017.jsonl');
writeFileSync(reportFile, JSON.stringify({ event: 'observer-started', atUtc: new Date().toISOString(), pid: process.pid }) + '\n');
function record(value) {
  appendFileSync(reportFile, JSON.stringify({ atUtc: new Date().toISOString(), ...value }) + '\n');
}
function errorDetails(error, depth = 0) {
  if (!error || depth > 5) return undefined;
  return {
    name: error.name, code: error.code, errno: error.errno,
    syscall: error.syscall, address: error.address, port: error.port,
    cause: errorDetails(error.cause, depth + 1),
    errors: Array.isArray(error.errors) ? error.errors.map(item => errorDetails(item, depth + 1)) : undefined,
  };
}
const originalFetch = globalThis.fetch;
globalThis.fetch = async function observedFetch(input, init) {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  const request = { origin: url.origin, pathname: url.pathname };
  try {
    const response = await originalFetch(input, init);
    record({ event: 'response', ...request, status: response.status, cacheControl: response.headers.get('cache-control') });
    return response;
  } catch (error) {
    record({ event: 'request-error', ...request, error: errorDetails(error) });
    throw error;
  }
};
process.on('exit', code => record({ event: 'observer-exit', code }));
