const corsHeaders = (extra = {}) =>
  new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
    ...extra,
  });

const jsonResponse = (status, payload = {}, headers = {}) =>
  new Response(JSON.stringify(payload), { status, headers: corsHeaders(headers) });

const ensureJsonBody = async (request) => {
  try {
    return await request.json();
  } catch {
    throw new Error('INVALID_JSON');
  }
};

export default async function handler(request, context) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  let body;
  try {
    body = await ensureJsonBody(request);
  } catch (error) {
    const details = error.message === 'INVALID_JSON' ? 'Invalid JSON payload' : 'Unexpected error';
    return jsonResponse(400, { error: details });
  }

  const metadata = {
    invocationId: globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
    receivedAt: new Date().toISOString(),
    region: context?.geo?.city ?? 'unknown',
  };

  const instructions =
    body?.instructions ?? 'Provide AI-ready payload via `payload` and supply metadata as needed.';

  return jsonResponse(200, {
    status: 'ready',
    instructions,
    echo: body?.payload ?? null,
    metadata,
  });
}

