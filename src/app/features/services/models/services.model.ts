export interface Service {
  id: number;
  name: string;
  name_ar?: string;
  note: string | null;
  price: number;
  halls: HallServiceDetails[];
  isNew?: boolean;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface HallServiceDetails {
  id: number;
  price: number;
  name?: string;
  cost: number;
  providerType: ProviderType;
  providers: ProviderDetails[];
  supplier?: Supplier;
}

export interface ProviderDetails {
  name: string;
  email?: string;
  phone: {[key: string]: string};
}

export interface Supplier {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
}

export enum ProviderType {
  HALL = 'hall',
  THIRD_PARTY = 'thirdParty',
  SUPPLIER = 'supplier',
}
