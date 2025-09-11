import { TestBed } from '@angular/core/testing';

import { PurchasePaymentService } from './purchase-payment.service';

describe('PurchasePaymentService', () => {
  let service: PurchasePaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchasePaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
