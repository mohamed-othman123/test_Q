import { TestBed } from '@angular/core/testing';

import { PriceRequestService } from './price-request.service';

describe('PriceRequestService', () => {
  let service: PriceRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriceRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
