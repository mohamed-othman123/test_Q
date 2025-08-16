import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) {
      return null;
    }

    const lettersNoOneCapitalOneSymbol =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!#\-\_{}&$<>=])[A-Za-z\d@!#\-\_{}&$<>=]{6,}$/.test(
        value,
      );
    const passwordValid = lettersNoOneCapitalOneSymbol;
    return !passwordValid
      ? {
          weakPassword: true,
        }
      : null;
  };
}
