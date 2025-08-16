import {Injectable} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {debounceTime, map, skip} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  constructor(private fb: FormBuilder) {}

  createFilterForm(filterConfig: Record<string, unknown>): FormGroup {
    return this.fb.group(filterConfig);
  }

  getFilledFormValues(form: FormGroup): Partial<Record<string, unknown>> {
    return Object.entries(form.value).reduce(
      (acc, [key, value]) => {
        if (value !== null && value !== '') {
          if (typeof value === 'string') {
            acc[key] = (value as string).trim();
          } else {
            acc[key] = value;
          }
        }
        return acc;
      },
      {} as Partial<Record<string, unknown>>,
    );
  }

  getFilteredFormStream(form: FormGroup) {
    return form.valueChanges.pipe(
      debounceTime(300),
      map(() => this.getFilledFormValues(form)),
    );
  }
}
