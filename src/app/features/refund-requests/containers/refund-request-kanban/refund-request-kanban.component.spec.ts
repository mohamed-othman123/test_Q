import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundRequestKanbanComponent } from './refund-request-kanban.component';

describe('RefundRequestKanbanComponent', () => {
  let component: RefundRequestKanbanComponent;
  let fixture: ComponentFixture<RefundRequestKanbanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RefundRequestKanbanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefundRequestKanbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
