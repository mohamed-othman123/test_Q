import {Address} from '@core/interfaces/address';

export interface Client {
  id: number;
  name: string;
  email?: string;
  phone: string;
  address?: Address;
  notes: string | null;
  type: ClientType;
  companyDetails?: CompanyDetails | null;
  contacts?: Contact[];
  company: string | null;
  created_at: Date;
  created_by: number;
  updated_at: Date;
  updated_by: number;
  deleted_at: Date | null;
  deleted_by: number | null;
  deleted: boolean;
  gender?: string;
  isVIB: boolean;
  nationalOrResidencyId?: string;
  hallId?: number | null;
  halls?: {
    id: number;
    name: string;
    name_ar: string;
  }[];
}

export interface Contact {
  name: string;
  email?: string;
  phone: {[key: string]: string};
}
export enum ClientType {
  Individual = 'Individual',
  Facility = 'Facility',
  Governmental = 'Governmental Facility',
}
interface CompanyDetails {
  taxRegistrationNumber: string;
  commercialRegistrationNumber: string;
}
