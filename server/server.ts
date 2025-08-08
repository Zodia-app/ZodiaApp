import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import astroDailyRoute from './api/astroDailyRoute';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/readings/astro/daily', astroDailyRoute);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});