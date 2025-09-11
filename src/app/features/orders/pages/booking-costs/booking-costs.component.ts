import {Location} from '@angular/common';
import {Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuditTransactionsListComponent} from '@audit-transactions/components/audit-transactions-list/audit-transactions-list.component';
import {Source} from '@core/models';
import {LanguageService} from '@core/services';
import {HallsService} from '@halls/services/halls.service';
import {Booking} from '@orders/models';
import {parseISO, addDays, isAfter, startOfDay} from 'date-fns';

@Component({
  selector: 'app-booking-costs',
  standalone: false,
  templateUrl: './booking-costs.component.html',
  styleUrl: './booking-costs.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class BookingCostsComponent {
  @ViewChild(AuditTransactionsListComponent)
  auditTransactionsListComponent!: AuditTransactionsListComponent;

  bookingId: string | null = null;

  hallId: string;

  serviceCost: number = 0;
  productCost: number = 0;

  source: Source = Source.booking;

  booking: Booking = {} as Booking;

  lockCosts: boolean = false;

  constructor(
    private location: Location,
    public lang: LanguageService,
    private hallsService: HallsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.bookingId = this.route.snapshot.paramMap.get('id');
    this.hallId = String(this.hallsService.getCurrentHall()?.id) || '';
    this.booking = this.router.getCurrentNavigation()?.extras.state as Booking;

    // Lock costs if the booking has ended + 1 day
    if (this.booking.endDate) {
      this.lockCosts = isAfter(
        startOfDay(new Date()),
        addDays(parseISO(this.booking.endDate as string), 1),
      );
    }
  }

  assignTotalCost(total: number, type: 'service' | 'product') {
    switch (type) {
      case 'service':
        this.serviceCost = total;
        break;
      case 'product':
        this.productCost = total;
        this.auditTransactionsListComponent.refreshData();
        break;
    }
  }

  goBack() {
    this.location.back();
  }
}
