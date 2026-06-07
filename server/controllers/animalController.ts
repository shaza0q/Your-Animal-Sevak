import { Request, Response } from 'express';
import cloudinary from 'cloudinary';
import fs from 'fs';
import prisma from '../lib/prisma';
import { parsePage } from '../lib/pagination';
import { upload } from '../middlewares/upload.middleware';
import { getAnimalOverviewByFarm, getDashboardStats } from '../services/animalOverview.service';
import {
  getAnimalsByType,
  getAnimalDetail,
  getAnimalHistory,
  searchAnimal,
  getAnimalAbstractData,
  sellAnimal,
  SellAnimalData,
} from '../services/animal.service';
import { AnimalType, AnimalStatus, HealthStatus, UpdateType } from '../generated/prisma';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export { upload };

export const addAnimalData = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const {
    farmId,
    tagNumber,
    name,
    animalType,
    motherId,
    fatherId,
    otherAnimalType,
    breed,
    gender,
    weight,
    dateOfBirth,
    acquisitionDate,
  } = req.body;

  let generation = 1;
  const finalAnimalType: string = animalType === 'other' ? otherAnimalType : animalType;

  try {
    // Check if animal tag already exists
    const existingAnimal = await prisma.animal.findFirst({ where: { tagNumber, farmId } });
    if (existingAnimal) {
      res.status(409).json({ message: 'Animal Id already exists' });
      return;
    }

    let motherRef: string | undefined;
    let fatherRef: string | undefined;

    if (motherId && motherId.trim() !== '') {
      const mother = await prisma.animal.findFirst({ where: { tagNumber: motherId, farmId } });
      if (!mother) {
        res.status(404).json({ message: 'Mother with given tag not found in that breed' });
        return;
      }
      motherRef = mother.id;
      generation = mother.generation + 1;
    }

    if (fatherId && fatherId.trim() !== '') {
      const father = await prisma.animal.findFirst({ where: { tagNumber: fatherId, farmId } });
      if (!father) {
        res.status(404).json({ message: 'Father with given tag not found in that breed' });
        return;
      }
      fatherRef = father.id;
    }

    const normalizedType = (
      finalAnimalType.charAt(0).toUpperCase() + finalAnimalType.slice(1).toLowerCase()
    ) as AnimalType;
    const normalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();

    const animal = await prisma.animal.create({
      data: {
        tagNumber,
        name,
        farmId,
        animalType: normalizedType,
        breed,
        gender: normalizedGender,
        motherId: motherRef ?? null,
        fatherId: fatherRef ?? null,
        generation,
        weight: weight ? Number(weight) : null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : null,
      },
    });

    await prisma.animalUpdate.create({
      data: {
        animalId: animal.id,
        weight: weight ? Number(weight) : null,
        staffId: userId,
        updateType: UpdateType.Health,
        status: HealthStatus.Healthy,
      },
    });

    res.status(201).json({ message: 'Animal added successfully' });
  } catch (err) {
    console.error('Registration error: ', err);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
};

export const updateAnimalData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const {
      animalId,
      date,
      updateType,
      status: incomingStatus,
      weight,
      notes,
      riskLevel,
      vaccineName,
      diseaseName,
      maleAnimalId,
      expectedDeliveryDate,
      nextVaccineDate,
      price,
      buyerName,
      buyerEmail,
      buyerContact,
      buyerAddress,
    } = req.body;

    // Find animal by tag number first, then by id
    let animalData = await prisma.animal.findFirst({ where: { tagNumber: animalId } });

    if (!animalData) {
      animalData = await prisma.animal.findUnique({ where: { id: animalId } });
    }

    if (!animalData) {
      res.status(404).json({ message: 'Animal not found' });
      return;
    }

    if (['Sold', 'Deceased'].includes(animalData.status)) {
      res.status(400).json({ message: `Cannot update a ${animalData.status} animal` });
      return;
    }

    const lastUpdate = await prisma.animalUpdate.findFirst({
      where: { animalId: animalData.id },
      orderBy: { createdAt: 'desc' },
    });

    const lastStatus = lastUpdate?.status ?? HealthStatus.Healthy;

    let finalStatus: HealthStatus;

    switch (updateType) {
      case 'Health':
        finalStatus = incomingStatus as HealthStatus;
        break;
      case 'Weight':
      case 'Vaccination':
        finalStatus = lastStatus;
        break;
      case 'Breeding':
        finalStatus = HealthStatus.Pregnant;
        break;
      case 'Sale':
        finalStatus = HealthStatus.Sold;
        break;
      default:
        // updateType is Zod-validated; this branch is unreachable
        finalStatus = lastStatus;
    }

    const updateData: any = {
      animalId: animalData.id,
      staffId: userId,
      date: date ? new Date(date) : undefined,
      updateType: updateType as UpdateType,
      status: finalStatus,
      weight: weight !== undefined && weight !== '' ? Number(weight) : undefined,
      notes: notes || undefined,
      riskLevel: riskLevel || undefined,
      vaccineName: vaccineName || undefined,
      diseaseName: diseaseName || undefined,
      maleAnimalId: maleAnimalId || undefined,
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
      nextVaccineDate: nextVaccineDate ? new Date(nextVaccineDate) : undefined,
      price: price !== undefined && price !== '' ? Number(price) : undefined,
      buyerName: buyerName || undefined,
      buyerEmail: buyerEmail || undefined,
      buyerContact: buyerContact || undefined,
      buyerAddress: buyerAddress || undefined,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'animalPhotos',
      });
      updateData.mediaUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const animalUpdate = await prisma.animalUpdate.create({ data: updateData });

    if (updateType === 'Sale') {
      await prisma.animal.update({
        where: { id: animalData.id },
        data: { status: AnimalStatus.Sold },
      });
    }

    if (updateType === 'Health' && finalStatus === HealthStatus.Dead) {
      await prisma.animal.update({
        where: { id: animalData.id },
        data: { status: AnimalStatus.Deceased },
      });
    }

    res.status(201).json({
      message: 'Animal update recorded successfully',
      data: animalUpdate,
    });
  } catch (err) {
    console.error('Error updating animal', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAnimalOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmId } = req.params;
    const { state } = req.query as { state: string };
    if (!farmId) {
      res.status(400).json({ message: 'farmId is required' });
      return;
    }

    const data = await getAnimalOverviewByFarm(farmId, state);
    res.json(data);
  } catch (error) {
    console.error('Animal overview error:', error);
    res.status(500).json({ message: 'Failed to fetch animal overview' });
  }
};

export async function listAnimalsByType(req: Request, res: Response): Promise<void> {
  try {
    const { farmId } = req.params;
    const q = req.query as Record<string, string>;

    const { page, limit } = parsePage(q, 12);

    const result = await getAnimalsByType({
      farmId,
      type: q.type,             // optional — omit to list all types
      page,
      limit,
      assigned: q.assigned,
      gender: q.gender,
      breed: q.breed,
      caretakerName: q.caretakerName,
      vetName: q.vetName,
      status: q.status,         // no default — show all statuses when not specified
      search: q.search,
    });

    res.json(result);
  } catch (err) {
    console.error('Failed to list animals', err);
    res.status(500).json({ message: 'Failed to fetch animals' });
  }
}

export const getAnimalDetailController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmId, animalId } = req.params;

    const animalData = await getAnimalDetail({ farmId, animalId });

    if (!animalData) {
      res.status(404).json({ message: 'Animal not found' });
      return;
    }

    res.json(animalData);
  } catch (error) {
    console.error('Animal detail error:', error);
    res.status(500).json({ message: 'Failed to fetch animal detail' });
  }
};

export const getAnimalHistoryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { animalId } = req.params;
    const { page, limit } = parsePage(req.query as Record<string, string>, 5);

    const result = await getAnimalHistory({ animalId, page, limit });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch animal history' });
  }
};

export const searchAnimalController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, animalType, breed, gender, excludeAnimalIds, farmId: queryFarmId } = req.query as Record<string, string>;
    const userId = req.user!.id;

    let farmId = queryFarmId;
    if (!farmId) {
      const farmUser = await prisma.farmUser.findFirst({
        where: { userId, isActive: true },
        select: { farmId: true },
      });
      if (!farmUser) {
        res.status(403).json({ message: 'User not associated with any farm' });
        return;
      }
      farmId = farmUser.farmId;
    }

    const animals = await searchAnimal({
      farmId,
      q: q || '',
      animalType,
      breed,
      gender,
      excludeAnimalIds: excludeAnimalIds ? excludeAnimalIds.split(',') : [],
    });

    res.json({
      success: true,
      data: animals,
      count: animals.length,
    });
  } catch (error) {
    console.error('Error searching animals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search animals',
    });
  }
};

export const getDashboardStatsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const stats = await getDashboardStats(userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};

export const sellAnimalController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { animalId } = req.params;
    const staffId = req.user!.id;
    const saleData = req.body as SellAnimalData;

    const sale = await sellAnimal(animalId, staffId, saleData);

    res.status(201).json({
      success: true,
      message: 'Animal sold successfully',
      data: sale,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to record sale';
    const status =
      message.includes('not found') ? 404 :
      message.includes('already') || message.includes('cannot') || message.includes('Only') ? 400 :
      500;
    res.status(status).json({ success: false, message });
  }
};

export const getAnimalAbstract = async (req: Request, res: Response): Promise<void> => {
  try {
    const { animalId } = req.params;

    if (!animalId) {
      res.status(400).json({ message: 'animalId is required' });
      return;
    }

    const animalData = await getAnimalAbstractData(animalId);

    if (!animalData) {
      res.status(404).json({ message: 'Animal not found' });
      return;
    }

    res.json({
      success: true,
      data: animalData,
    });
  } catch (error) {
    console.error('Error fetching animal abstract data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch animal data',
    });
  }
};
