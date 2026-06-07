import prisma from '../lib/prisma';
import { Prisma, UserRole } from '../generated/prisma';

interface SearchFarmUsersArgs {
  farmId: string;
  q?: string;
  roles?: string[];
  excludeUserIds?: string[];
}

export async function searchFarmUsers({ farmId, q, roles = [], excludeUserIds = [] }: SearchFarmUsersArgs) {
  const where: Prisma.FarmUserWhereInput = {
    farmId,
    isActive: true,
    ...(roles.length ? { role: { in: roles as UserRole[] } } : {}),
    ...(excludeUserIds.length ? { userId: { notIn: excludeUserIds } } : {}),
    ...(q
      ? {
          user: {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          },
        }
      : {}),
  };

  const farmUsers = await prisma.farmUser.findMany({
    where,
    include: {
      user: { select: { id: true, fullName: true, email: true, role: true } },
    },
    take: 10,
  });

  return farmUsers.map((fu) => ({
    id: fu.user.id,
    name: fu.user.fullName,
    email: fu.user.email,
    role: fu.role,
  }));
}
