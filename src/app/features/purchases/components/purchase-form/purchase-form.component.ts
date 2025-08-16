import {Component, OnInit, OnDestroy} from '@angular/core';

import {ActivatedRoute, Router} from '@angular/router';
import {Subject, Subscription} from 'rxjs';
import {switchMap, takeUntil, tap} from 'rxjs/operators';
import {PurchasesService} from '../../services/purchases.service';

import {TranslateService} from '@ngx-translate/core';

import {PurchasesAttachmentService} from '@purchases/services/purchases-attachment.service';
import {LanguageService} from '@core/services';
import {
  InvoiceType,
  PurchaseAttachment,
} from '@purchases/models/purchase-model';
import {HallsService} from '@halls/services/halls.service';

@Component({
    selector: 'app-purchase-form',
    templateUrl: './purchase-form.component.html',
    styleUrls: ['./purchase-form.component.scss'],
    standalone: false
})
export class PurchaseFormComponent implements OnInit, OnDestroy {
  mode: 'add' | 'view' | 'edit' = 'add';

  private destroyed$ = new Subject<void>();
  private subs = new Subscription();

  constructor(
    public purchasesService: PurchasesService,
    private route: ActivatedRoute,
    public router: Router,
    public translate: TranslateService,
    private purchasesAttachmentService: PurchasesAttachmentService,
    public lang: LanguageService,
    private hallsService: HallsService,
  ) {}

  ngOnInit(): void {
    this.purchasesService.currentStep$.next(0);
    this.handleRoute();
  }

  private handleRoute() {
    this.subs.add(
      this.route.url.subscribe((segments) => {
        const lastSegment = segments[segments.length - 2]?.path;
        this.mode = lastSegment as any;
        if (!lastSegment) {
          this.mode = 'add';
        }
      }),
    );

    this.subs.add(
      this.route.params.subscribe((params) => {
        if (params['id']) {
          this.loadPurchase(params['id']);
        } else {
          this.purchasesService.currentPurchase$.next(null);
        }
      }),
    );
  }

  private loadPurchase(id: number): void {
    this.purchasesService
      .getPurchase(id)
      .pipe(
        switchMap((purchase) => {
          return this.purchasesAttachmentService
            .getAttachmentsAsBlobs(purchase.attachments!)
            .pipe(
              tap((attachments) => {
                this.purchasesService.currentPurchase$.next({
                  ...purchase,
                  attachments,
                });
              }),
            );
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  submit() {
    const data = this.purchasesService.currentPurchase$.getValue();

    if (data) {
      const currentHall = this.hallsService.getCurrentHall();

      const formData = new FormData();

      formData.append('hallId', currentHall?.id.toString() as string);
      formData.append('invoiceType', data?.invoiceType as string);
      formData.append('subtotal', Number(data?.subtotal) as any);
      formData.append(
        'subtotalAfterDisc',
        (data?.subtotalAfterDisc || 0).toString(),
      );
      formData.append('discountType', data?.discountType as string);
      formData.append('vat', (data?.vat || 0).toString());
      formData.append('totalPayable', (data?.totalPayable || 0).toString());
      formData.append('purchaseDate', data?.purchaseDate as string);
      formData.append('dueDate', data?.dueDate as string);

      if (!data?.id) {
        formData.append('type', data?.expensesType as string);
        formData.append('payment', JSON.stringify(data?.payment));
      }

      if (data.invoiceReference?.trim()) {
        formData.append('invoiceReference', data.invoiceReference.trim());
      }

      if (data.items?.length > 0) {
        const items = data.items.map((item) => {
          const name =
            this.lang.lang === 'ar' ? item.name['nameAr'] : item.name['name'];
          return {
            id: item.id,
            quantity: +item.quantity,
            name: item.name['name'] || item.name,
            nameAr: item.name['nameAr'] || item.nameAr,
            value: +item.name['value'] || +item.value,
            isNew: item.isNew || false,
            type: item.type,
          };
        });
        formData.append('items', JSON.stringify(items));
      } else {
        formData.append('items', JSON.stringify([]));
      }

      if (data.expenseItemId) {
        formData.append('expenseItemId', String(data.expenseItemId));
      }

      if (data?.invoiceType === InvoiceType.TAX) {
        if (data.deliveryDate) {
          formData.append('deliveryDate', data?.deliveryDate);
        }

        if (data.supplier?.id != null) {
          formData.append('supplierId', data?.supplier?.id as any);
        }
      }

      if (data?.discountValue != null) {
        formData.append('discountValue', data.discountValue.toString());
      }

      if (data?.notes?.trim()) {
        formData.append('notes', data?.notes.trim());
      }

      formData.append('categoryId', data?.category?.id as any);
      if (data.expensesDescription) {
        formData.append(
          'expensesDescription',
          data?.expensesDescription as string,
        );
      }

      if (data?.attachments && !data?.id) {
        const attachments = data.attachments as PurchaseAttachment[];
        attachments.forEach((attachment: PurchaseAttachment) => {
          formData.append(attachment.name, attachment.file!);
        });
      }

      if (data?.id) {
        this.updatePurchase(data.id, formData);
      } else {
        this.createPurchase(formData);
      }
    }
  }

  private updatePurchase(id: number, formData: FormData): void {
    this.purchasesService
      .updatePurchase(id, formData)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.router.navigate(['/purchases']);
        },
      });
  }

  private createPurchase(formData: FormData): void {
    this.purchasesService
      .createPurchase(formData)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.router.navigate(['/purchases']);
        },
      });
  }

  changeStep(index: number) {
    this.purchasesService.currentStep$.next(index);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.subs.unsubscribe();
  }
}
