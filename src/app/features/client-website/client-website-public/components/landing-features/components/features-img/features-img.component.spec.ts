import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesImgComponent } from './features-img.component';

describe('FeaturesImgComponent', () => {
  let component: FeaturesImgComponent;
  let fixture: ComponentFixture<FeaturesImgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeaturesImgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturesImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
