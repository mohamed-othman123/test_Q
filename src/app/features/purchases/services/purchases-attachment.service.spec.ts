import { TestBed } from '@angular/core/testing';

import { PurchasesAttachmentService } from './purchases-attachment.service';

describe('PurchasesAttachmentService', () => {
  let service: PurchasesAttachmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchasesAttachmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
