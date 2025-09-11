import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAuditTransactionComponent } from './view-audit-transaction.component';

describe('ViewAuditTransactionComponent', () => {
  let component: ViewAuditTransactionComponent;
  let fixture: ComponentFixture<ViewAuditTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewAuditTransactionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAuditTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
