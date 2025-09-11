import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IslamicDatePickerComponent } from './islamic-date-picker.component';

describe('IslamicDatePickerComponent', () => {
  let component: IslamicDatePickerComponent;
  let fixture: ComponentFixture<IslamicDatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IslamicDatePickerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IslamicDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
