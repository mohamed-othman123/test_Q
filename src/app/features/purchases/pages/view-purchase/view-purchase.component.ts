import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LanguageService} from '@core/services';
import {PermissionsService} from '@core/services/permissions.service';
import {ExpensesType, PurchaseModel} from '@purchases/models/purchase-model';
import {PurchasePaymentsService} from '@purchases/services/purchase-payment.service';
import {PurchasesService} from '@purchases/services/purchases.service';
import {CommentType} from '@shared/components/comments/models/comment';
import {of, Subject, switchMap, takeUntil} from 'rxjs';

@Component({
  selector: 'app-view-purchase',
  templateUrl: './view-purchase.component.html',
  styleUrl: './view-purchase.component.scss',
  standalone: false,
})
export class ViewPurchaseComponent implements OnInit, OnDestroy {
  id: number;
  purchase!: PurchaseModel;
  commentType = CommentType;
  payments: any[] = [];

  totalRecords: number | null = null;

  ExpensesType = ExpensesType;

  isLoading = true;

  destroy$ = new Subject<void>();

  constructor(
    private purchasesService: PurchasesService,
    private route: ActivatedRoute,
    public lang: LanguageService,
    private purchasePaymentsService: PurchasePaymentsService,
    private router: Router,
    public permissionsServices: PermissionsService,
  ) {
    this.id = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.id) {
      this.purchasesService
        .getPurchase(this.id)
        .pipe(
          switchMap((purchase) => {
            this.purchase = purchase;

            return this.purchasePaymentsService.getPayments({
              purchaseId: this.id,
            });
          }),
          takeUntil(this.destroy$),
        )
        .subscribe((response) => {
          this.payments = response.items;
          this.totalRecords = response.totalItems;
          this.isLoading = false;
        });
    }
  }

  goToUpdate() {
    this.router.navigate(['purchases/edit', this.id]);
  }

  goToPayment() {
    this.router.navigate(['purchases/payments', this.id]);
  }
  openAttachment(attachment: any) {
    window.open(attachment.path, '_blank');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
