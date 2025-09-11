import { TestBed } from '@angular/core/testing';

import { ServicesResolver } from './services.resolver';

describe('ServicesResolver', () => {
  let resolver: ServicesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ServicesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
