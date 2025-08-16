export enum RefundStatus {
  NEW = 'new',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
  REJECTED = 'rejected',
}

export enum PaymentMethodType {
  CASH = 'cash',
  BANK_ACCOUNT = 'bankAccount',
  E_WALLET = 'eWallet',
  POS = 'pos',
}

export interface ClientPaymentMethodType {
  value: string;
  label: string;
  label_ar: string;
}

export interface StatusOption {
  value: string;
  label: string;
  label_ar: string;
}

export interface RefundRequest {
  id: number;
  amount: number;
  notes: string;
  status: RefundStatus;
  request_date: string;
  beneficiaryType: string;
  beneficiaryName: string;
  beneficiaryMobile: string;
  clientPaymentMethod: {
    id: number;
    account_number: string;
    bank_name: string;
    ewallet_mobile: string;
    ewallet_name: string;
    iban: string;
    receiver_name: string;
    type: string;
  };
  user: {
    id: number;
    name: string;
    isVIB: boolean;
  };
  paymentMethod: {
    id: number;
    name: string;
    name_ar: string;
  };
  booking: {bookingReference: string; id: number};
  created_by: number;
  updated_by: number;
  deleted_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}
