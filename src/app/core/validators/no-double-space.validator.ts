import {AbstractControl, ValidatorFn} from '@angular/forms';

export function noDoubleSpaceValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value || typeof control.value !== 'string') {
      return null;
    }

    const hasDoubleSpace = /\s{2,}/.test(control.value);

    return hasDoubleSpace ? {doubleSpace: true} : null;
  };
}
