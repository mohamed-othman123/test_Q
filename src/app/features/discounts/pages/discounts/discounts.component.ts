import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Filter} from '@core/interfaces';
import {DataTableFilter} from '@core/models';
import {FilterService, LanguageService} from '@core/services';
import {DrawerService} from '@core/services/drawer.service';
import {DISCOUNT_TYPES} from '@discounts/constants/discounts.constants';
import {Discount} from '@discounts/models/discounts.model';
import {DiscountsService} from '@discounts/services/discounts.service';
import {DiscountType} from '@orders/models';
import {Table} from 'primeng/table';

@Component({
    selector: 'app-discounts',
    templateUrl: './discounts.component.html',
    styleUrl: './discounts.component.scss',
    standalone: false
})
export class DiscountsComponent extends Filter implements OnInit {
  @ViewChild('dt2')
  override dataTable!: Table;

  discounts!: Discount[];

  discountTypes = DISCOUNT_TYPES;

  protected override filterConfig: {[key: string]: unknown} = {
    name: [null],
    value: [null],
    type: [null],
    note: [null],
  };

  constructor(
    protected override filterService: FilterService,
    private discountService: DiscountsService,
    public lang: LanguageService,
    private drawerService: DrawerService,
  ) {
    super(filterService);
  }

  refreshData() {
    this.loadDataTable(this.filters);
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    const sub = this.discountService
      .getAllDiscounts(filters)
      .subscribe((data) => {
        this.discounts = data.items;
      });

    this.subs.add(sub);
  }

  addNewDiscount() {
    this.drawerService.open({
      mode: 'add',
      title: 'discounts.addNewDiscount',
    });
  }

  deleteDiscount(discount: Discount) {
    this.discountService.deleteDiscount(discount.id!).subscribe(() => {
      this.refreshData();
    });
  }

  viewDiscount(event: Event, discount: Discount) {
    event.stopPropagation();
    this.drawerService.open({
      mode: 'view',
      title: 'discounts.viewDiscount',
      data: discount,
    });
  }

  updateDiscount(event: Event, discount: Discount) {
    event.stopPropagation();
    this.drawerService.open({
      mode: 'edit',
      title: 'discounts.editDiscount',
      data: discount,
    });
  }
}
