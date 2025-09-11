import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesCostComponent } from './services-cost.component';

describe('ServicesCostComponent', () => {
  let component: ServicesCostComponent;
  let fixture: ComponentFixture<ServicesCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServicesCostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
