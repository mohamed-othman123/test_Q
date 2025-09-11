import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPaymentMethodsComponent } from './client-payment-methods.component';

describe('ClientPaymentMethodsComponent', () => {
  let component: ClientPaymentMethodsComponent;
  let fixture: ComponentFixture<ClientPaymentMethodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientPaymentMethodsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPaymentMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
