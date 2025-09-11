import {TreeNode} from 'primeng/api';

export interface AccountNode extends TreeNode {
  id: string;
  data: AccountData;
  children?: AccountNode[];
  expanded?: boolean;
}

export interface AccountData {
  id?: number;
  parentAccountId?: any;
  name: string;
  name_ar: string;
  accountCode: string;
  accountLevel?: number;
  accountType: AccountTypeEnum;
  isParent: boolean;
  openingDebit: number;
  openingCredit: number;
  parent?: {id?: number | null; name?: string; name_ar?: string} | null;
  description?: string;
  children?: AccountData[];
  data?: AccountData;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export enum AccountTypeEnum {
  ASSET = 'ASSETS',
  LIABILITY = 'LIABILITIES',
  EQUITY = 'EQUITY',
  INCOME = 'REVENUE',
  EXPENSE = 'EXPENSES',
}
