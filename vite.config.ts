import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const normalizeUploadFileName = (fileName: string) =>
  {
    const extension = path.extname(fileName).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const baseName = path.basename(fileName, path.extname(fileName));
    const normalizedBase = baseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

    return `${normalizedBase || Date.now()}${extension || '.jpg'}`;
  };

const contentTypeByExtension = (fileName: string) => {
  const extension = path.extname(fileName).toLowerCase();

  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.gif') return 'image/gif';
  if (extension === '.svg') return 'image/svg+xml';

  return 'application/octet-stream';
};

const localUploadPlugin = () => ({
  name: 'inlux-local-upload',
  configureServer(server: any) {
    server.middlewares.use('/uploads', async (req: any, res: any, next: any) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        next();
        return;
      }

      const requestPath = decodeURIComponent(String(req.url || '').split('?')[0]);
      const fileName = path.basename(requestPath);

      if (!fileName) {
        next();
        return;
      }

      try {
        const uploadsDir = path.resolve(__dirname, 'public', 'uploads');
        const targetPath = path.join(uploadsDir, fileName);

        if (!targetPath.startsWith(uploadsDir)) {
          res.statusCode = 400;
          res.end('Invalid file path');
          return;
        }

        const file = await fs.readFile(targetPath);
        res.statusCode = 200;
        res.setHeader('Content-Type', contentTypeByExtension(fileName));
        res.setHeader('Cache-Control', 'no-store');
        if (req.method === 'HEAD') {
          res.end();
          return;
        }
        res.end(file);
      } catch {
        next();
      }
    });

    server.middlewares.use('/api/local-upload', async (req: any, res: any) => {
      if (req.method === 'DELETE') {
        const rawPath = String(req.headers['x-file-path'] || '').split('?')[0];
        const fileName = path.posix.basename(decodeURIComponent(rawPath));

        if (!rawPath.startsWith('/uploads/') || !fileName || fileName.includes('/') || fileName.includes('\\')) {
          res.statusCode = 400;
          res.end('Invalid upload path');
          return;
        }

        try {
          const uploadRoots = [
            path.resolve(__dirname, 'public', 'uploads'),
            path.resolve(__dirname, 'dist', 'uploads'),
          ];

          await Promise.all(uploadRoots.map(async (uploadsDir) => {
            const targetPath = path.join(uploadsDir, fileName);
            if (!targetPath.startsWith(uploadsDir)) return;
            await fs.rm(targetPath, { force: true });
          }));

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } catch (error) {
          server.config.logger.error(error);
          res.statusCode = 500;
          res.end('Delete failed');
        }
        return;
      }

      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method not allowed');
        return;
      }

      const rawFileName = String(req.headers['x-file-name'] || '');
      const fileName = normalizeUploadFileName(rawFileName);

      if (!fileName) {
        res.statusCode = 400;
        res.end('Missing file name');
        return;
      }

      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', async () => {
        try {
          const uploadsDir = path.resolve(__dirname, 'public', 'uploads');
          const targetPath = path.join(uploadsDir, fileName);

          if (!targetPath.startsWith(uploadsDir)) {
            res.statusCode = 400;
            res.end('Invalid file name');
            return;
          }

          await fs.mkdir(uploadsDir, { recursive: true });
          await fs.writeFile(targetPath, Buffer.concat(chunks));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ path: `/uploads/${fileName}` }));
        } catch (error) {
          server.config.logger.error(error);
          res.statusCode = 500;
          res.end('Upload failed');
        }
      });
    });
  },
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [localUploadPlugin(), react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ['**/data/**', '**/uploads/**'],
      },
    },
  };
});
