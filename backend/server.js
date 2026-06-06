import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routers
import authRouter from './routes/auth.js';
import vendorsRouter from './routes/vendors.js';
import rfqsRouter from './routes/rfqs.js';
import quotationsRouter from './routes/quotations.js';
import approvalsRouter from './routes/approvals.js';
import documentsRouter from './routes/documents.js';
import logsRouter from './routes/logs.js';
import approvalsRoutes from './routes/approvals.js';
import documentsRoutes from './routes/documents.js';
import pdfRoutes from './routes/pdf.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount Route handlers under /api
app.use('/api/auth', authRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/rfqs', rfqsRouter);
app.use('/api/quotations', quotationsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/logs', logsRouter);
app.use('/api/approvals', approvalsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/pdf', pdfRoutes);

app.get('/', (req, res) => {
  res.send('VendorBridge Boilerplate Server is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error occurred' });
});

app.listen(PORT, () => {
  console.log(`Boilerplate API Server is running on port ${PORT}`);
});
