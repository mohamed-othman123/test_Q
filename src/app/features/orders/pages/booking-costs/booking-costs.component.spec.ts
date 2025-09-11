import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingCostsComponent } from './booking-costs.component';

describe('BookingCostsComponent', () => {
  let component: BookingCostsComponent;
  let fixture: ComponentFixture<BookingCostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookingCostsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingCostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
