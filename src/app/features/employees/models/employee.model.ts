import {Role} from '@core/models';
import {Hall} from '@halls/models/halls.model';

export interface Moderator {
  id: number;
  created_at: Date;
  updated_at: Date;
  deleted: boolean;
  deleted_at: null;
  deleted_by: null;
  name: string;
  email: string;
  phone: string;
  type: string;
  verified: boolean;
  active: boolean;
  role: Role;
  permissionType: string;
  halls: Hall[];
}

export interface ModeratorsQuerySearch {
  page?: number;
  limit?: number;
  generalSearch?: string;
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  creationDate?: string;
}
