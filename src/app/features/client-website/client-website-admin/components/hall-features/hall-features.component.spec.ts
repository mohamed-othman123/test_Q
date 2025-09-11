import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HallFeaturesComponent } from './hall-features.component';

describe('HallFeaturesComponent', () => {
  let component: HallFeaturesComponent;
  let fixture: ComponentFixture<HallFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HallFeaturesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HallFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
