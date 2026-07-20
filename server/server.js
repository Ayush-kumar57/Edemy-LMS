import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import connectDB from './configs/mongodb.js';
import { clearkWebhooks } from './controllers/webhooks.js';
import { clerkMiddleware } from '@clerk/express';

// initialize express
const app = express();

// connect to database
await connectDB();

//Middleware
app.use(cors());
app.use(clerkMiddleware())

// Routes
app.get('/', (req, res) => res.send('Api working'));
app.post('/clerk', express.json(), clearkWebhooks);
app.use('/api/educator', express.json(), educatorRouter);

// PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
