import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {formatDate} from '@shared/components/date-picker/helper/date-helper';

export function dateRangeValidator(
  startKey: string,
  endKey: string,
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const startDate = group.get(startKey)?.value;
    const endDate = group.get(endKey)?.value;

    if (!startDate || !endDate) {
      return null;
    }

    const start =
      typeof startDate === 'object'
        ? new Date(formatDate(startDate))
        : new Date(startDate);
    const end =
      typeof startDate === 'object'
        ? new Date(formatDate(endDate))
        : new Date(endDate);

    return start > end ? {dateRange: true} : null;
  };
}
