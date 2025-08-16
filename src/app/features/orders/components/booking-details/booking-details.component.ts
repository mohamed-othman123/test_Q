import {Component, Input, OnInit} from '@angular/core';
import {Booking, BookingDetails} from '@orders/models/orders.model';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService, LanguageService} from '@core/services';
import {ConfirmationService} from 'primeng/api';
import {TranslateService} from '@ngx-translate/core';
import {PrintTemplate} from '@orders/enums/print.enum';
import {OrdersService} from '@orders/services/orders.service';
import {PermissionTypes} from '@auth/models';
import {PermissionsService} from '@core/services/permissions.service';
import {BookingProcessStatus} from '@orders/enums/orders.enum';
import {dateToGregorianIsoString} from '@shared/components/date-picker/helper/date-helper';

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.scss',
  standalone: false,
})
export class BookingDetailsComponent implements OnInit {
  @Input() bookingDetails!: Partial<BookingDetails>;
  @Input() showPrintBtn = false;
  @Input() showUpdateBtn = false;

  calculatedStatus!: BookingProcessStatus;

  template = PrintTemplate;
  private isDialogOpen = false;
  private dialogCloseTimeout: any = null;
  constructor(
    private router: Router,
    public lang: LanguageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService,
    public ordersService: OrdersService,
    private activatedRoute: ActivatedRoute,
    public permissionsService: PermissionsService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.calculatedStatus = this.calculateBookingStatus(
      this.bookingDetails as BookingDetails,
    );
  }

  previewPdf(event: Event, type: PrintTemplate) {
    if (this.isDialogOpen) {
      this.confirmationService.close();

      if (this.dialogCloseTimeout) {
        clearTimeout(this.dialogCloseTimeout);
      }

      this.dialogCloseTimeout = setTimeout(() => {
        this.openPrintDialog(event, type);
      }, 140);
    } else {
      this.openPrintDialog(event, type);
    }
  }

  private openPrintDialog(event: Event, type: PrintTemplate) {
    const id =
      type === PrintTemplate.INVOICE
        ? this.bookingDetails.invoicePdf?.id
        : this.bookingDetails.contractPdf?.id;

    const identity =
      type === PrintTemplate.INVOICE
        ? this.bookingDetails.invoicePdf?.hash
        : this.bookingDetails.contractPdf?.hash;

    // Mark dialog as open
    this.isDialogOpen = true;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message:
        type === PrintTemplate.CONTRACT
          ? this.translate.instant('orders.print')
          : this.translate.instant('orders.printInvoice'),
      icon: 'pi pi-print',
      acceptLabel: this.translate.instant('orders.printAr'),
      rejectLabel: this.translate.instant('orders.printEn'),
      acceptButtonStyleClass: 'accept-arabic',
      accept: () => {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(
            ['../../', type, 'preview', id?.toString()],
            {
              queryParams: {lang: 'ar', identity},
              relativeTo: this.activatedRoute,
            },
          ),
        );

        window.open(url, '_blank');
        this.isDialogOpen = false; // Mark dialog as closed
      },
      reject: () => {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(
            ['../../', type, 'preview', id?.toString()],
            {
              queryParams: {lang: 'en', identity},
              relativeTo: this.activatedRoute,
            },
          ),
        );

        window.open(url, '_blank');
        this.isDialogOpen = false; // Mark dialog as closed
      },
    });
  }
  updateBooking() {
    this.router.navigate(['orders/add-new-order/edit'], {
      queryParams: {id: this.bookingDetails?.id},
    });
  }

  getServicesTotals() {
    if (!this.bookingDetails?.services) {
      return 0;
    }
    return this.bookingDetails?.services.reduce(
      (acc, service) => acc + service.price,
      0,
    );
  }

  calculatePerPersonPrice() {
    return (
      (this.bookingDetails.maleAttendeesCount || 0) *
        (this.bookingDetails.malePricePerAttendee || 0) +
      (this.bookingDetails.femaleAttendeesCount || 0) *
        (this.bookingDetails.femalePricePerAttendee || 0)
    );
  }

  hasPermissionTo(action: 'update', order: any): boolean {
    const isOwner = order.created_by === this.auth.userData?.user?.userId;
    const canEdit =
      isOwner ||
      this.auth.userData?.user.permissionType === PermissionTypes.GENERAL;

    const isActive = order.bookingProcessStatus !== 'Canceled';

    return (
      this.permissionsService.hasPermission('update:bookings') &&
      canEdit &&
      isActive &&
      this.showUpdateBtn
    );
  }

  calculateBookingStatus(booking: BookingDetails): BookingProcessStatus {
    const paidAmount = booking.paidAmount || 0;
    const totalPayable = booking.totalPayable || 0;
    const bookingDate = booking.startDate;
    const discountAmount =
      booking.discountType === 'percent'
        ? (booking.discountValue! * booking.subtotal!) / 100
        : booking.discountValue;

    const startDate = dateToGregorianIsoString(bookingDate as string, 'short');
    const bookingDateObj = new Date(startDate!);
    bookingDateObj.setUTCHours(0, 0, 0, 0);

    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    const isFullyPaid =
      +paidAmount === +totalPayable || booking.subtotal === discountAmount;
    const isLate = now > bookingDateObj;

    if (
      (paidAmount === 0 && !booking.discountValue) ||
      (paidAmount === 0 && booking.discountValue && totalPayable !== 0)
    ) {
      return isLate ? BookingProcessStatus.Late : BookingProcessStatus.New;
    }

    return isFullyPaid
      ? isLate
        ? BookingProcessStatus.Completed
        : BookingProcessStatus.FullyPaid
      : isLate
        ? BookingProcessStatus.Late
        : BookingProcessStatus.PartiallyPaid;
  }
}
