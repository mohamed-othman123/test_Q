import {AbstractControl, ValidatorFn} from '@angular/forms';

export function validateDoubleName(): ValidatorFn {
  return (
    control: AbstractControl<string | null>,
  ): {[key: string]: any} | null =>
    control.value
      ? control.value.trim().split(' ').length >= 2
        ? null
        : {inValidDoubleName: control.value}
      : null;
}
