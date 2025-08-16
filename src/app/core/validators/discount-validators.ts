import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function discountValidator(
  discountTypeCtrlName: string,
  discountValueCtrName: string,
  totalAmountCtlName: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const discountType = control.get(discountTypeCtrlName)?.value || 'fixed';
    const discountValue = control.get(discountValueCtrName)?.value;
    const subtotal = control.get(totalAmountCtlName)?.value;

    if (!discountType || !discountValue) return null;

    if (
      (discountType === 'percentage' || discountType === 'percent') &&
      +discountValue > 100
    ) {
      return {discountInvalid: 'discount Invalid'};
    }

    if (discountType !== 'percentage' && +discountValue > +subtotal) {
      return {discountInvalid: 'discount Invalid'};
    }

    return null;
  };
}
