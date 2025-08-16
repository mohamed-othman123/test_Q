import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LanguageService} from '@core/services';
import {Booking} from '@orders/models';

@Component({
    selector: 'app-tooltip-content',
    templateUrl: './tooltip-content.component.html',
    styleUrl: './tooltip-content.component.scss',
    standalone: false
})
export class TooltipContentComponent implements OnInit {
  @Input() events: any[] = [];
  @Input() time!: string;

  constructor(
    private router: Router,
    public lang: LanguageService,
  ) {}

  ngOnInit(): void {}

  goToBooking(booking: Booking): void {
    this.router.navigate(['details-and-payment', booking.id]);
  }
}
