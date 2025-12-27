// interfaces/user.interface.ts
import { UserRole } from '@/enums/user-role.enum';

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  isActive: boolean;
}
