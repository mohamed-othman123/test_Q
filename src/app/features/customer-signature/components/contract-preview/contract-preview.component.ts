import {Component, Input} from '@angular/core';
import {LanguageService} from '@core/services';
import {ContractInfo} from '../../models/contract-info';

@Component({
  selector: 'app-contract-preview',
  standalone: false,
  templateUrl: './contract-preview.component.html',
  styleUrl: './contract-preview.component.scss',
})
export class ContractPreviewComponent {
  @Input() contractInfo!: ContractInfo;

  constructor(public langService: LanguageService) {}

  get totalServiceFee() {
    const services = this.contractInfo.services;
    return (
      services?.reduce((acc: number, service: any) => acc + service.price, 0) ||
      0
    );
  }

  get paidAmount() {
    return this.contractInfo.payments.reduce((acc: number, payment: any) => {
      if (payment.deleted) return acc;

      return payment.paymentType === 'Income' ? acc + payment.amount : acc;
    }, 0);
  }
}
