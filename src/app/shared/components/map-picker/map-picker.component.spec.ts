import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapPickerComponent } from './map-picker.component';

describe('MapPickerComponent', () => {
  let component: MapPickerComponent;
  let fixture: ComponentFixture<MapPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapPickerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MapPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
