import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditTransactionsListComponent } from './audit-transactions-list.component';

describe('AuditTransactionsListComponent', () => {
  let component: AuditTransactionsListComponent;
  let fixture: ComponentFixture<AuditTransactionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuditTransactionsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditTransactionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
