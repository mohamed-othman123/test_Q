import {Component, Input} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-address',
  standalone: false,
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss',
})
export class AddressComponent {
  @Input({required: true}) addressForm!: FormGroup;

  getControl(controlName: string) {
    return this.addressForm?.get(controlName) as FormControl;
  }
}
