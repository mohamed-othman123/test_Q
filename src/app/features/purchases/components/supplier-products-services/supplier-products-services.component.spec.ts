import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierProductsServicesComponent } from './supplier-products-services.component';

describe('SupplierProductsServicesComponent', () => {
  let component: SupplierProductsServicesComponent;
  let fixture: ComponentFixture<SupplierProductsServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupplierProductsServicesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierProductsServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
