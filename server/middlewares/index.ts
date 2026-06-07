import 'dotenv/config';

export const corsOptions = {
  origin: process.env.BASE_URL || 'http://localhost:8080',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};
