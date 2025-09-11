import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsCostComponent } from './products-cost.component';

describe('ProductsCostComponent', () => {
  let component: ProductsCostComponent;
  let fixture: ComponentFixture<ProductsCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductsCostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
