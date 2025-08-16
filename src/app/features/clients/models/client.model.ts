export interface Client {
  id: number;
  name: string;
  email?: string;
  phone: string;
  address: string | null;
  notes: string | null;
  type: ClientType;
  companyDetails?: CompanyDetails | null;
  contacts?: Contact[];
  company: string | null;
  created_at: Date;
  created_by: number;
  updated_at: Date;
  deleted_at: Date | null;
  deleted_by: number | null;
  deleted: boolean;
  gender?: string;
  isVIB: boolean;
  nationalOrResidencyId?: string;
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
