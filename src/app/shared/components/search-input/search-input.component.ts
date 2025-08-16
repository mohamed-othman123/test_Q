import {animate, state, style, transition, trigger} from '@angular/animations';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {Router} from '@angular/router';
import {HallsService} from '@halls/services/halls.service';
import {OrdersService} from '@orders/services/orders.service';
import {debounceTime, distinctUntilChanged, Subject, takeUntil} from 'rxjs';

interface SearchResult {
  id: number;
  orderNo: string;
  customerName: string;
  customerPhone: string;
}

@Component({
    selector: 'app-search-input',
    templateUrl: './search-input.component.html',
    styleUrl: './search-input.component.scss',
    animations: [
        trigger('searchAnimation', [
            state('closed', style({
                width: '0',
                opacity: '0',
                visibility: 'hidden',
            })),
            state('open', style({
                width: '200px',
                opacity: '1',
                visibility: 'visible',
            })),
            transition('closed => open', [
                style({ visibility: 'visible' }),
                animate('300ms ease'),
            ]),
            transition('open => closed', [
                animate('300ms ease'),
                style({ visibility: 'hidden' }),
            ]),
        ]),
        trigger('dropdownAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-10px)' }),
                animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
            ]),
        ]),
    ],
    standalone: false
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @HostBinding('class.active') isActive: boolean = false;
  @Output() term = new EventEmitter<string>();
  searchState: 'open' | 'closed' = 'closed';
  @ViewChild('input')
  input!: ElementRef<HTMLInputElement>;

  hallId!: number;
  searchQuery: string = '';
  searchResults: SearchResult[] = [];
  showDropdown: boolean = false;
  private searchSubject: Subject<string>;
  private destroy$!: Subject<void>;
  constructor(
    private router: Router,
    private ordersService: OrdersService,
    private hallsService: HallsService,
  ) {
    this.searchSubject = new Subject();
    this.destroy$ = new Subject();
  }

  ngOnInit(): void {
    const hall = this.hallsService.getCurrentHall();

    this.hallId = hall?.id!;

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        if (searchTerm || searchTerm !== '') {
          this.performSearch(searchTerm);
        } else {
          this.searchResults = [];
          this.showDropdown = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: any) {
    const searchTerm = event.target.value;
    this.searchSubject.next(searchTerm);
  }

  search() {
    this.isActive = true;
    this.input.nativeElement.focus();
  }

  performSearch(searchTerm: string) {
    this.ordersService
      .getOrders({
        generalSearch: searchTerm,
        page: 1,
        limit: 10,
        hallId: this.hallId,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.searchResults = res.items.map((item) => ({
            customerName: item.user.name!,
            customerPhone: item.user.phone!,
            orderNo: item.bookingReference!,
            id: item.id!,
          }));
          this.showDropdown = true;
        },
        error(err) {},
      });
  }

  toggleSearch() {
    this.isActive = !this.isActive;
    this.searchState = this.isActive ? 'open' : 'closed';
    if (!this.isActive) {
      this.clearSearch();
    }
  }

  onResultClick(result: SearchResult) {
    this.router.navigate(['/details-and-payment', result.id]);
    this.clearSearch();
    this.isActive = false;
    this.searchState = 'closed';
  }

  clearSearch() {
    this.searchQuery = '';
    this.showDropdown = false;
    this.searchResults = [];
  }

  onClickOutside() {
    if (!this.showDropdown) {
      this.isActive = false;
      this.searchState = 'closed';
      this.clearSearch();
    }
  }
}
