import {InjectionToken} from '@angular/core';
import {ShakeableInput} from '@core/interfaces';

export const SHAKEABLE_INPUT = new InjectionToken<ShakeableInput>(
  'shakeable input',
);
