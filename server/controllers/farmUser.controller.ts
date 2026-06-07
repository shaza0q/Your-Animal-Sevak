import { Request, Response } from 'express';
import { searchFarmUsers } from '../services/farmUser.service';

export async function searchUsers(req: Request, res: Response): Promise<void> {
  const { farmId } = req.params;
  const { q, roles, excludeUserIds } = req.query as {
    q?: string;
    roles?: string;
    excludeUserIds?: string;
  };

  const roleArray = roles ? roles.split(',') : [];
  const excludeArray = excludeUserIds ? excludeUserIds.split(',') : [];

  try {
    const users = await searchFarmUsers({
      farmId,
      q,
      roles: roleArray,
      excludeUserIds: excludeArray,
    });

    res.json({ data: users });
  } catch (error) {
    console.error('Error searching farm users:', error);
    throw error;
  }
}
