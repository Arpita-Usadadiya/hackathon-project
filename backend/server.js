import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import authRouter from './routes/auth.js';
import vendorsRouter from './routes/vendors.js';
import rfqsRouter from './routes/rfqs.js';
import quotationsRouter from './routes/quotations.js';
import approvalsRouter from './routes/approvals.js';
import documentsRouter from './routes/documents.js';
import logsRouter from './routes/logs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/rfqs', rfqsRouter);
app.use('/api/quotations', quotationsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/logs', logsRouter);

// Base route
app.get('/', (req, res) => {
  res.send('VendorBridge ERP API Server is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
