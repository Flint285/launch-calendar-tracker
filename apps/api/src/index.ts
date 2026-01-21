import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import express from 'express';
import * as fs from 'fs';

// Load .env from monorepo root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../.env') });
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error.js';
import { authRouter } from './routes/auth.routes.js';
import { plansRouter } from './routes/plans.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/plans', plansRouter);

// Serve static frontend in production
if (isProduction) {
  const publicPath = join(__dirname, '../public');

  // Check if public directory exists
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));

    // SPA fallback - serve index.html for all non-API routes
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(join(publicPath, 'index.html'));
    });
  }
}

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
