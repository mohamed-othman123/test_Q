import { HttpClient, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DataTableFilter, GaCustomEvents, Item, TableData} from '@core/models';
import {BookingProcessStatus} from '@orders/enums/orders.enum';
import {
  Attachment,
  Booking,
  BookingAvailability,
  BookingOverlap,
  BookingPrice,
  BookingPriceResponse,
} from '@orders/models/orders.model';
import {BehaviorSubject, combineLatest, map, Observable, of, tap} from 'rxjs';
import {NotificationService} from '@core/services/notification.service';
import {BookingAttachments} from '@orders/models/attachment.model';
import {ApiConfigService} from '@core/services/api-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {GaConfigService} from '@core/analytics/ga-config.service';

@Injectable({providedIn: 'root'})
export class OrdersService {
  module = 'booking';
  apiBookingUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  isConfirmed$ = new BehaviorSubject<boolean>(true);

  constructor(
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  getOrders(filters?: DataTableFilter): Observable<TableData<Booking>> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== null && val !== undefined && val !== '') {
          params = params.set(key, String(val));
        }
      });
    }

    return this.http.get<TableData<Booking>>(this.apiBookingUrl, {params});
  }

  getBookingDetails(bookingId: number): Observable<Booking> {
    const url = `${this.apiBookingUrl}/${bookingId}`;
    return this.http.get<Booking>(url);
  }

  getBookingStatus() {
    return this.http.get<Item[]>('assets/lovs/booking-status.json');
  }

  getEventTimes() {
    return this.http.get<Item[]>('assets/lovs/event-times.json');
  }

  getBookingTypes() {
    return this.http.get<Item[]>('assets/lovs/booking-types.json');
  }

  deleteOrders(id: number) {
    return this.http
      .delete(`${this.apiBookingUrl}/${id}`)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('orders.order_cancelled'),
        ),
      );
  }

  getAttendeesTypes() {
    return this.http.get<Item[]>('assets/lovs/attendeesTypes.json');
  }

  getAttachmentsAsBlobs(attachments: Attachment[]) {
    if (!attachments?.length) {
      return of([]);
    }

    return combineLatest(
      attachments.map((attachment) =>
        this.http.get(attachment.path, {responseType: 'blob'}).pipe(
          map(
            (blob: Blob) =>
              ({
                id: attachment.id,
                name: attachment.name,
                file: blob,
              }) as BookingAttachments,
          ),
        ),
      ),
    );
  }

  createOrder(payload: FormData) {
    return this.http.post<Booking>(this.apiBookingUrl, payload).pipe(
      tap(() => {
        this.gtag.event(GaCustomEvents.CREATE_BOOKING, {
          organizationInfo: this.gaConfig.getOrganizationInfo(),
          hallInfo: this.gaConfig.getHallInfo(),
        });

        this.notificationService.showSuccess('orders.order_created');
      }),
    );
  }

  editOrder(orderId: number, payload: FormData) {
    const url = `${this.apiBookingUrl}/${orderId}`;
    return this.http.patch<Booking>(url, payload).pipe(
      tap(() => {
        this.gtag.event(GaCustomEvents.UPDATE_BOOKING, {
          organizationInfo: this.gaConfig.getOrganizationInfo(),
          hallInfo: this.gaConfig.getHallInfo(),
        });

        this.notificationService.showSuccess('orders.order_updated');
      }),
    );
  }

  private statusDetails = {
    [BookingProcessStatus.New]: {
      nameEn: 'New',
      nameAr: 'جديد',
      color: '#7c4d11',
      backgroundColor: '#e38200',
    },
    [BookingProcessStatus.FullyPaid]: {
      nameEn: 'Fully Paid',
      nameAr: 'مدفوع كليا',
      color: '#1e3a8a',
      backgroundColor: '#457acd',
    },
    [BookingProcessStatus.Completed]: {
      nameEn: 'Completed',
      nameAr: 'مكتمل',
      color: '#065f46',
      backgroundColor: '#009883',
    },
    [BookingProcessStatus.PartiallyPaid]: {
      nameEn: 'Partially Paid',
      nameAr: 'مدفوع جزئيا',
      color: '#111827',
      backgroundColor: '#002037',
    },
    [BookingProcessStatus.Canceled]: {
      nameEn: 'Canceled',
      nameAr: 'ملغي',
      color: '#991b1b',
      backgroundColor: '#db2e2e',
    },
    [BookingProcessStatus.Late]: {
      nameEn: 'Late',
      nameAr: 'متاخر',
      color: '#854d0e',
      backgroundColor: '#ffd303',
    },
    [BookingProcessStatus.Temporary]: {
      nameEn: 'Temporary',
      nameAr: 'مؤقت',
      color: '#6c757d',
      backgroundColor: '#6c757d',
    },
  };

  getStatusDetails(status: BookingProcessStatus) {
    return this.statusDetails[status];
  }

  checkBookingAvailability(filters: BookingAvailability) {
    const params = new HttpParams({fromObject: filters});

    const url = `${this.apiBookingUrl}/availability`;
    return this.http.get<any>(url, {params});
  }

  getBookingPrice(filters: BookingPrice) {
    const params = new HttpParams({fromObject: filters});

    const url = `${this.apiBookingUrl}/calculate-pricing`;

    return this.http.get<BookingPriceResponse>(url, {params});
  }

  checkBookingOverlap(payload: BookingOverlap) {
    const url = `${this.apiBookingUrl}/check-overlap`;

    return this.http.post(url, payload);
  }
}
