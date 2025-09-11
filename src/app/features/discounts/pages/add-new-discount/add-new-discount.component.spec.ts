import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewDiscountComponent } from './add-new-discount.component';

describe('AddNewDiscountComponent', () => {
  let component: AddNewDiscountComponent;
  let fixture: ComponentFixture<AddNewDiscountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddNewDiscountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
