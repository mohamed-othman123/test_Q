import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BANKS_DATA, E_WALLETS} from '@core/constants';
import {Item} from '@core/models';
import {TranslateService} from '@ngx-translate/core';
import {
  RefundRequest,
  RefundStatus,
} from '@refund-requests/models/refund-request.model';
import {CommentType} from '@shared/components/comments/models/comment';

enum PaymentMethodType {
  CASH = 'cash',
  BANK_ACCOUNT = 'bankAccount',
  E_WALLET = 'eWallet',
  POS = 'pos',
}

@Component({
  selector: 'view-refund-request',
  templateUrl: './view-refund-request.component.html',
  styleUrls: ['./view-refund-request.component.scss'],
  standalone: false,
})
export class ViewRefundRequestComponent {
  refundRequest!: RefundRequest;
  loading: boolean = true;
  commentType = CommentType;

  banks: Item[] = BANKS_DATA;
  eWallets: Item[] = E_WALLETS;

  get lang(): string {
    return this.translateService.currentLang;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.loadRefundRequestDetails();
  }

  private loadRefundRequestDetails(): void {
    this.refundRequest = this.route.snapshot.data['refund'];
  }

  getStatusClass(): string {
    switch (this.refundRequest.status) {
      case RefundStatus.NEW:
        return 'status-new';
      case RefundStatus.COMPLETED:
        return 'status-completed';
      case RefundStatus.IN_PROGRESS:
        return 'status-in-progress';
      case RefundStatus.REJECTED:
        return 'status-rejected';

      default:
        return '';
    }
  }

  getStatusLabel(): string {
    const statusMap = {
      [RefundStatus.NEW]: this.lang === 'en' ? 'New' : 'جديد',
      [RefundStatus.COMPLETED]: this.lang === 'en' ? 'Completed' : 'مكتمل',
      [RefundStatus.REJECTED]: this.lang === 'en' ? 'Rejected' : 'مرفوض',
      [RefundStatus.IN_PROGRESS]:
        this.lang === 'en' ? 'In Progress' : 'قيد المراجعة',
    };

    return (
      statusMap[this.refundRequest.status as RefundStatus] ||
      this.refundRequest.status
    );
  }

  getPaymentMethodName(): string {
    return this.lang === 'en'
      ? this.refundRequest.paymentMethod.name
      : this.refundRequest.paymentMethod.name_ar ||
          this.refundRequest.paymentMethod.name;
  }

  getClientPaymentMethodTypeName(): string {
    const typeMap = {
      [PaymentMethodType.CASH]: this.lang === 'en' ? 'Cash' : 'نقدًا',
      [PaymentMethodType.BANK_ACCOUNT]:
        this.lang === 'en' ? 'Bank Account' : 'حساب بنكي',
      [PaymentMethodType.E_WALLET]:
        this.lang === 'en' ? 'E-Wallet' : 'محفظة إلكترونية',
      [PaymentMethodType.POS]: this.lang === 'en' ? 'POS' : 'نقاط البيع',
    };

    return (
      typeMap[
        this.refundRequest.clientPaymentMethod.type as PaymentMethodType
      ] || this.refundRequest.clientPaymentMethod.type
    );
  }

  isCashSelected(): boolean {
    return (
      this.refundRequest.clientPaymentMethod.type === PaymentMethodType.CASH
    );
  }

  isBankAccountSelected(): boolean {
    return (
      this.refundRequest.clientPaymentMethod.type ===
      PaymentMethodType.BANK_ACCOUNT
    );
  }

  isEWalletSelected(): boolean {
    return (
      this.refundRequest.clientPaymentMethod.type === PaymentMethodType.E_WALLET
    );
  }

  isPosSelected(): boolean {
    return (
      this.refundRequest.clientPaymentMethod.type === PaymentMethodType.POS
    );
  }

  navigateBack(): void {
    this.router.navigate(['refund-requests']);
  }

  navigateToEdit(): void {
    this.router.navigate(['refund-requests', 'edit', this.refundRequest.id]);
  }

  print(): void {
    window.print();
  }

  getBankName(value: string): string {
    const bank = this.banks.find((bank) => bank.value === value);
    return bank ? (this.lang === 'en' ? bank.label.en : bank.label.ar) : '';
  }
  getEWalletName(value: string): string {
    const eWallet = this.eWallets.find((wallet) => wallet.value === value);
    return eWallet
      ? this.lang === 'en'
        ? eWallet.label.en
        : eWallet.label.ar
      : '';
  }
}
