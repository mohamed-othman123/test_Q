import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSignatureComponent } from './customer-signature.component';

describe('CustomerSignatureComponent', () => {
  let component: CustomerSignatureComponent;
  let fixture: ComponentFixture<CustomerSignatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerSignatureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomerSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
