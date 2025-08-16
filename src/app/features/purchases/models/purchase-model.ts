import {ExpensesItem} from '@expenses-items/models';
import {Hall} from '@halls/models/halls.model';
import {PurchaseCategory} from '@purchase-categories/models/purchase-category.model';

export interface PurchaseModel {
  id?: number;
  supplierId?: number;
  hallId?: string;
  invoiceReference: string;
  purchaseDate: string;
  deliveryDate: string;
  dueDate: string;
  notes?: string;
  attached?: string;
  status?: PurchaseStatus;
  supplier?: {
    id: number;
    name?: string;
  };
  invoiceType?: InvoiceType;
  expensesType?: ExpensesType;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Credit Card';
  subtotal?: number;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  vat?: number;
  vatAmount?: number;
  totalPayable?: number;
  paidAmount?: number;
  settlementPdf?: {
    id: number;
    hash: string;
  };
  items: PurchaseItem[];
  totalAmount?: number;
  subtotalAfterDisc?: number;
  attachments?: PurchaseAttachment[];
  category?: PurchaseCategory;
  expensesDescription?: string;
  hall?: Hall;
  payment: InitPayment;
  created_by?: number;
  deleted_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  expenseItemId?: number;
  expenseItem?: ExpensesItem;
  showPayment?: boolean;
  selectedExpenseItem: any;
  selectedSupplier: any;
  remainingAmount?: number;
}

export interface InitPayment {
  amount: number;
  hallPaymentMethodId?: number;
  notes?: string;
  supplierPaymentMethodId?: number;
  itemTransferAccountId?: number;
  cashReceiverName?: string;
  posName?: string;
}

export interface PurchaseAttachment {
  id: number;
  name: string;
  path: string;
  file?: Blob;
  type?: string;
}

export interface PurchaseItem {
  id?: number;
  name: {[key: number | string]: string};
  value: number;
  quantity: number;
  total?: number;
  isNew?: boolean;
  saved?: boolean;
  type?: string;
  nameAr?: string;
}

export type PurchaseStatus =
  | 'Fully Paid'
  | 'Partially Paid'
  | 'Completed'
  | 'Late'
  | 'Canceled'
  | 'New';

export enum InvoiceType {
  TAX = 'Tax Invoice',
  SIMPLIFIED = 'Simplified Invoice',
}

export enum ExpensesType {
  purchasesExpenses = 'Purchases',
  generalExpenses = 'General',
}
