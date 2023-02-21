import { TestBed } from '@angular/core/testing';

import { DonationApplicationService } from './donation-application.service';

describe('DonationApplicationService', () => {
  let service: DonationApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DonationApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
