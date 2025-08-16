import {DiscountType} from '@orders/models';

export const DISCOUNT_TYPES = [
  {
    value: DiscountType.FIXED,
    label: {en: 'Fixed Amount', ar: 'قيمه ثابته'},
  },
  {
    value: DiscountType.PERCENT,
    label: {en: 'Percent', ar: 'نسبه مئويه'},
  },
];
