import {Item, TransactionSource, TransactionType} from '@core/models';

export const TRANSACTION_SOURCE: Item[] = [
  {
    value: TransactionSource.inventoryOfficer,
    label: {en: 'Inventory Officer', ar: 'مسؤول المخزون'},
  },
  {
    value: TransactionSource.booking,
    label: {en: 'Booking', ar: 'الحجز'},
  },
  {value: TransactionSource.purchase, label: {en: 'Purchase', ar: 'الشراء'}},
];

export const TRANSACTION_TYPE: Item[] = [
  {value: TransactionType.incoming, label: {en: 'Incoming', ar: 'إضافة'}},
  {value: TransactionType.withdrawal, label: {en: 'Withdrawal', ar: 'سحب'}},
  {value: TransactionType.return, label: {en: 'Return', ar: 'إرجاع'}},
];
