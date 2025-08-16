import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {PaymentMethod} from '@paymentmethods/models/payment.model';
import {PaymentMethodsService} from '@paymentmethods/services/payment-methods.service';
import {RefundRequest} from '@refund-requests/models/refund-request.model';
import {UpdateRefundRequestDto} from '@refund-requests/services/dto/update-refund.dto';
import {RefundRequestsService} from '@refund-requests/services/refund-request.service';
import {Subject, takeUntil} from 'rxjs';

@Component({
    selector: 'edit-refund',
    templateUrl: './edit-refund-request.component.html',
    styleUrls: ['./edit-refund-request.component.scss'],
    standalone: false
})
export class EditRefundRequestComponent implements OnInit, OnDestroy {
  refundRequestId!: number;
  refundRequest!: RefundRequest;
  paymentMethods!: PaymentMethod[];

  private unsubscribeAll: Subject<void>;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public translateService: TranslateService,
    private paymentMethodService: PaymentMethodsService,
    private refundRequestService: RefundRequestsService,
  ) {
    this.unsubscribeAll = new Subject();
    this.refundRequestId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.getPaymentMethods();
    this.getRefundRequest();
  }

  updateRefundRequest(payload: UpdateRefundRequestDto) {
    this.refundRequestService
      .updateOne(this.refundRequestId, payload)
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe({
        next: (_) => {
          this.router.navigate(['../..'], {relativeTo: this.activatedRoute});
        },
      });
  }

  private getPaymentMethods() {
    this.paymentMethodService
      .getPaymentMethodsListForCurrentHall()
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((res) => {
        this.paymentMethods = res.items;
      });
  }

  private getRefundRequest() {
    this.refundRequest = this.activatedRoute.snapshot.data['refund'];
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }
}
