import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { viewPaymentsResolver } from './view-payments.resolver';

describe('viewPaymentsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => viewPaymentsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
