import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierPaymentMethodsComponent } from './supplier-payment-methods.component';

describe('SupplierPaymentMethodsComponent', () => {
  let component: SupplierPaymentMethodsComponent;
  let fixture: ComponentFixture<SupplierPaymentMethodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupplierPaymentMethodsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierPaymentMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
