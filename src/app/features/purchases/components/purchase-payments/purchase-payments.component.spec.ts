import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasePaymentsComponent } from './purchase-payments.component';

describe('PurchasePaymentsComponent', () => {
  let component: PurchasePaymentsComponent;
  let fixture: ComponentFixture<PurchasePaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PurchasePaymentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PurchasePaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
