import {Component, Input, OnInit} from '@angular/core';
import {LanguageService} from '@core/services';
import {CalendarEvent} from 'angular-calendar';

@Component({
    selector: 'app-day-template',
    templateUrl: './day-template.component.html',
    styleUrl: './day-template.component.scss',
    standalone: false
})
export class DayTemplateComponent implements OnInit {
  @Input() day!: any;
  @Input() events!: CalendarEvent[];

  eventObject: any;

  constructor(public land: LanguageService) {}

  ngOnInit(): void {
    this.eventObject = this.generateEventsGroupByEventTime();
  }

  generateEventsGroupByEventTime() {
    return this.events.reduce((acc: any, event) => {
      const key = event.meta['eventTime'];

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(event);
      return acc;
    }, {});
  }

  isFullDay(day: any) {
    return day.events.some((e: any) => e.allDay === true);
  }

  getConfirmedBooking(eventTime: any[]) {
    return eventTime.filter((e: any) => e.meta?.isConfirmed === true);
  }

  getTemporaryBooking(eventTime: any[]) {
    return eventTime.filter((e: any) => e.meta?.isConfirmed === false);
  }
}
