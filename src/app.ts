import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';

dotenv.config();

// Connect to MongoDB
connectDB();

const app: Application = express();

// Middleware
app.use(express.json()); // Body parser for raw JSON

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Health Check Route
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// Error Handling (Basic)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route Not Found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`📡 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});