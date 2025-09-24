import {Item} from '@core/models';

export const CHART_OF_ACCOUNTS = [];

export const ACCOUNT_TYPES: Item[] = [
  {value: 'assets', label: {en: 'Assets', ar: 'أصول'}},
  {value: 'liabilities', label: {en: 'Liabilities', ar: 'خصوم'}},
  {value: 'equity', label: {en: 'Equity', ar: 'حقوق الملكية'}},
  {value: 'revenue', label: {en: 'Revenue', ar: 'إيرادات'}},
  {value: 'expenses', label: {en: 'Expenses', ar: 'مصروفات'}},
];

export const MODULE_TYPES: Item[] = [
  {value: 'paymentMethods', label: {en: 'Payment Methods', ar: 'طرق الدفع'}},
  {value: 'hallClients', label: {en: 'Hall Clients', ar: 'عملاء القاعات'}},
  {value: 'suppliers', label: {en: 'Suppliers', ar: 'الموردين'}},
  {value: 'expenseItems', label: {en: 'Expense Items', ar: 'بنود المصروفات'}},
  {value: 'inventory', label: {en: 'Inventory', ar: 'المخزون'}},
  {value: 'services', label: {en: 'Services', ar: 'الخدمات'}},
];
