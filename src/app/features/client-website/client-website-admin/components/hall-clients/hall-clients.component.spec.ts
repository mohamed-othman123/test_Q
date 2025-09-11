import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HallClientsComponent } from './hall-clients.component';

describe('HallClientsComponent', () => {
  let component: HallClientsComponent;
  let fixture: ComponentFixture<HallClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HallClientsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HallClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
