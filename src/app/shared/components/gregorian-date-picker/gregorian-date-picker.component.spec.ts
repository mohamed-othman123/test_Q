import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GregorianDatePickerComponent } from './gregorian-date-picker.component';

describe('GregorianDatePickerComponent', () => {
  let component: GregorianDatePickerComponent;
  let fixture: ComponentFixture<GregorianDatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GregorianDatePickerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GregorianDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
