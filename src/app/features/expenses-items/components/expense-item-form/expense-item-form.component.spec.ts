import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseItemFormComponent } from './expense-item-form.component';

describe('ExpenseItemFormComponent', () => {
  let component: ExpenseItemFormComponent;
  let fixture: ComponentFixture<ExpenseItemFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpenseItemFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpenseItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
