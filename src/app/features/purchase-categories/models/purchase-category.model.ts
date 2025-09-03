import {ExpensesType} from '@purchases/models/purchase-model';

export interface PurchaseCategory {
  name?: string;
  name_ar?: string;
  description?: string;
  id: number;
  type?: ExpensesType;
  categoryType?: string;
  created_by?: number;
}
