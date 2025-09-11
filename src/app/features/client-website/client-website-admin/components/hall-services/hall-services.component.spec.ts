import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HallServicesComponent } from './hall-services.component';

describe('HallServicesComponent', () => {
  let component: HallServicesComponent;
  let fixture: ComponentFixture<HallServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HallServicesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HallServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
