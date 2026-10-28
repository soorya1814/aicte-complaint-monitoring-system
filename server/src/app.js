import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { getDBStatus } from './config/db.js';
import { setupSwagger } from './config/swagger.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import institutionRoutes from './routes/institutionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { exportComplaintsCSV } from './controllers/complaintController.js';
import { protect } from './middleware/auth.js';

export const createApp = () => {
  const app = express();

  // 1. Security & Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI to load resources
    })
  );

  // 2. CORS configuration
  const allowedOrigins = [
    process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not permitted by CORS policy`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Parsers & Logger
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // 4. Rate Limiter (general api)
  app.use('/api', apiLimiter);

  // 5. Health Check Endpoint
  app.get('/api/health', (req, res) => {
    const dbStatus = getDBStatus();
    res.status(200).json({
      status: 'healthy',
      app: 'AICTE Complaint Monitoring System (SIH26264)',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  });

  // 6. CSV Report Export route
  app.get('/api/reports/complaints.csv', protect, exportComplaintsCSV);

  // 7. Mount Core API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/departments', departmentRoutes);
  app.use('/api/institutions', institutionRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/audit-logs', auditRoutes);
  app.use('/api/ai', aiRoutes);

  // 8. Interactive Swagger Docs
  setupSwagger(app);

  // 9. 404 Handler
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint '${req.originalUrl}' does not exist on this server. Check /api/docs for available routes.`,
    });
  });

  // 10. Global Error Handler
  app.use(errorHandler);

  return app;
};
