import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceRequestDetailsComponent } from './price-request-details.component';

describe('PriceRequestDetailsComponent', () => {
  let component: PriceRequestDetailsComponent;
  let fixture: ComponentFixture<PriceRequestDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PriceRequestDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PriceRequestDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
