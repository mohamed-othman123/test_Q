import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingDepartmentsComponent } from './landing-departments.component';

describe('LandingDepartmentsComponent', () => {
  let component: LandingDepartmentsComponent;
  let fixture: ComponentFixture<LandingDepartmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingDepartmentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandingDepartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
