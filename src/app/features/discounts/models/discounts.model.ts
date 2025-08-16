export interface Discount {
  id?: number;
  name?: string;
  type?: DiscountTypes;
  value?: number;
  note?: string;
}

export enum DiscountTypes {
  PERCENT = 'percent',
  FIXED = 'fixed',
}
