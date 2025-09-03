export enum CommentType {
  BOOKING = 'booking',
  EXPENSE = 'expense',
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier',
  REFUND_REQUEST = 'refundRequest',
  TRANSACTION = 'transaction',
  INVENTORY = 'inventory',
}

export interface Comment {
  id: number;
  content: string;
  type: CommentType;
  entity_id: number;
  is_edited: false;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  created_by: {id: number; name: string} | null;
  updated_by: {id: number; name: string} | null;
  deleted_by: {id: number; name: string} | null;
}
