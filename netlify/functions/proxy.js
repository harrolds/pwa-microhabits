const corsHeaders = (extra = {}) =>
  new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Content-Type': 'application/json; charset=utf-8',
    ...extra,
  });

const allowedMethods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

const jsonResponse = (status, payload = {}) =>
  new Response(JSON.stringify(payload), { status, headers: corsHeaders() });

const sanitizePath = (path = '/') => {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  if (path.includes('..')) {
    throw new Error('INVALID_PATH');
  }
  return path;
};

const forwardHeaders = (request) => {
  const sanitized = new Headers();
  const allowedHeaderNames = ['authorization', 'content-type', 'if-none-match'];
  request.headers.forEach((value, key) => {
    if (allowedHeaderNames.includes(key.toLowerCase())) {
      sanitized.set(key, value);
    }
  });
  return sanitized;
};

export default async function handler(request) {
  if (!allowedMethods.has(request.method)) {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const baseUrl = process.env.SAFE_PROXY_BASE_URL || process.env.VITE_SAFE_PROXY_BASE_URL;
  if (!baseUrl) {
    return jsonResponse(501, {
      error: 'SAFE_PROXY_BASE_URL missing',
      hint: 'Define SAFE_PROXY_BASE_URL environment variable.',
    });
  }

  const url = new URL(request.url);
  let targetPath;
  try {
    targetPath = sanitizePath(url.searchParams.get('path') || '/');
  } catch {
    return jsonResponse(400, { error: 'Unsafe proxy path rejected' });
  }

  const targetUrl = new URL(targetPath, baseUrl);
  const bodyRequired = !['GET', 'HEAD'].includes(request.method);
  let serializedBody;

  if (bodyRequired) {
    try {
      const jsonBody = await request.json();
      serializedBody = JSON.stringify(jsonBody);
    } catch {
      return jsonResponse(400, { error: 'Upstream calls require JSON payloads' });
    }
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders(request),
      body: serializedBody,
    });
  } catch (error) {
    return jsonResponse(502, { error: 'Upstream fetch failed', details: error.message });
  }

  const responsePayload = {
    status: upstreamResponse.status,
    ok: upstreamResponse.ok,
    target: targetUrl.pathname,
    data: null,
  };

  const contentType = upstreamResponse.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    responsePayload.data = await upstreamResponse.json();
  } else {
    responsePayload.data = await upstreamResponse.text();
  }

  return jsonResponse(upstreamResponse.status, responsePayload);
}

