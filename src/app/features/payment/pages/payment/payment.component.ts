import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BookingDetails} from '@orders/models';
import {LanguageService} from '@core/services';
import {OrdersService} from '@orders/services/orders.service';
import {PermissionsService} from '@core/services/permissions.service';
import {CommentType} from '@shared/components/comments/models/comment';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
  standalone: false,
})
export class PaymentComponent {
  bookingDetails: BookingDetails;
  commentType = CommentType;

  constructor(
    private activatedRoute: ActivatedRoute,

    public ordersService: OrdersService,
    public lang: LanguageService,
    public permissionsService: PermissionsService,
  ) {
    const resolvedData = activatedRoute.snapshot.data['resolvedData'];
    this.bookingDetails = resolvedData.bookingDetails;
  }
}
