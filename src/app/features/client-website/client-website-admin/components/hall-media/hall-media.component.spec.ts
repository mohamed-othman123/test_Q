import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HallMediaComponent } from './hall-media.component';

describe('HallMediaComponent', () => {
  let component: HallMediaComponent;
  let fixture: ComponentFixture<HallMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HallMediaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HallMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
