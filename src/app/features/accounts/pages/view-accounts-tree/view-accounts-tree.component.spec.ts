import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAccountsTreeComponent } from './view-accounts-tree.component';

describe('ViewAccountsTreeComponent', () => {
  let component: ViewAccountsTreeComponent;
  let fixture: ComponentFixture<ViewAccountsTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewAccountsTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAccountsTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
