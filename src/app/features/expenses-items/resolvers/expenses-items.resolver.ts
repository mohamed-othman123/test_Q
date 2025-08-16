import {inject} from '@angular/core';
import {ResolveFn} from '@angular/router';
import {ExpensesItemsService} from '@expenses-items/services/expenses-items.service';
import {HallsService} from '@halls/services/halls.service';
import {PurchaseCategoriesService} from '@purchase-categories/services/purchase-categories.service';
import {combineLatest, map} from 'rxjs';

export const expensesItemsResolver: ResolveFn<any> = (route, state) => {
  const expensesItemsService = inject(ExpensesItemsService);
  const hallsService = inject(HallsService);
  const purchaseCategoriesService = inject(PurchaseCategoriesService);

  const id = route.params['id'];
  const mode = route.data['mode'];
  const hallId = hallsService.getCurrentHall()?.id;

  const categories$ = purchaseCategoriesService
    .getAll({
      type: 'General',
      hallId,
    })
    .pipe(map((data) => data.items));

  if (mode === 'add') {
    return combineLatest({
      categories: categories$,
    });
  }

  const item$ = expensesItemsService.getExpenseItemById(id);
  const elements$ = expensesItemsService
    .getExpenseElements({
      itemId: id,
      hallId,
    })
    .pipe(map((data) => data.items));

  if (mode === 'view') {
    return combineLatest({
      item: item$,
      elements: elements$,
    });
  }

  return combineLatest({
    categories: categories$,
    item: item$,
    elements: elements$,
  });
};
