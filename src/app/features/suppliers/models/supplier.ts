export interface Supplier {
  id: number;
  name: string;
  taxRegistrationNumber?: string;
  commercialRegistrationNumber?: string;
  phone: string;
  email?: string;
  address?: string;
  activity?: string;
  bankName?: string;
  IBAN?: string;
  note?: string;
  active: boolean;
  halls?: {id: number}[];
  products?: SupplierProduct[];
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
  created_at?: string;
  updated_at: string;
  deleted_at: string;
  services: supplierService[];
  paymentMethods: SupplierPaymentMethod[];
  account: {id: number; name: string; name_ar: string; accountCode: string};
}

export interface SupplierPaymentMethod {
  id?: number;
  name: string;
  paymentMethodType: string;
  bankName: string;
  IBAN: string;
  accountNumber: string;
  eWalletName: string;
  eWalletPhone: string;
  paymentMethodNotes: string;
}

export interface SupplierProduct {
  id?: string;
  name: string;
  name_ar?: string;
  price: number;
  other?: boolean;
  note?: string;
}

export interface supplierService {
  id: number;
  name: string;
  name_ar: string;
  price: number;
  cost: number;
  note: string;
}

export interface SupplierRequest {
  name: string;
  taxRegistrationNumber?: string;
  commercialRegistrationNumber?: string;
  phone: string;
  email?: string;
  address?: string;
  activity?: string;
  bankName?: string;
  IBAN?: string;
  note?: string;
  active?: boolean;
  halls?: {id: number}[];
  products?: SupplierProduct[];
}

export type SortableFields = keyof Pick<Supplier, 'name' | 'activity'>;
