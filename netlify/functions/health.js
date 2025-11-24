const corsHeaders = (extra = {}) =>
  new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
    ...extra,
  });

const jsonResponse = (status, payload) =>
  new Response(JSON.stringify(payload), { status, headers: corsHeaders() });

export default async function handler(request, context) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== 'GET') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  return jsonResponse(200, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    region: context?.geo?.city ?? 'unknown',
  });
}

