import {Injectable} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ShakeableInput} from '@core/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ShakeableService {
  private inputs = new Set<ShakeableInput>();

  register(input: ShakeableInput) {
    this.inputs.add(input);
  }

  unregister(input: ShakeableInput) {
    this.inputs.delete(input);
  }

  shakeInvalid() {
    this.inputs.forEach((input) => {
      input.shakeInvalid();
    });
  }
}
