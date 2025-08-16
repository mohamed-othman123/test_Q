export interface ExpensesItem {
  id?: number;
  categoryId?: string;
  name?: string;
  nameAr?: string;
  description?: string;
  elements?: ExpensesElement[];
  created_by?: number;
  hallId?: number;
  category?: ExpensesCategory;
  transferAccounts: TransferAccounts[];
}

export interface TransferAccounts {
  id?: number;
  accountName: string;
  accountNumber: string;
  description?: string;
}
export interface ExpensesElement {
  id?: number;
  name: string;
  nameAr?: string;
  value: number;
}
export interface ExpensesCategory {
  id?: number;
  name?: string;
  name_ar?: string;
  description?: string;
  type?: string;
}
