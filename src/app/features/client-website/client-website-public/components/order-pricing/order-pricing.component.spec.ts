import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPricingComponent } from './order-pricing.component';

describe('OrderPricingComponent', () => {
  let component: OrderPricingComponent;
  let fixture: ComponentFixture<OrderPricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPricingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
