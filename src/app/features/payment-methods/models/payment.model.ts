import {HallReference} from '@halls/models/halls.model';

export interface PaymentMethod {
  id?: number;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  deleted_at?: string;
  deleted_by?: string;
  deleted?: boolean;
  name: string;
  name_ar?: string;
  description: string;
  halls: HallReference[];
  account?: {
    accountCode: string;
    id: number;
    name: string;
    name_ar: string;
  };
}

export interface PaymentType {
  name: string;
  code: string;
}

export interface PurchasePayment {
  id: number;
  purchaseId: number;
  amount: number;
  paymentType: 'Income' | 'Refund';
  paymentMethodId: number;
  bankDetails?: {
    bankType: 'Normal Bank' | 'EBANK';
    bankName: string;
    IBAN: string;
    phoneNumberForEbank: string;
  };
  notes?: string;
  created_at?: string;
}

export interface PurchasePaymentForm {
  id?: number;
  purchaseId: number;
  paidAmount: number;
  paymentType: 'Income' | 'Refund';
  paymentMethodId: number;
  bankDetails?: {
    bankType: 'Normal Bank' | 'EBANK';
    bankName: string;
    IBAN: string;
    phoneNumberForEbank: string;
  };
  notes?: string;
}

export interface BankOption {
  value: string;
  label: {
    en: string;
    ar: string;
  };
}
