import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getDiseaseData = async (_req: Request, res: Response): Promise<void> => {
  try {
    const disease = await prisma.diseaseMaster.findMany();
    res.status(200).json(disease);
  } catch (err) {
    console.error('Error fetching diseases:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getVaccineData = async (_req: Request, res: Response): Promise<void> => {
  try {
    const vaccine = await prisma.vaccineMaster.findMany();
    res.status(200).json(vaccine);
  } catch (err) {
    console.error('Error fetching vaccines:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBreedData = async (_req: Request, res: Response): Promise<void> => {
  try {
    const breed = await prisma.breedMaster.findMany();
    res.status(200).json(breed);
  } catch (err) {
    console.error('Error fetching breeds:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
