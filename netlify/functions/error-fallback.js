const corsHeaders = (extra = {}) =>
  new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
    ...extra,
  });

const jsonResponse = (status, payload = {}) =>
  new Response(JSON.stringify(payload), { status, headers: corsHeaders() });

export default async function handler(request, context) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  return jsonResponse(500, {
    status: 'error',
    message: 'A non-recoverable error occurred. Please retry or inspect logs.',
    traceId: context?.requestId ?? globalThis.crypto?.randomUUID?.() ?? 'unknown',
    timestamp: new Date().toISOString(),
  });
}

