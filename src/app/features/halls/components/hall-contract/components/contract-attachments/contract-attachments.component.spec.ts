import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractAttachmentsComponent } from './contract-attachments.component';

describe('ContractAttachmentsComponent', () => {
  let component: ContractAttachmentsComponent;
  let fixture: ComponentFixture<ContractAttachmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContractAttachmentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContractAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
