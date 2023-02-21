import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSetupComponent } from './payment-setup.component';

describe('PaymentSetupComponent', () => {
  let component: PaymentSetupComponent;
  let fixture: ComponentFixture<PaymentSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
