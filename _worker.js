const FUNCTION_NAMES = [
  'admin-customer','ai-admin-actions','ai-admin-insights','ai-assistant','ai-product-studio','ai-visual-search',
  'auto-banner','backup-export','banner-admin','create-checkout','create-order','customer-profile','delivery-action',
  'delivery-partner-admin','fraud-check','restore-backup','send-feedback','send-push','send-whatsapp','subscribe-push',
  'vapid-public-key','verify-checkout','verify-payment','wallet-checkout','whatsapp-health'
];

let handlersPromise;
async function getHandlers() {
  if (!handlersPromise) {
    handlersPromise = Promise.all(FUNCTION_NAMES.map(async name => {
      const mod = await import(`./netlify/functions/${name}.js`);
      return [name, mod.handler];
    })).then(entries => new Map(entries));
  }
  return handlersPromise;
}

function syncProcessEnv(env) {
  const g = globalThis;
  if (!g.process) g.process = { env: {} };
  if (!g.process.env) g.process.env = {};
  const keys = [
    'SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_SECRET_KEY',
    'RAZORPAY_KEY_ID','RAZORPAY_KEY_SECRET','OPENAI_API_KEY','OPENAI_MODEL',
    'AI_API_URL','AI_API_KEY','VAPID_PRIVATE_KEY','VAPID_PUBLIC_KEY','VAPID_SUBJECT',
    'WHATSAPP_ACCESS_TOKEN','WHATSAPP_GRAPH_VERSION','WHATSAPP_GROUP_ID',
    'WHATSAPP_PHONE_NUMBER_ID','WHATSAPP_TEMPLATE_LANG','WHATSAPP_TEMPLATE_NAME',
    'ADMIN_EMAILS','FEEDBACK_FORM_URL'
  ];
  for (const key of keys) {
    if (env[key] !== undefined) g.process.env[key] = String(env[key]);
  }
}

function toEvent(request) {
  const headers = {};
  request.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });
  return request.text().then(body => ({
    httpMethod: request.method,
    headers,
    body: body || null,
    isBase64Encoded: false,
    path: new URL(request.url).pathname,
    queryStringParameters: Object.fromEntries(new URL(request.url).searchParams.entries())
  }));
}

function fromResult(result) {
  const status = Number(result?.statusCode) || 200;
  const headers = new Headers(result?.headers || {});
  headers.set('Cache-Control', 'no-store');
  let body = result?.body ?? '';
  if (result?.isBase64Encoded) {
    const binary = Uint8Array.from(atob(body), c => c.charCodeAt(0));
    return new Response(binary, { status, headers });
  }
  return new Response(body, { status, headers });
}

function withSafeHeaders(response, pathname) {
  const headers = new Headers(response.headers);
  if (pathname.endsWith('.html') || pathname.endsWith('/sw.js') || pathname.endsWith('/admin-sw.js') || pathname.endsWith('/delivery-sw.js') || pathname.endsWith('/app-version.json')) {
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  }
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    syncProcessEnv(env);

    if (url.pathname.startsWith('/.netlify/functions/')) {
      const name = url.pathname.slice('/.netlify/functions/'.length).replace(/\/$/, '');
      const handlers = await getHandlers();
      const handler = handlers.get(name);
      if (!handler) return Response.json({ error: 'Function not found' }, { status: 404 });
      try {
        const event = await toEvent(request);
        const result = await handler(event, {});
        return fromResult(result);
      } catch (error) {
        console.error(name, error);
        return Response.json({ error: 'Internal server error', code: 'WORKER_FUNCTION_ERROR' }, { status: 500 });
      }
    }

    const assetResponse = await env.ASSETS.fetch(request);
    return withSafeHeaders(assetResponse, url.pathname);
  }
};
