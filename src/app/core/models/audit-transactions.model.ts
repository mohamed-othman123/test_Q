import {DataTableFilter} from './data-table.model';

export interface AuditTransactionParams extends DataTableFilter {
  source: Source;
  sourceId: string;
  hallId: string;
}

export enum Source {
  inventory = 'inventory',
  booking = 'booking',
  purchase = 'purchase',
}

export interface AuditTransaction {
  id: number;
  created_at: string;
  created_by: number;
  source: TransactionSource;
  transactionType: TransactionType;
  oldQuantity: number;
  quantity: number;
  currentQuantity: number;
  reason: string;
  inventory: {
    'id': number;
    'name': string;
    'name_ar': string;
  };
  hall: {
    'id': number;
    'name': string;
    'name_ar': string;
  };
}

export enum TransactionSource {
  inventoryOfficer = 'inventoryOfficer',
  booking = 'booking',
  purchase = 'purchase',
}

export enum TransactionType {
  incoming = 'incoming',
  withdrawal = 'withdrawal',
  return = 'return',
}
