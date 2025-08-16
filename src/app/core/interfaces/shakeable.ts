import {AbstractControl} from '@angular/forms';

export interface ShakeableInput {
  control: AbstractControl;
  shakeInvalid: () => void;
}
