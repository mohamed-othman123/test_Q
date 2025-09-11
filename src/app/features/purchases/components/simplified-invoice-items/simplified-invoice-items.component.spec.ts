import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimplifiedInvoiceItemsComponent } from './simplified-invoice-items.component';

describe('SimplifiedInvoiceItemsComponent', () => {
  let component: SimplifiedInvoiceItemsComponent;
  let fixture: ComponentFixture<SimplifiedInvoiceItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SimplifiedInvoiceItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimplifiedInvoiceItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
