import { TestBed } from '@angular/core/testing';

import { CustomerSignatureService } from './customer-signature.service';

describe('CustomerSignatureService', () => {
  let service: CustomerSignatureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerSignatureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
