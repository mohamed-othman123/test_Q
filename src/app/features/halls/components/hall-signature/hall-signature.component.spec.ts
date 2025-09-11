import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HallSignatureComponent } from './hall-signature.component';

describe('HallSignatureComponent', () => {
  let component: HallSignatureComponent;
  let fixture: ComponentFixture<HallSignatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HallSignatureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HallSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
