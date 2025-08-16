import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormGroup,
} from '@angular/forms';

export const costLessThanPriceValidator: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const formGroup = group as FormGroup;
  const price = formGroup.get('price')?.value;
  const cost = formGroup.get('cost')?.value;

  if (price != null && cost != null) {
    if (+cost <= +price) {
      return null;
    } else {
      return {costExceedsPrice: true};
    }
  }

  return null;
};
