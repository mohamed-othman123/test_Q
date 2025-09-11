import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptPrintComponent } from './receipt-print.component';

describe('ReceiptPrintComponent', () => {
  let component: ReceiptPrintComponent;
  let fixture: ComponentFixture<ReceiptPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReceiptPrintComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReceiptPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
