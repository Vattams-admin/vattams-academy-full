const SUPABASE_ORIGIN = 'https://nfcibyprftnowaiwlxxc.supabase.co';
const ALLOWED_PREFIXES = ['/rest/v1/', '/auth/v1/', '/functions/v1/', '/storage/v1/'];
const ALLOWED_ORIGIN = 'https://vattams.net';

function isAllowedPath(pathname: string): boolean {
  return ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function corsHeaders(request: Request): Headers {
  const headers = new Headers();
  const origin = request.headers.get('Origin');
  if (origin === ALLOWED_ORIGIN || origin === 'https://www.vattams.net' || origin?.startsWith('http://localhost:')) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  headers.set('Access-Control-Allow-Headers', 'Authorization, apikey, x-client-info, content-type, accept, range, x-upload-secret');
  headers.set('Access-Control-Expose-Headers', 'Content-Range, Range, Content-Length');
  return headers;
}

export const onRequest = async (context: any): Promise<Response> => {
  const request = context.request as Request;
  const incomingUrl = new URL(request.url);
  const upstreamPath = incomingUrl.pathname.replace(/^\/api\/supabase/, '') || '/';

  const headers = corsHeaders(request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (!isAllowedPath(upstreamPath)) {
    return new Response('Not Found', { status: 404, headers });
  }

  const upstreamUrl = `${SUPABASE_ORIGIN}${upstreamPath}${incomingUrl.search}`;
  const upstreamHeaders = new Headers(request.headers);

  // These are browser/transport-specific and should not be forwarded as-is.
  upstreamHeaders.delete('host');
  upstreamHeaders.delete('content-length');
  upstreamHeaders.delete('origin');
  upstreamHeaders.delete('referer');

  const init: RequestInit = {
    method: request.method,
    headers: upstreamHeaders,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, init);
    const responseHeaders = new Headers(upstreamResponse.headers);

    // Prevent auth/function responses from being cached at the edge/browser.
    if (upstreamPath.startsWith('/auth/v1/') || upstreamPath.startsWith('/functions/v1/')) {
      responseHeaders.set('Cache-Control', 'no-store');
    }

    for (const [key, value] of headers.entries()) {
      responseHeaders.set(key, value);
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[VATTAMS Supabase Proxy]', error);
    responseHeaders(headers, 'no-store');
    return new Response(JSON.stringify({ error: 'Backend connection failed. Please try again.' }), {
      status: 502,
      headers: new Headers({ ...Object.fromEntries(headers.entries()), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }),
    });
  }
};

function responseHeaders(headers: Headers, cacheControl: string) {
  headers.set('Cache-Control', cacheControl);
}
