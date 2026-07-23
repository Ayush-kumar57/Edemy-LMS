import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import connectDB from './configs/mongodb.js';
import { clearkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import { clerkMiddleware } from '@clerk/express';
import educatorRouter from './routes/educatorRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';

// initialize express
const app = express();

// Stripe Webhook Route
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// connect to database
await connectDB();

// connect to cloudinary
await connectCloudinary();

//Middleware
app.use(cors());
app.use(clerkMiddleware());

// Routes
app.get('/', (req, res) => res.send('Api working'));
app.post('/clerk', express.json(), clearkWebhooks);
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);

// PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
