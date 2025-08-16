import {Directive, OnDestroy, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {DataTableFilter} from '@core/models';
import {FilterService} from '@core/services';
import {Table, TableLazyLoadEvent} from 'primeng/table';
import {Subscription} from 'rxjs';

@Directive()
export abstract class Filter implements OnInit, OnDestroy {
  /** Number of rows to display per page */
  rows: number = 10;
  /** Index of the first pagination row to be displayed */
  first: number = 0;
  /** Total number of records
   * @note: this property will be updated by the child class once the data is loaded
   */
  protected totalRecords: number = 0;
  protected filters: DataTableFilter = {
    page: 1,
    limit: this.rows,
  };

  /** Form group for filtering */
  filterForm!: FormGroup;
  protected subs = new Subscription();
  rowsPerPageOptions: number[] = [10, 20, 50];

  isSorted: boolean | null = null;

  dataTable!: Table;

  isInitialized: boolean = false;

  stopLazyLoad: boolean = false;

  /** Filter configuration
   * @type [key: string]
   * filter form control name
   * @type null[]
   * default null value of the filter form control
   */
  protected abstract filterConfig: {[key: string]: unknown};

  constructor(protected filterService: FilterService) {}

  ngOnInit(): void {
    this.initializeFilterForm();
    this.getFilteredFormStream();
  }

  /** Initialize the filter form */
  initializeFilterForm(): void {
    this.filterForm = this.filterService.createFilterForm(this.filterConfig);
  }

  /** Get the filtered form stream */
  getFilteredFormStream() {
    const sub = this.filterService
      .getFilteredFormStream(this.filterForm)
      .subscribe((filters) => {
        this.filters = {
          // ...this.filters,
          ...filters,
          page: 1,
          limit: this.rows,
        };
        // Reset the table's paginator to the first row since new filter received
        this.first = 0;
        this.loadDataTable(this.filters);
      });
    this.subs.add(sub);
  }

  protected onLazyLoad(event: TableLazyLoadEvent) {
    if (this.shouldSuppressLazyLoad()) {
      return;
    }

    if (this.handleSortToggle(event)) {
      return;
    }

    this.first = event?.first ?? 0;
    const filters = this.filterService.getFilledFormValues(this.filterForm);
    this.filters = {
      ...this.filters,
      ...filters,
      page:
        event?.first === 0 ? 1 : (event?.first ?? 0) / (event?.rows ?? 0) + 1,
      limit: event?.rows ?? this.rows,
    };
    if (event.sortField) {
      this.filters['sortBy'] = event.sortField;
      this.filters['sortOrder'] = event.sortOrder === 1 ? 'ASC' : 'DESC';
    }

    this.loadDataTable(this.filters);
  }

  /**
   * Checks if lazy load should be suppressed (due to a table reset) and handles it.
   * @returns {boolean} True if lazy load is suppressed, false otherwise.
   */
  private shouldSuppressLazyLoad(): boolean {
    if (this.stopLazyLoad) {
      this.stopLazyLoad = false;
      this.loadDataTable(this.filters);
      return true;
    }
    return false;
  }

  /**
   * Manages the sort state cycle and resets sort filters if needed.
   * @returns {boolean} True if the sort reset triggered a table reset (and further processing should stop).
   */
  private handleSortToggle(event: TableLazyLoadEvent): boolean {
    if (this.isInitialized) {
      if (this.filters['sortBy']) {
        if (this.filters['sortBy'] !== event.sortField) {
          this.isSorted = true;
          return false;
        }
      }

      if (event.first! !== 0) {
        return false;
      }

      if (this.first > event.first!) {
        return false;
      }

      if (this.isSorted === null || this.isSorted === undefined) {
        this.isSorted = true;
      } else if (this.isSorted === true) {
        this.isSorted = false;
      } else if (this.isSorted === false) {
        this.isSorted = null;
        const {sortBy, sortOrder, ...restFilters} = this.filters;
        this.filters = {...restFilters};

        // Set flag to skip processing the lazy load event triggered by reset.
        this.stopLazyLoad = true;
        this.dataTable?.reset();
        return true;
      }
    } else {
      // Mark as initialized on first load.
      this.isInitialized = true;
    }
    return false;
  }

  protected abstract loadDataTable(filters: DataTableFilter): void;

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
