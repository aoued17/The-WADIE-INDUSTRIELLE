import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isRequestHttps } from './server/auth.js';
import {
  handleAdminEquipment,
  handleAdminLogin,
  handleAdminLogout,
  handleAdminProjects,
  handleAdminServices,
  handleCreateBooking,
  handleGetAdminBookings,
  handleGetAdminSession,
  handleHealth,
  handlePublicCatalog,
  handleSeedCatalogInDb,
  handleUpdateBookingStatus,
  type HandlerResult,
} from './server/handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sendResult(res: Response, result: HandlerResult) {
  if (result.headers) {
    for (const [k, v] of Object.entries(result.headers)) {
      res.setHeader(k, v);
    }
  }
  res.status(result.status).json(result.body);
}

function buildCtx(req: Request) {
  const query: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(req.query)) {
    if (typeof v === 'string') query[k] = v;
  }
  return {
    headers: req.headers,
    isHttps: req.secure || isRequestHttps(req.headers),
    query,
    body: req.body,
    paramId: req.params.id,
  };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', async (_req, res) => {
    sendResult(res, await handleHealth());
  });

  app.get('/api/catalog', async (_req, res) => {
    sendResult(res, await handlePublicCatalog());
  });

  app.post('/api/bookings', async (req, res) => {
    sendResult(res, await handleCreateBooking(buildCtx(req)));
  });

  app.post('/api/admin/login', async (req, res) => {
    sendResult(res, await handleAdminLogin(buildCtx(req)));
  });

  app.post('/api/admin/logout', async (req, res) => {
    sendResult(res, await handleAdminLogout(buildCtx(req)));
  });

  app.get('/api/admin/session', async (req, res) => {
    sendResult(res, await handleGetAdminSession(buildCtx(req)));
  });

  app.get('/api/admin/bookings', async (req, res) => {
    sendResult(res, await handleGetAdminBookings(buildCtx(req)));
  });

  app.patch('/api/admin/bookings/:id', async (req, res) => {
    sendResult(res, await handleUpdateBookingStatus(buildCtx(req)));
  });

  app.post('/api/admin/seed', async (req, res) => {
    sendResult(res, await handleSeedCatalogInDb(buildCtx(req)));
  });

  app.all('/api/admin/services', async (req, res) => {
    sendResult(res, await handleAdminServices(req.method, buildCtx(req)));
  });

  app.all('/api/admin/equipment', async (req, res) => {
    sendResult(res, await handleAdminEquipment(req.method, buildCtx(req)));
  });

  app.all('/api/admin/projects', async (req, res) => {
    sendResult(res, await handleAdminProjects(req.method, buildCtx(req)));
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found. Run npm run build.');
      }
    });
  }

  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WADIE INDUSTRIELLE server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
