import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { corsOptions } from './middlewares';
// Ported TS routes
import authRouter from './routes/auth';
import userRouter from './routes/user';
import masterRouter from './routes/master';
import farmRouter from './routes/farms';
import farmUserRouter from './routes/farmUser.routes';

import animalRouter from './routes/animal';
import animalAssignmentRouter from './routes/animalAssignment.routes';
import assetRouter from './routes/asset';
import statRouter from './routes/stat';
import deathCasesRouter from './routes/deathCases.routes';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');

const PORT = Number(process.env.PORT) || 8000;
const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Ported routes (Prisma-backed)
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/master', masterRouter);
app.use('/farms', farmRouter);
app.use('/farmUsers', farmUserRouter);

app.use('/animal', animalRouter);
app.use('/animals', animalAssignmentRouter);
app.use('/asset', assetRouter);
app.use('/stat', statRouter);
app.use('/deathCases', deathCasesRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
