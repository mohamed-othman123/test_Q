import {Directive, HostListener, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {ShakeableService} from '@core/services/shakeable.service';

@Directive({
    selector: '[appShakeable]',
    exportAs: 'shakeable',
    standalone: false
})
export class ShakeableDirective {
  @Input() formGroup!: FormGroup;

  constructor(private shakeableService: ShakeableService) {}

  @HostListener('ngSubmit')
  shake() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.shakeableService.shakeInvalid();
    }
  }
}
