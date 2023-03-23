import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePaymentMethodComponent } from './change-payment-method.component';

describe('ChangePaymentMethodComponent', () => {
  let component: ChangePaymentMethodComponent;
  let fixture: ComponentFixture<ChangePaymentMethodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangePaymentMethodComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangePaymentMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
