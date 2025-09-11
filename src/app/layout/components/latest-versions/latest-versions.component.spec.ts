import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestVersionsComponent } from './latest-versions.component';

describe('LatestVersionsComponent', () => {
  let component: LatestVersionsComponent;
  let fixture: ComponentFixture<LatestVersionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LatestVersionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LatestVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
