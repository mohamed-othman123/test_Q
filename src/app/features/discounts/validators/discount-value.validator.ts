import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function discountValueValidator(): ValidatorFn {
  return (fg: AbstractControl): ValidationErrors | null => {
    const discountValue = fg.get('value')?.value;
    const discountType = fg.get('type')?.value;

    if (!discountValue || !discountType) return null;

    if (
      discountType === 'percent' &&
      (discountValue < 0 || discountValue > 100)
    ) {
      return {invalidDiscountValue: true};
    }
    return null;
  };
}
