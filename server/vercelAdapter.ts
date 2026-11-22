import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isRequestHttps } from '../server/auth.js';
import type { HandlerResult, RequestContext } from '../server/handlers.js';

export function vercelContext(req: VercelRequest, paramId?: string): RequestContext {
  const query: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(req.query || {})) {
    query[k] = Array.isArray(v) ? v[0] : v;
  }
  return {
    headers: req.headers,
    isHttps: isRequestHttps(req.headers),
    query,
    body: req.body,
    paramId,
  };
}

export function sendVercel(res: VercelResponse, result: HandlerResult) {
  if (result.headers) {
    for (const [k, v] of Object.entries(result.headers)) {
      res.setHeader(k, v);
    }
  }
  res.status(result.status).json(result.body);
}
