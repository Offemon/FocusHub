import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MccConfirm } from './mcc-confirm';

describe('MccConfirm', () => {
  let component: MccConfirm;
  let fixture: ComponentFixture<MccConfirm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MccConfirm],
    }).compileComponents();

    fixture = TestBed.createComponent(MccConfirm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
