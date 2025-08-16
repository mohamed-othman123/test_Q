import {Client} from '@clients/models/client.model';
import {Booking} from '@orders/models/orders.model';
import {PaymentMethod} from '@paymentmethods/models/payment.model';
import {PaymentMethodType} from '@refund-requests/models/refund-request.model';

export interface Payment {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  deleted: boolean;
  clientPaymentMethod: {
    account_number: string;
    bank_name: string;
    ewallet_mobile: string;
    ewallet_name: string;
    iban: string;
    id: number;
    type: PaymentMethodType;
  };
  beneficiaryType: string;
  beneficiary_name: string;
  beneficiary_mobile: string;
  paymentType: 'Income' | 'Refund';
  amount: number;
  notes: string;
  hijriDate: string;
  user: Partial<Client>;
  booking: Partial<Booking>;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
}
