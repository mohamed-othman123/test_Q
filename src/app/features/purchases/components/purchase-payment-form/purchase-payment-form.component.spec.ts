import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasePaymentFormComponent } from './purchase-payment-form.component';

describe('PurchasePaymentFormComponent', () => {
  let component: PurchasePaymentFormComponent;
  let fixture: ComponentFixture<PurchasePaymentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PurchasePaymentFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PurchasePaymentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
