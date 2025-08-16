import {AbstractControl, ValidatorFn, Validators} from '@angular/forms';

export function requiredIf(condition: () => boolean): ValidatorFn {
  return (control: AbstractControl) => {
    if (condition()) {
      return Validators.required(control);
    }
    return null;
  };
}
