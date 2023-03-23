import { TestBed } from '@angular/core/testing';

import { ChangePaymentMethodService } from './change-payment-method.service';

describe('ChangePaymentMethodService', () => {
  let service: ChangePaymentMethodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangePaymentMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
