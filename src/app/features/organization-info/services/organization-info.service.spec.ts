import { TestBed } from '@angular/core/testing';

import { OrganizationInfoService } from './organization-info.service';

describe('OrganizationInfoService', () => {
  let service: OrganizationInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
