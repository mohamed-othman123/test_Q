import {Component, Input, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {BookingProcessStatus} from '@orders/enums/orders.enum';
import {OrdersService} from '@orders/services/orders.service';

@Component({
    selector: 'app-status-badge',
    templateUrl: './status-badge.component.html',
    styleUrl: './status-badge.component.scss',
    standalone: false
})
export class StatusBadgeComponent implements OnInit {
  @Input() status!: BookingProcessStatus;
  statusDetails: any;
  currentLang: string = 'ar';

  constructor(
    private orderSevice: OrdersService,
    private translate: TranslateService,
  ) {
    this.currentLang = this.translate.currentLang;
  }
  ngOnInit(): void {
    this.translate.onLangChange.subscribe(() => {
      this.currentLang = this.translate.currentLang;
    });
    if (this.status) {
      this.statusDetails = this.orderSevice.getStatusDetails(this.status);
    }
  }
}
