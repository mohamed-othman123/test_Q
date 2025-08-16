import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

/**
 * Custom validator that requires at least one of the specified controls to have a value
 * @param controlNames Array of control names to check
 * @returns Validator function that returns null if validation passes, or error object if it fails
 */
export function requireOneOf(controlNames: string[]): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const hasValue = controlNames.some((name) => {
      const control = formGroup.get(name);
      const value = control?.value;
      return value !== null && value !== undefined && value !== '';
    });

    if (hasValue) {
      controlNames.forEach((name) => {
        const control = formGroup.get(name);
        if (control?.hasError('required')) {
          const errors = {...control.errors};
          delete errors['required'];
          control.setErrors(Object.keys(errors).length ? errors : null);
        }
      });
      return null;
    }

    controlNames.forEach((name) => {
      const control = formGroup.get(name);
      if (control) {
        const currentErrors = control.errors || {};
        control.setErrors({
          ...currentErrors,
          required: true,
        });
      }
    });

    return {requireOneOf: true};
  };
}
