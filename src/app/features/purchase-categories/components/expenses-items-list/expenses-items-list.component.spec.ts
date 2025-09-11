import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesItemsListComponent } from './expenses-items-list.component';

describe('ExpensesItemsListComponent', () => {
  let component: ExpensesItemsListComponent;
  let fixture: ComponentFixture<ExpensesItemsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpensesItemsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesItemsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
