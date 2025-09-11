import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewExpenseItemComponent } from './add-new-expense-item.component';

describe('AddNewExpenseItemComponent', () => {
  let component: AddNewExpenseItemComponent;
  let fixture: ComponentFixture<AddNewExpenseItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddNewExpenseItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewExpenseItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
