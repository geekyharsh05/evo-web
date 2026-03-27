import express, { Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/userRoutes.js';
import projectRouter from './routes/projectRoutes.js';
import { stripeWebhook } from './controllers/stripeWebhook.js';

const app = express();

const port = 3000;

const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS?.split(',') || [],
    credentials: true,
}

app.use(cors(corsOptions))
app.post('/api/stripe', express.raw({type: 'application/json'}), stripeWebhook)

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json({limit: '50mb'}))

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    const healthCheck = {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: Date.now(),
        environment: process.env.NODE_ENV || 'development',
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            unit: 'MB'
        }
    };
    res.status(200).json(healthCheck);
});

// API health check endpoint (alternative path)
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'healthy',
        message: 'API is running',
        timestamp: Date.now()
    });
});

app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});