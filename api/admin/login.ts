import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleAdminLogin } from '../../server/handlers.js';
import { sendVercel, vercelContext } from '../../server/vercelAdapter.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }
  sendVercel(res, await handleAdminLogin(vercelContext(req)));
}
