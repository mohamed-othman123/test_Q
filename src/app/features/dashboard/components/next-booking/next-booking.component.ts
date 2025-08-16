import {Component, Input, OnInit} from '@angular/core';
import {
  UpcomingBooking,
  UpcomingBookingHijriDate,
} from '@dashboard/models/dashboard.model';
import {
  gregorianToIslamic,
  toNgbDateStruct,
} from '@shared/components/date-picker/helper/date-helper';
import {Router} from '@angular/router';
import {LanguageService} from '@core/services';

@Component({
    selector: 'app-next-booking',
    templateUrl: './next-booking.component.html',
    styleUrl: './next-booking.component.scss',
    standalone: false
})
export class NextBookingComponent implements OnInit {
  @Input() upcomingBooking!: UpcomingBooking[];
  upcomingBookingHijriDate!: UpcomingBookingHijriDate | null;

  nextBookings: UpcomingBooking[] = [];

  constructor(
    private router: Router,
    public lang: LanguageService,
  ) {}

  ngOnInit(): void {
    this.nextBookings = this.prepareUpcomingBooking();
  }

  prepareUpcomingBooking(): UpcomingBooking[] {
    return this.upcomingBooking.map((booking) => {
      const hijriDate = this.getUpcomingBookingHijriDate(booking);

      const isTheSameDay = this.checkIsTheSameDay(booking);

      return {
        ...booking,
        hijriStartDate: hijriDate.startDate,
        hijriEndDate: hijriDate.endDate,
        isTheSameDay,
      };
    });
  }

  checkIsTheSameDay(upcomingBooking: UpcomingBooking): Boolean {
    const startDate = new Date(upcomingBooking.startDate);
    const endDate = new Date(upcomingBooking.endDate);
    return startDate.getDate() === endDate.getDate();
  }

  getUpcomingBookingHijriDate(
    upcomingBooking: UpcomingBooking,
  ): UpcomingBookingHijriDate {
    const startDate = gregorianToIslamic(
      toNgbDateStruct(upcomingBooking.startDate!)!,
    );
    const endDate = gregorianToIslamic(
      toNgbDateStruct(upcomingBooking.endDate!)!,
    );
    return {
      startDate,
      endDate,
    };
  }

  viewDetails(upcomingBooking: UpcomingBooking) {
    this.router.navigate(['details-and-payment', upcomingBooking.id]);
  }
}
