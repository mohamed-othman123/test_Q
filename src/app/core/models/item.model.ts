import {PaymentMethod} from '@paymentmethods/models/payment.model';

export interface Item {
  value: string | number | boolean;
  label: {
    en: string;
    ar: string;
  };
}

export interface PurchaseItems {
  invoiceTypes: Item[];
  purchaseStatuses: Item[];
  paymentTypes: Item[];
  paymentMethods: PaymentMethod[];
  bankTypes: Item[];
  normalBanks: Item[];
}
