import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { expensesItemsResolver } from './expenses-items.resolver';

describe('expensesItemsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => expensesItemsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
