import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { priceRequestResolver } from './price-request.resolver';

describe('priceRequestResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => priceRequestResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
