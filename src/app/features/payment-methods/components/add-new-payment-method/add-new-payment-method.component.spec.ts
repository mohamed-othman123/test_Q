import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewPaymentMethodComponent } from './add-new-payment-method.component';

describe('AddNewPaymentMethodComponent', () => {
  let component: AddNewPaymentMethodComponent;
  let fixture: ComponentFixture<AddNewPaymentMethodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddNewPaymentMethodComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewPaymentMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
