import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'zatca-otp',
  templateUrl: './zatca-otp.component.html',
  styleUrls: ['./zatca-otp.component.scss'],
  standalone: false,
})
export class ZatcaOTPComponent implements OnInit {
  displayDialog: boolean = true;
  otpForm!: FormGroup;
  otpControls: string[] = [];
  @Input() isLoading: boolean = false;
  @Output() onVerify = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<void>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.otpForm = this.fb.group({
      otp: [null, [Validators.required, Validators.minLength(6)]],
    });
  }

  cancel() {
    this.onCancel.emit();
  }

  verify() {
    this.onVerify.emit(this.otpForm.value.otp);
  }
}
