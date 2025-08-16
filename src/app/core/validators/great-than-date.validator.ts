import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import moment from 'moment';

export function greatThanDateValidator(
  startDateControl: AbstractControl,
): ValidatorFn {
  return (endDateControl: AbstractControl): ValidationErrors | null => {
    const startDateValue = startDateControl.value;
    const endDateValue = endDateControl.value;

    if (!startDateValue || !endDateValue) {
      return null;
    }
    if (
      typeof endDateValue !== 'string' ||
      typeof startDateValue !== 'string'
    ) {
      return null;
    }
    const startDate = moment(startDateValue).locale('en').format('YYYY-MM-DD');
    const endDate = moment(endDateValue).locale('en').format('YYYY-MM-DD');

    if (endDate < startDate) {
      return {
        notGreatThan: 'End date must be greater than or equal to start date',
      };
    }

    return null;
  };
}
