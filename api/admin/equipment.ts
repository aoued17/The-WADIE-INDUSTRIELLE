import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleAdminEquipment } from '../../server/handlers.js';
import { sendVercel, vercelContext } from '../../server/vercelAdapter.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  sendVercel(res, await handleAdminEquipment(req.method || 'GET', vercelContext(req)));
}
