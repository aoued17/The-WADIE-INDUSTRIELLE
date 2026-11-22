import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpdateBookingStatus } from '../../../server/handlers.js';
import { sendVercel, vercelContext } from '../../../server/vercelAdapter.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }
  const paramId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  sendVercel(res, await handleUpdateBookingStatus(vercelContext(req, paramId)));
}
