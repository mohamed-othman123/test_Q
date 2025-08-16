import { HttpClient } from '@angular/common/http';
import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PurchaseItems} from '@core/models';
import {LanguageService} from '@core/services';
import {TranslateService} from '@ngx-translate/core';
import {PrintTemplate} from '@orders/enums/print.enum';
import {OrdersService} from '@orders/services/orders.service';
import {PurchaseModel} from '@purchases/models/purchase-model';
import {PurchasesService} from '@purchases/services/purchases.service';
import {ConfirmationService} from 'primeng/api';
import {forkJoin, Subject, takeUntil} from 'rxjs';

@Component({
    selector: 'settlement',
    templateUrl: './settlement.component.html',
    styleUrls: ['./settlement.component.scss'],
    standalone: false
})
export class PurchaseSettlementComponent {
  purchaseId!: number;
  private destroyed$ = new Subject<void>();
  purchase!: PurchaseModel;
  purchaseItems!: PurchaseItems;

  constructor(
    private purchasesService: PurchasesService,
    private route: ActivatedRoute,
    private http: HttpClient,
    public lang: LanguageService,
    private translate: TranslateService,
    private confirmationService: ConfirmationService,
    public ordersService: OrdersService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.purchaseId = +this.route.snapshot.params['id'];
    this.loadInitialData();
  }

  private loadInitialData() {
    forkJoin({
      purchase: this.purchasesService.getPurchase(this.purchaseId),
      purchaseItems: this.http.get<PurchaseItems>(
        'assets/lovs/purchase-items.json',
      ),
    })
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: ({purchase, purchaseItems}) => {
          this.purchase = purchase;
          this.purchaseItems = purchaseItems;
        },
      });
  }

  cancel() {
    this.router.navigate(['/purchases']);
  }

  print(event: Event) {
    const {id, hash} = this.purchase?.settlementPdf!;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translate.instant('purchases.printSettlement'),
      icon: 'pi pi-print',
      acceptLabel: this.translate.instant('orders.printAr'),
      rejectLabel: this.translate.instant('orders.printEn'),
      acceptButtonStyleClass: 'accept-arabic',
      accept: () => {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(
            ['../../../', PrintTemplate.SETTLEMENT, 'preview', id],
            {
              queryParams: {lang: 'ar', identity: hash},
              relativeTo: this.activatedRoute,
            },
          ),
        );

        window.open(url, '_blank');
      },
      reject: () => {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(
            ['../../../', PrintTemplate.SETTLEMENT, 'preview', id],
            {
              queryParams: {lang: 'en', identity: hash},
              relativeTo: this.activatedRoute,
            },
          ),
        );

        window.open(url, '_blank');
      },
    });
  }
}
