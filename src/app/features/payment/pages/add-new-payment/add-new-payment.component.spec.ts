import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewPaymentComponent } from './add-new-payment.component';

describe('AddNewPaymentComponent', () => {
  let component: AddNewPaymentComponent;
  let fixture: ComponentFixture<AddNewPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddNewPaymentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
