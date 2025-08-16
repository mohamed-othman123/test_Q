import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {GeorgianI18nService} from '@core/services/georgianI18n.service';
import {Islamic18nService} from '@core/services/islamic18n.service';
import {ReservedBookings} from '@dashboard/models/dashboard.model';
import {
  NgbCalendar,
  NgbCalendarGregorian,
  NgbCalendarIslamicUmalqura,
  NgbDatepicker,
  NgbDatepickerI18n,
} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {
  convertDateTo,
  toNgbDateStruct,
} from '@shared/components/date-picker/helper/date-helper';
@Component({
    selector: 'app-reservation-viewer',
    templateUrl: './reservation-viewer.component.html',
    styleUrl: './reservation-viewer.component.scss',
    standalone: false
})
export class ReservationViewerComponent {
  public calendarView: 'gregorian' | 'islamic' = 'islamic';
  @Input() reservedBookings: ReservedBookings[] = [];
  @Output() navigate = new EventEmitter<any>();
  currentLang: string | null;

  constructor(
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
  ) {
    this.currentLang = this.translate.currentLang || 'en';

    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = null;
      this.cd.detectChanges();
      this.currentLang = event.lang;
    });
  }

  onNavigate(event: any) {
    this.navigate.emit(event);
  }
}

@Component({
    selector: 'app-gregorian-date-viewer',
    template: `
    <ng-template #t let-date>
      <span
        [ngClass]="{
          'reserved':
            date | reservedDate: reservedBookings : currentMonth : 'gregorian',
        }">
        @if (date.month !== currentMonth) {
          <span
            style="color:#d8d8d8;"
            >
            {{ date.day }}
          </span>
        } @else {
          {{ date.day }}
        }
      </span>
    </ng-template>
    <ngb-datepicker
      [dayTemplate]="t"
      (navigate)="onNavigate($event)"
      class="rtl"
      #dp
      [firstDayOfWeek]="7" />
    `,
    styles: `
    .reserved {
      color: #1bb49f;
      background: #caf6ee;
      padding: 6px;
      border-radius: 50%;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,
    providers: [
        { provide: NgbCalendar, useClass: NgbCalendarGregorian },
        { provide: NgbDatepickerI18n, useClass: GeorgianI18nService },
    ],
    standalone: false
})
export class GregorianDateViewerComponent {
  @Input() reservedBookings: ReservedBookings[] = [];
  @Output() navigate = new EventEmitter<any>();

  currentMonth!: number;

  onNavigate(event: any) {
    this.currentMonth = event.next.month;

    this.navigate.emit(event);
  }
}

@Component({
    selector: 'app-islamic-date-viewer',
    template: `
    <ng-template #t let-date>
      <span
        [ngClass]="{
          'reserved':
            date | reservedDate: reservedBookings : currentMonth : 'islamic',
        }">
        @if (date.month !== currentMonth) {
          <span
            style="color:#d8d8d8;"
            >
            {{ date.day }}
          </span>
        } @else {
          {{ date.day }}
        }
      </span>
    </ng-template>
    <ngb-datepicker
      [dayTemplate]="t"
      (navigate)="onNavigate($event)"
      class="rtl"
      #dp
      [firstDayOfWeek]="7" />
    `,
    styles: `
    .reserved {
      color: #1bb49f;
      background: #caf6ee;
      padding: 6px;
      border-radius: 50%;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,
    providers: [
        { provide: NgbCalendar, useClass: NgbCalendarIslamicUmalqura },
        { provide: NgbDatepickerI18n, useClass: Islamic18nService },
    ],
    standalone: false
})
export class IslamicDateViewerComponent implements AfterContentChecked {
  @Input() reservedBookings: ReservedBookings[] = [];
  @Output() navigate = new EventEmitter<any>();
  @ViewChild('dp') dp!: NgbDatepicker;

  currentMonth!: number;

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterContentChecked() {
    this.cd.detectChanges();
  }
  onNavigate(event: any) {
    this.currentMonth = event.next.month;

    const gregorianDate = convertDateTo(event.next, 'gregorian');
    this.navigate.emit({...event, next: gregorianDate});
  }
}
