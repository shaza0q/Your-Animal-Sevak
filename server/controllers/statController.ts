import { Request, Response } from 'express';

export async function getHealthData(_req: Request, res: Response): Promise<void> {
  res.json({ message: 'Stats not yet implemented' });
}
