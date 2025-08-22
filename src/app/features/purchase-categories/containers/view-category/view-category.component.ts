import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LanguageService} from '@core/services';
import {ExpensesItem} from '@expenses-items/models';
import {ExpensesItemsService} from '@expenses-items/services/expenses-items.service';
import {HallsService} from '@halls/services/halls.service';
import {PurchaseCategory} from '@purchase-categories/models/purchase-category.model';
import {PurchaseCategoriesService} from '@purchase-categories/services/purchase-categories.service';

@Component({
  selector: 'app-view-category',
  standalone: false,
  templateUrl: './view-category.component.html',
  styleUrl: './view-category.component.scss',
})
export class ViewCategoryComponent implements OnInit {
  categoryId: number | null = null;
  category: PurchaseCategory | null = null;
  expenseItems: ExpensesItem[] = [];

  constructor(
    private purchaseCategoriesService: PurchaseCategoriesService,
    private expensesItemsService: ExpensesItemsService,
    private route: ActivatedRoute,
    private hallsService: HallsService,
    public lang: LanguageService,
    private router: Router,
  ) {
    this.categoryId = this.route.snapshot.params['categoryId'];
  }

  ngOnInit(): void {
    this.getCategoryData();
  }

  getCategoryData() {
    if (this.categoryId) {
      this.purchaseCategoriesService
        .getCategoryById(this.categoryId)
        .subscribe((category) => {
          this.category = category;
        });
    }
  }

  navigateBack() {
    this.router.navigate(['/purchase-categories']);
  }
}
