import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { router as apiRouter } from './server/routes.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const port = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  // Support JSON payloads up to 50mb for image uploads and base64 canvases
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Register all backend API routes
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'OM GIO AI CREATIVE DIRECTOR', time: new Date().toISOString() });
  });

  if (!isProd) {
    // Development mode: Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve pre-built static assets from dist
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`  🎬 OM GIO AI CREATIVE DIRECTOR - Server Running`);
    console.log(`  🌐 Port: ${port} | Host: 0.0.0.0`);
    console.log(`  ✨ Mode: ${isProd ? 'Production' : 'Development (Vite SSR Middleware)'}`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
